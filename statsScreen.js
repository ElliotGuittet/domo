import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert, TouchableOpacity } from "react-native";
import { db, auth } from "./firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const StatsScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriendsView, setIsFriendsView] = useState(false); // For toggling between general and friends leaderboard
  const [friends, setFriends] = useState([]); // List of user's friends

  // Fetch the friends list of the current user
  const fetchFriends = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().friends) {
      // Add the current user's ID to the list of friends
      const friendIds = [user.uid, ...userDoc.data().friends]; // Include the current user

      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const friendRef = doc(db, "users", friendId);
          const friendSnap = await getDoc(friendRef);
          return friendSnap.exists()
            ? { id: friendId, name: `${friendSnap.data().firstName} ${friendSnap.data().lastName}` }
            : null;
        })
      );

      // Filter out null values (if any)
      setFriends(friendsData.filter(friend => friend !== null));
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const resultsSnapshot = await getDocs(collection(db, "quiz_results"));
        let usersData = [];
        const currentUser = auth.currentUser;

        // Fetch quiz results for users
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
                isCurrentUser: userId === currentUser?.uid, // Mark the current user
              });
            }
          }
        }

        // Sort leaderboard by score in descending order
        usersData.sort((a, b) => b.score - a.score);
        setLeaderboard(usersData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        Alert.alert("Error", "Unable to fetch statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchFriends(); // Fetch the friends list on component mount
  }, []);

  const handleToggleView = () => {
    setIsFriendsView((prevState) => !prevState);
  };

  // Filter the leaderboard to show only friends when toggling to the friends view
    const filteredLeaderboard = isFriendsView
      ? leaderboard.filter((item) => {
          // Include the current user in the friends leaderboard view
          return item.id === auth.currentUser.uid || friends.some((friend) => friend.id === item.id);
        })
      : leaderboard;

  if (loading) return <ActivityIndicator size="large" color="#357" />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Classement des Joueurs 🏆</Text>

      {/* Toggle button for switching between general leaderboard and friends leaderboard */}
      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleView}>
        <Text style={styles.toggleButtonText}>
          {isFriendsView ? "Voir le Classement Général" : "Voir mes Amis"}
        </Text>
      </TouchableOpacity>

      {/* Display leaderboard */}
      {filteredLeaderboard.length === 0 ? (
        <Text style={styles.noData}>Aucune donnée disponible.</Text>
      ) : (
        <FlatList
          data={filteredLeaderboard}
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
    elevation: 3,
  },
  rankContainer: { width: 50, alignItems: "center" },
  rank: { fontSize: 22, fontWeight: "bold", color: "#357" },
  infoContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#222" },
  scoreText: { fontSize: 16, color: "#555", marginTop: 5 },
  percentageText: { fontSize: 16, color: "#555", marginTop: 5 },
  toggleButton: {
    backgroundColor: "#357",
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonText: { color: "#fff", fontSize: 18 },
});

export default StatsScreen;
