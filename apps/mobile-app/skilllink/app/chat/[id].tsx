import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { io, Socket } from "socket.io-client";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
};

const initialMessages: Message[] = [
  { id: "1", text: "Hola, vi tu perfil", sender: "other", timestamp: "10:30" },
  { id: "2", text: "¡Hola! Claro, dime", sender: "me", timestamp: "10:31" },
  { id: "3", text: "¿Cuánto cobrás por hora?", sender: "other", timestamp: "10:32" },
];

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const flatListRef = useRef<FlatList<Message>>(null);

  // Conexión al socket
  useEffect(() => {
    if (!id) return;

    const newSocket = io("http://192.168.100.160:3003", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.emit("join_chat", id);

    newSocket.on("receive_message", (data) => {
      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        text: data.content,
        sender: data.senderId === 9 ? "me" : "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
    });

    newSocket.on("previous_messages", (prevMessages) => {
      const formattedMessages: Message[] = prevMessages.map((msg: any, index: number) => ({
        id: `prev-${index}`,
        text: msg.message_text,
        sender: msg.sender_user_id === 9 ? "me" : "other",
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessages(formattedMessages);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socket || !id) return;

    const messageData = {
      requestId: '4', 
      senderId: 9,
      content: text,
    };

    socket.emit("send_message", messageData);

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender === "me"
                ? styles.myMessageContainer
                : styles.otherMessageContainer,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.sender === "me"
                  ? styles.myBubble
                  : styles.otherBubble,
              ]}
            >
              <Text
                style={
                  item.sender === "me"
                    ? styles.bubbleText
                    : styles.otherBubbleText
                }
              >
                {item.text}
              </Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje…"
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  messages: {
    padding: 16,
    paddingBottom: 90,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#ffffff",
  },
  otherBubbleText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#1e293b",
  },
  timestamp: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});