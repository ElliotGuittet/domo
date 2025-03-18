import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "./firebaseConfig";
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs } from "firebase/firestore";

const FriendsScreen = () => {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().friends) {
        const friendIds = userDoc.data().friends;
        // Récupérer les informations des amis à partir de leurs IDs
        const friendsData = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendRef = doc(db, "users", friendId);
            const friendDoc = await getDoc(friendRef);
            return friendDoc.exists() ? { id: friendId, ...friendDoc.data() } : null;
          })
        );
        setFriends(friendsData.filter(friend => friend !== null)); // Filtrer les amis invalides
      }
    };

    fetchFriends();
  }, []);

  const handleAddFriend = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer une adresse e-mail.");
      return;
    }

    try {
      // Rechercher l'utilisateur par email dans Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email)); // On cherche l'email dans Firestore
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Erreur", "Aucun utilisateur trouvé avec cette adresse e-mail.");
        return;
      }

      let friendData = null;
      querySnapshot.forEach((doc) => {
        friendData = { id: doc.id, ...doc.data() }; // On récupère l'UID et les infos de l'ami
      });

      if (!friendData) {
        Alert.alert("Erreur", "Utilisateur introuvable.");
        return;
      }

      const fullName = `${friendData.firstName} ${friendData.lastName}`;

      // Demander confirmation avant d'ajouter l'ami
      Alert.alert(
        "Confirmation",
        `Voulez-vous ajouter ${fullName} comme ami ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Ajouter",
            onPress: async () => {
              try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                  Alert.alert("Erreur", "Vous devez être connecté pour ajouter un ami.");
                  return;
                }

                const currentUserRef = doc(db, "users", currentUser.uid);
                await updateDoc(currentUserRef, {
                  friends: arrayUnion(friendData.id), // On stocke l'UID et non l'email
                });

                // Mettre à jour les amis localement
                setFriends((prevFriends) => [...prevFriends, { id: friendData.id, firstName: friendData.firstName, lastName: friendData.lastName }]);
                Alert.alert("Succès", `${fullName} a été ajouté à vos amis !`);
                setEmail(""); // Réinitialiser l'email après l'ajout
              } catch (error) {
                Alert.alert("Erreur", "Impossible d'ajouter cet ami.");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de rechercher cet utilisateur.");
    }
  };

  // Fonction pour supprimer un ami
  const handleRemoveFriend = async (friendId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Erreur", "Vous devez être connecté pour supprimer un ami.");
      return;
    }

    // Demander confirmation avant de supprimer
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet ami ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              const currentUserRef = doc(db, "users", currentUser.uid);
              await updateDoc(currentUserRef, {
                friends: arrayRemove(friendId), // Supprimer l'ID de l'ami de la liste
              });

              // Mettre à jour les amis localement
              setFriends((prevFriends) => prevFriends.filter(friend => friend.id !== friendId));
              Alert.alert("Succès", "L'ami a été supprimé !");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer cet ami.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Amis</Text>

      {/* Liste des amis */}
      {friends.length === 0 ? (
        <Text style={styles.noFriends}>Aucun ami pour le moment.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text style={styles.friendName}>{item.firstName} {item.lastName}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveFriend(item.id)} // Appeler la fonction de suppression
              >
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Champ pour entrer un email */}
      <TextInput
        style={styles.input}
        placeholder="Entrez l'email d'un ami"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Bouton Ajouter un Ami */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
        <Text style={styles.buttonText}>Ajouter un Ami</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  noFriends: { fontSize: 18, color: "gray", textAlign: "center", marginTop: 20 },
  friendItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#ddd", borderRadius: 8, marginVertical: 5 },
  friendName: { fontSize: 18 },
  deleteButton: { backgroundColor: "#d9534f", padding: 8, borderRadius: 5 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
  addButton: { backgroundColor: "#5cb85c", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18 },
});

export default FriendsScreen;
