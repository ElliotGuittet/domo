import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getAuth, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const ChangeEmailScreen = () => {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleUpdateEmail = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) throw new Error("Utilisateur non connecté.");

      // Vérification si l'email actuel est validé, sinon on demande la vérification.
      if (!user.emailVerified) {
        throw new Error("Veuillez vérifier votre email avant de le modifier.");
      }

      // Ré-authentifier l'utilisateur avec son mot de passe actuel
      if (!password) throw new Error("Veuillez entrer votre mot de passe actuel.");

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Changer l'email
      await updateEmail(user, newEmail);

      Alert.alert("Succès", "Votre email a été mis à jour.");

      // Rediriger ou demander à l'utilisateur de se reconnecter avec le nouveau mail (facultatif)
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nouvel email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe actuel"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateEmail} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Modifier l'Email</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: 300,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#357",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default ChangeEmailScreen;
