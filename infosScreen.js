import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs, orderBy, query, addDoc, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";

const InfosScreen = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
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

  const addNote = async () => {
    if (!titre.trim() || !description.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté.");
      return;
    }

    try {
      await addDoc(collection(db, "infos_pratiques"), {
        titreInfo: titre,
        descriptionInfo: description,
        userId: user.uid,
      });

      setTitre("");
      setDescription("");
      setShowForm(false);
      fetchNotes();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'ajout de la note.");
      console.error(error);
    }
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
              <Text style={styles.noteTitle}>{item.titreInfo}</Text>
              <Text style={styles.noteDescription}>{item.descriptionInfo}</Text>
            </View>
          )}
        />
      )}

      {/* Formulaire d'ajout */}
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
          <TouchableOpacity style={styles.addButton} onPress={addNote}>
            <Text style={styles.addButtonText}>Ajouter une note</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton pour afficher le formulaire */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => setShowForm(!showForm)}>
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
  noteTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  noteDescription: {
    fontSize: 14,
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    minHeight: 80,
  },
  addButton: {
    backgroundColor: "#eb4941",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
