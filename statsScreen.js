import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const StatsScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const resultsSnapshot = await getDocs(collection(db, "quiz_results"));
        let usersData = [];

        for (const quizDoc of resultsSnapshot.docs) {
          const userId = quizDoc.id;
          const quizData = quizDoc.data();

          if (quizData.score !== undefined && quizData.total !== undefined) {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              const fullName = `${userData.firstName} ${userData.lastName}`;
              const age = userData.age || "N/A";
              const successRate = ((quizData.score / quizData.total) * 100).toFixed(2);

              usersData.push({
                id: userId,
                name: fullName,
                age: age,
                score: quizData.score,
                total: quizData.total,
                successRate: successRate,
              });
            }
          }
        }

        usersData.sort((a, b) => b.score - a.score);
        setLeaderboard(usersData);
      } catch (error) {
        console.error("Erreur récupération stats:", error);
        Alert.alert("Erreur", "Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#357" />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Classement des Joueurs 🏆</Text>

      {leaderboard.length === 0 ? (
        <Text style={styles.noData}>Aucune donnée disponible.</Text>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.userRow}>
              <View style={styles.rankContainer}>
                <Text style={styles.rank}>#{index + 1}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name} ({item.age} ans)</Text>
                <Text style={styles.scoreText}>
                  ✅ {item.score} / {item.total}
                </Text>
                <Text style={styles.percentageText}>
                  📊 {item.successRate}%
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  heading: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  noData: { fontSize: 18, textAlign: "center", marginTop: 20, color: "#777" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  rankContainer: { width: 50, alignItems: "center" },
  rank: { fontSize: 22, fontWeight: "bold", color: "#357" },
  infoContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#222" },
  scoreText: { fontSize: 16, color: "#555", marginTop: 5 },
  percentageText: { fontSize: 16, color: "#555", marginTop: 5 },
});

export default StatsScreen;
