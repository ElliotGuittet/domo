import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { db, auth } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setAge(data.age || "");
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Utilisateur non connecté.");

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { firstName, lastName, age }, { merge: true });

      Alert.alert("Succès", "Profil mis à jour !");

      // Rediriger vers la HomeScreen après la mise à jour réussie
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Âge"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enregistrer</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Modifier Mot de Passe")}
      >
        <Text style={styles.buttonText}>Modifier le Mot de Passe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  input: { width: 300, padding: 10, marginVertical: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
  button: { backgroundColor: "#357", padding: 10, borderRadius: 5, marginVertical: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18 },
});

export default PersonalInfoScreen;
