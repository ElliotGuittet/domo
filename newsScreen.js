import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(
          collection(db, "news_japon"),
          orderBy("publishedAt", "desc") // Trier par date de publication la plus récente
        );
        const querySnapshot = await getDocs(newsQuery);
        const fetchedNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNews(fetchedNews);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les actualités.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#357" />;

  const renderItem = ({ item }) => (
    <View style={styles.newsItem}>
      {/* Image de l'actualité */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      ) : null}

      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsDescription}>{item.description}</Text>
      <Text style={styles.newsDate}>
        {new Date(item.publishedAt.seconds * 1000).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Actualités du Japon</Text>
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  newsItem: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
    resizeMode: "cover",
  },
  newsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  newsDescription: { fontSize: 16, marginBottom: 5 },
  newsDate: { fontSize: 14, color: "#777" },
});

export default NewsScreen;
