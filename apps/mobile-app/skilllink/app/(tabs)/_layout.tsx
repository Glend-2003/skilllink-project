import { Tabs } from "expo-router";
import { Home, Search, MessageCircle, History } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 78 : 64,
          paddingTop: 8,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <Search color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color }) => (
            <History color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}