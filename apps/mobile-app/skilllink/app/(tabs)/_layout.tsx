import { Tabs } from "expo-router";
import { Home, MessageCircle } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 78 : 64,
          paddingTop: 8,
          borderTopWidth: 0.5,
          backgroundColor: 'white',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={22} />
          ),
          tabBarLabel: 'Inicio',
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color} size={22} />
          ),
          tabBarLabel: 'Chats',
        }}
      />
    </Tabs>
  );
}