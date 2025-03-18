// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser; // Récupérer l'utilisateur connecté
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid); // Utiliser l'ID de l'utilisateur connecté
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.log("Aucun utilisateur trouvé");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          Alert.alert("Erreur", "Impossible de récupérer les informations de l'utilisateur.");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate("Login"); // Redirige vers la page de login après déconnexion
    } catch (error) {
      console.log("Erreur de déconnexion:", error.message);
    }
  };

  const isUserDataComplete = () => {
    return userData && userData.firstName && userData.lastName && userData.age;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenue, {user?.firstName ?? user?.email}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Informations personnelles")}
      >
        <Text style={styles.buttonText}>Gérer mon profil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Ouvrir listes de quizs")}
      >
        <Text style={styles.buttonText}>Quiz</Text>
      </TouchableOpacity>

      {/* Vérifier si les informations sont complètes avant d'afficher le bouton News */}
      {isUserDataComplete() ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("News")}
        >
          <Text style={styles.buttonText}>News</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.disabledButton]}
          disabled={true}
        >
          <Text style={styles.buttonText}>News (Complétez votre profil)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Stats du quiz")}
      >
        <Text style={styles.buttonText}>Stats quiz</Text>
      </TouchableOpacity>

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
  disabledButton: {
    backgroundColor: '#ddd',
  },
});

export default HomeScreen;
