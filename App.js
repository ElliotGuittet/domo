import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./loginScreen";
import ProfileScreen from "./profileScreen";
import ChangeEmailScreen from "./changeEmailScreen";
import ChangePasswordScreen from "./changePasswordScreen";
import { auth } from "./firebaseConfig"; // Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Écoute l'état de connexion de l'utilisateur Firebase
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

        return () => unsubscribe(); // Nettoyage lors du démontage
      }, []);

      if (loading) {
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#357" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Informations personnelles" component={ProfileScreen} />
            <Stack.Screen name="Modifier Email" component={ChangeEmailScreen} />
            <Stack.Screen name="Modifier Mot de Passe" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
