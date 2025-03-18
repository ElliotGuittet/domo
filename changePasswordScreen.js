import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { auth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "./firebaseConfig";

const ChangePasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Utilisateur non connecté.");

      if (!password || !newPassword) throw new Error("Veuillez entrer les deux mots de passe.");

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      Alert.alert("Succès", "Mot de passe mis à jour !");
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Mot de passe actuel" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Modifier Mot de Passe</Text>}
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

export default ChangePasswordScreen;
