import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList } from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const QuizListScreen = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quiz_list"));
        const fetchedQuizzes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger la liste des quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
    createQuizList();
  }, []);

  const createQuizList = async () => {
    try {
      const quizListRef = doc(db, "quiz_list", "my_quiz_list");
      const quizCollectionRef = collection(db, "quiz");

      const snapshot = await getDocs(quizCollectionRef);
      const quizRefs = snapshot.docs.map(doc => doc.ref.path);

      await setDoc(quizListRef, { quizzes: quizRefs });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la liste des quiz.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#357" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Quiz</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate("Ouvrir quiz", { quizId: item.id })}
          >
            <Text style={styles.quizText}>Appuyez pour commencer</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  quizButton: { backgroundColor: "#357", padding: 15, borderRadius: 5, marginVertical: 5, width: "100%", alignItems: "center" },
  quizText: { color: "#fff", fontSize: 18 }
});

export default QuizListScreen;