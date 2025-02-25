import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { auth, GoogleAuthProvider, signInWithCredential, signOut } from "./firebaseConfig";

const LoginScreen = () => {
  const [userInfo, setUserInfo] = useState(null);

  // Authentification avec Google OAuth 2.0
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "220101478721-7ct72fctst0bilqcs0to8eipvsa04rn6.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUserInfo(userCredential.user);
        })
        .catch((error) => {
          console.error("Erreur d'authentification :", error);
        });
    }
  }, [response]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserInfo(null);
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  return (
    <View style={styles.container}>
      {userInfo ? (
        <View>
          <Text style={styles.text}>Bienvenue, {userInfo.displayName}</Text>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => promptAsync()} disabled={!request}>
          <Text style={styles.buttonText}>Se connecter avec Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#357",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default LoginScreen;
