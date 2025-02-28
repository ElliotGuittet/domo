// HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser; // Récupérer l'utilisateur connecté

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate("Login"); // Redirige vers la page de login après déconnexion
    } catch (error) {
      console.log("Erreur de déconnexion:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenue, {user?.email}</Text>

      {/* Exemple d'un bouton pour aller à une page de gestion du profil */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Informations personnelles")}
      >
        <Text style={styles.buttonText}>Gérer mon profil</Text>
      </TouchableOpacity>

      {/* Exemple d'un bouton pour ouvrir le quiz */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Ouvrir quiz")}
      >
        <Text style={styles.buttonText}>Ouvrir quiz</Text>
      </TouchableOpacity>

      {/* Bouton pour se déconnecter */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#357',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
