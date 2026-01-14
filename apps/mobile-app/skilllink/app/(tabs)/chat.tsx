import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const chats = [
  {
    id: "1",
    name: "Carlos Méndez",
    lastMessage: "Perfecto, hablamos mañana",
    time: "10:45",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "2",
    name: "Ana López",
    lastMessage: "¿Cuánto cobrás por hora?",
    time: "Ayer",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.message} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
  },
  message: {
    color: "#6b7280",
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
  },
});