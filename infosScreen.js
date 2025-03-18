import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs, orderBy, query, addDoc, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";

const InfosScreen = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const notesRef = collection(db, "infos_pratiques");
      const q = query(notesRef, where("userId", "==", user.uid), orderBy("titreInfo"));
      const querySnapshot = await getDocs(q);

      const notesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotes(notesList);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les notes.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!titre.trim() || !description.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté.");
      return;
    }

    try {
      if (editingNote) {
        // Mise à jour d'une note existante
        await updateDoc(doc(db, "infos_pratiques", editingNote.id), {
          titreInfo: titre,
          descriptionInfo: description,
        });
      } else {
        // Ajout d'une nouvelle note
        await addDoc(collection(db, "infos_pratiques"), {
          titreInfo: titre,
          descriptionInfo: description,
          userId: user.uid,
        });
      }

      setTitre("");
      setDescription("");
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'opération.");
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette note ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: async () => {
          try {
            await deleteDoc(doc(db, "infos_pratiques", noteId));
            fetchNotes();
          } catch (error) {
            Alert.alert("Erreur", "Impossible de supprimer la note.");
            console.error(error);
          }
        }}
      ]
    );
  };

  const handleEditNote = (note) => {
    setTitre(note.titreInfo);
    setDescription(note.descriptionInfo);
    setEditingNote(note);
    setShowForm(true);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : notes.length === 0 ? (
        <Text style={styles.emptyMessage}>Aucune note disponible.</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.noteContainer}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{item.titreInfo}</Text>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => handleEditNote(item)}>
                    <AntDesign name="edit" size={20} color="#007AFF" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                    <AntDesign name="delete" size={20} color="#eb4941" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteDescription}>{item.descriptionInfo}</Text>
            </View>
          )}
        />
      )}

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Titre"
            value={titre}
            onChangeText={setTitre}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.descriptionInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleSaveNote}>
            <Text style={styles.addButtonText}>{editingNote ? "Modifier la note" : "Ajouter une note"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.floatingButton} onPress={() => {
        setShowForm(!showForm);
        setEditingNote(null);
        setTitre("");
        setDescription("");
      }}>
        <AntDesign name={showForm ? "close" : "plus"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default InfosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  noteContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  noteDescription: {
    fontSize: 14,
  },
  iconContainer: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#eb4941",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
