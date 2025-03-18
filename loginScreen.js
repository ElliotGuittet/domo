import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setErrorMessage("");
      navigation.navigate("Home"); // Redirige vers Home après l'inscription
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMessage("");
      navigation.navigate("Home"); // Redirige vers Home après la connexion
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (code) => {
    const errorMessages = {
      "auth/email-already-in-use": "Cet e-mail est déjà utilisé.",
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/weak-password": "Mot de passe trop faible.",
      "auth/user-not-found": "Utilisateur non trouvé.",
      "auth/wrong-password": "Mot de passe incorrect.",
    };
    return errorMessages[code] || "Erreur d'authentification ! Veuillez être certain que l'user et le mot de passe correspondent bien.";
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
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
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default LoginScreen;
