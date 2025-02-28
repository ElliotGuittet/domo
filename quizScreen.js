import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { db, auth } from "./firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const QuizScreen = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // Suivi des questions déjà répondues

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizz_japon"));
        const fetchedQuestions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(fetchedQuestions);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les questions.");
      } finally {
        setLoading(false);
      }
    };

    // Vérifier les réponses déjà enregistrées pour l'utilisateur connecté
    const fetchAnsweredQuestions = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userAnswersRef = doc(db, "user_answers", user.uid);
          const userAnswersSnapshot = await getDoc(userAnswersRef);

          if (userAnswersSnapshot.exists()) {
            setAnsweredQuestions(Object.keys(userAnswersSnapshot.data())); // Récupérer les ID des questions répondues
          }
        } catch (error) {
          console.error("Erreur de récupération des réponses", error);
        }
      }
    };

    fetchQuestions();
    fetchAnsweredQuestions();
  }, []);

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);

    let newScore = score;
    const currentQuestion = questions[currentQuestionIndex];

    if (answer === currentQuestion.correctAnswer) {
      newScore = score + 1;
      setScore(newScore);
    }

    const user = auth.currentUser;
    if (user) {
      // Enregistrer la réponse de l'utilisateur dans Firebase
      await setDoc(doc(db, "user_answers", user.uid), {
        [currentQuestion.id]: answer,
      }, { merge: true });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        saveResult(newScore); // Passer le score final
      }
    }, 1000);
  };

  const saveResult = async (finalScore) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "quiz_results", user.uid), {
          score: finalScore, // Utiliser le score correct
          total: questions.length,
          timestamp: new Date(),
        }, { merge: true });

        Alert.alert("Quiz terminé !", `Votre score : ${finalScore}/${questions.length}`);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le score.");
    }
    navigation.navigate("Home");
  };

  if (loading) return <ActivityIndicator size="large" color="#357" />;

  // Filtrer les questions non répondues
  const unansweredQuestions = questions.filter((question) => !answeredQuestions.includes(question.id));

  if (unansweredQuestions.length === 0) {
    Alert.alert("Quiz terminé", "Vous avez répondu à toutes les questions.");
    navigation.navigate("Home");
  }

  const currentQuestion = unansweredQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{currentQuestion?.question}</Text>
      {currentQuestion?.answers.map((answer, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.answerButton, selectedAnswer === answer && styles.selectedAnswer]}
          onPress={() => handleAnswer(answer)}
          disabled={selectedAnswer !== null}
        >
          <Text style={styles.answerText}>{answer}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  question: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  answerButton: { backgroundColor: "#357", padding: 10, borderRadius: 5, marginVertical: 5, alignItems: "center", width: "80%" },
  selectedAnswer: { backgroundColor: "#5a9" },
  answerText: { color: "#fff", fontSize: 16 },
});

export default QuizScreen;
