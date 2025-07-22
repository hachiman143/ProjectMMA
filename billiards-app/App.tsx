import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
// Import screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ClubDetailScreen from "./screens/ClubDetailScreen";
import BookingScreen from "./screens/BookingScreen";
import TournamentScreen from "./screens/TournamentScreen";
import SearchScreen from "./screens/SearchScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BookingHistoryScreen from "./screens/BookingHistoryScreen";
import UsersPage from "@/screens/admin/UsersPage";
import AdminDashboard from "@/screens/admin/AdminDashboard";

// Tạo Stack và Tab navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AdminTab = createBottomTabNavigator();
// Stack riêng cho Home (có thể push tới ClubDetail hoặc Booking)
function HomeStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClubDetail"
        component={ClubDetailScreen}
        options={{ title: "Chi tiết quán" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Đặt bàn" }}
      />
      <Stack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      
    </Stack.Navigator>
  );
}
function AdminTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help";

          if (route.name === "AdminDashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Users") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={require("./screens/admin/AdminDashboard").default}
        options={{ title: "Trang Admin" }}
      />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Users"
        component={UsersPage}
        options={{ title: "Người dùng" }}
      />
     <Tab.Screen
      name="Bookings"
      component={require("./screens/admin/AdminBookingsScreen").default}
      options={{
        title: "Đặt bàn",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={color} />
        ),
      }}
    />

    </Tab.Navigator>
  );
}


// Tabs chính sau khi đăng nhập
function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Gán mặc định iconName để tránh lỗi TypeScript (ts2454)
          let iconName: keyof typeof Ionicons.glyphMap = "help";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "BookingHistory") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Tournament") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "ChatAI") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" options={{ title: "Trang chủ" }}>
        {() => <HomeStack onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Tournament"
        component={TournamentScreen}
        options={{ title: "Giải đấu" }}
      />
      <Tab.Screen
        name="ChatAI"
        component={ChatScreen}
        options={{ title: "Chat AI" }}
      />
      <Tab.Screen
        name="BookingHistory"
        component={BookingHistoryScreen}
        options={{ title: "Lịch sử đặt lịch" }}
      />
    </Tab.Navigator>
  );
}

// App chính
export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
   const handleLogin = (user: any, token: string) => {
    setUser(user);
    setToken(token);
  };
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
  };

   return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user && token ? (
          user.role === "admin" ? (
            <AdminTabs onLogout={handleLogout} />
          ) : (
            <MainTabs onLogout={handleLogout} />
          )
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLogin={handleLogin} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
