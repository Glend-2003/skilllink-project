import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, DeviceEventEmitter, Image } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import ServiceRequestModal from '@/components/ServiceRequestModal';

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
};

type ConversationStatus = 'active' | 'pending' | 'completed' | 'cancelled';

interface Provider {
  id: string;
  providerId?: number;
  name: string;
  category: string;
  rating: number;
  avatar: string;
  verified: boolean;
  profileImageUrl?: string;
}

const mockProviders: Record<string, Provider> = {
  "1": {
    id: "1",
    name: "Carlos Méndez",
    category: "Plomería",
    rating: 4.8,
    avatar: "https://i.pravatar.cc/150?img=3",
    verified: true,
  },
  "2": {
    id: "2",
    name: "Ana López",
    category: "Electricista",
    rating: 4.9,
    avatar: "https://i.pravatar.cc/150?img=5",
    verified: true,
  },
};

const initialMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", text: "Hola, vi tu perfil de plomería", sender: "other", timestamp: "10:30" },
    { id: "2", text: "¡Hola! Claro, ¿en qué puedo ayudarte?", sender: "me", timestamp: "10:31" },
    { id: "3", text: "¿Cuánto cobrás por hora?", sender: "other", timestamp: "10:32" },
    { id: "4", text: "Cobro $25 por hora. ¿Qué tipo de trabajo necesitas?", sender: "me", timestamp: "10:33" },
  ],
  "2": [
    { id: "1", text: "Hola, necesito instalar tomacorrientes", sender: "other", timestamp: "15:20" },
    { id: "2", text: "¡Hola! Claro, puedo ayudarte con eso", sender: "me", timestamp: "15:21" },
  ],
};

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('active');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  // Load previous messages
  const loadPreviousMessages = async () => {
    if (!id || !user) return;
    
    try {
      const response = await fetch(`${Config.CHAT_SERVICE_URL}/api/conversations/${id}/messages`);
      if (response.ok) {
        const prevMessages = await response.json();
        const formattedMessages: Message[] = prevMessages.map((msg: any) => ({
          id: msg.message_id.toString(),
          text: msg.message_text,
          sender: msg.sender_user_id === user.userId ? "me" : "other",
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading previous messages:', error);
    }
  };

  // Fetch conversation and provider info
  useEffect(() => {
    const loadConversationInfo = async () => {
      if (!id || !user) return;

      try {
        console.log('Loading conversation info for:', id, 'user:', user.userId);
        
        // Get conversation details using the new endpoint
        const conversationRes = await fetch(
          `${Config.CHAT_SERVICE_URL}/api/conversations/details/${id}?userId=${user.userId}`
        );
        
        if (!conversationRes.ok) {
          console.error('Conversation not found:', conversationRes.status);
          Alert.alert('Error', 'Conversación no encontrada');
          router.back();
          return;
        }
        
        const conversation = await conversationRes.json();
        console.log('Conversation loaded:', conversation);
        
        if (conversation && conversation.other_user_id) {
          // Fetch provider profile by user_id to get providerId
          const providerProfileRes = await fetch(
            `${Config.PROVIDER_SERVICE_URL}/api/providers/user/${conversation.other_user_id}`
          );
          
          if (providerProfileRes.ok) {
            const providerProfile = await providerProfileRes.json();
            console.log('Provider profile loaded:', providerProfile);
            console.log('Provider profile keys:', Object.keys(providerProfile));
            console.log('Provider ID from profile:', providerProfile.id);
            console.log('Provider providerId from profile:', providerProfile.providerId);
            
            // Try both possible field names
            const actualProviderId = providerProfile.id || providerProfile.providerId;
            console.log('Using providerId:', actualProviderId);
            
            setProvider({
              id: conversation.other_user_id.toString(),
              providerId: actualProviderId,
              name: providerProfile.businessName || conversation.other_user_email || 'Proveedor',
              category: providerProfile.category || 'Servicios',
              rating: providerProfile.rating || 0,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.other_user_id}`,
              verified: providerProfile.verified || false,
              profileImageUrl: providerProfile.profileImageUrl,
            });
          } else {
            const errorText = await providerProfileRes.text();
            console.log('Not a provider - status:', providerProfileRes.status, 'error:', errorText);
            setProvider({
              id: conversation.other_user_id.toString(),
              name: conversation.other_user_email || 'Usuario',
              category: 'Usuario',
              rating: 0,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.other_user_id}`,
              verified: false,
            });
          }
        }
      } catch (error) {
        console.error('Error loading conversation info:', error);
        Alert.alert('Error', 'No se pudo cargar la información de la conversación');
        router.back();
      }
    };

    loadConversationInfo();
  }, [id, user]);

  useEffect(() => {
  }, [id]);

  useEffect(() => {
    console.log('useEffect triggered, id:', id, 'user:', user, 'isLoading:', isLoading);
    if (!id || !user || isLoading) return;

    const newSocket = io(Config.CHAT_SERVICE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected, joining chat with conversationId:', id);
      newSocket.emit("join_chat", { 
        conversationId: parseInt(id as string)
      });
      
      loadPreviousMessages();
    });

    newSocket.on("receive_message", (data) => {
      console.log('Received message:', data);
      const newMessage: Message = {
        id: data.message_id?.toString() || Date.now().toString() + Math.random(),
        text: data.message_text,
        sender: data.sender_user_id === user.userId ? "me" : "other",
        timestamp: new Date(data.created_at || new Date()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, user]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socket || !id || !user) return;

    const messageData = {
      conversationId: parseInt(id as string),
      sender_user_id: user.userId,
      message_text: text.trim(),
    };

    socket.emit("send_message", messageData);
    DeviceEventEmitter.emit('conversation_sent', { conversationId: parseInt(id as string) });
    setText("");
  };



  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === "me";

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Conversación no encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        {provider.profileImageUrl ? (
          <Image source={{ uri: provider.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{provider.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.providerDetails}>
            <Text style={styles.providerCategory}>{provider.category}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.rating}>{provider.rating}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, {
            backgroundColor: conversationStatus === 'active' ? '#10B981' :
                           conversationStatus === 'pending' ? '#F59E0B' :
                           conversationStatus === 'completed' ? '#6B7280' : '#EF4444'
          }]} />
          <Text style={styles.statusText}>
            {conversationStatus === 'active' ? 'Activo' :
             conversationStatus === 'pending' ? 'Pendiente' :
             conversationStatus === 'completed' ? 'Completado' : 'Cancelado'}
          </Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => {
            console.log('+ button pressed');
            console.log('Provider:', provider);
            console.log('ProviderId:', provider?.providerId);
            
            if (!provider?.providerId) {
              Alert.alert(
                'No es un proveedor',
                'Este usuario no está registrado como proveedor. Solo puedes enviar solicitudes de servicio a proveedores.'
              );
              return;
            }
            
            setShowRequestModal(true);
          }}
        >
          <Ionicons name="add-circle" size={28} color="#3B82F6" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Service Request Modal */}
      {provider && provider.providerId && (
        <ServiceRequestModal
          visible={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          providerId={provider.providerId}
          providerName={provider.name}
          onSuccess={() => {
            setShowRequestModal(false);
            Alert.alert('Éxito', 'Tu solicitud ha sido enviada al proveedor');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: '#e0e0e0',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  providerCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 2,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    backgroundColor: '#3B82F6',
    color: 'white',
  },
  otherMessageText: {
    backgroundColor: 'white',
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimestamp: {
    alignSelf: 'flex-end',
    color: '#9CA3AF',
  },
  otherTimestamp: {
    alignSelf: 'flex-start',
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});