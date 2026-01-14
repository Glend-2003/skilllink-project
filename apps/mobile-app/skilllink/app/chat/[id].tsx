import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  type?: 'text' | 'service_proposal' | 'service_accepted' | 'service_rejected';
  serviceData?: {
    title: string;
    description: string;
    rate: number;
    estimatedHours: number;
  };
};

type ConversationStatus = 'active' | 'pending' | 'completed' | 'cancelled';

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  avatar: string;
  verified: boolean;
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
    {
      id: "4",
      text: "Cobro $25 por hora. ¿Qué tipo de trabajo necesitas?",
      sender: "me",
      timestamp: "10:33",
      type: "service_proposal",
      serviceData: {
        title: "Reparación de grifo",
        description: "Reparación completa de grifo con repuestos incluidos",
        rate: 25,
        estimatedHours: 2,
      }
    },
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
  const [showServiceProposal, setShowServiceProposal] = useState(false);
  const [serviceProposal, setServiceProposal] = useState({
    title: '',
    description: '',
    rate: '',
    estimatedHours: '',
  });

  const flatListRef = useRef<FlatList<Message>>(null);
  const provider = mockProviders[id || '1'];

  useEffect(() => {
  }, [id]);

  useEffect(() => {
    console.log('useEffect triggered, id:', id, 'user:', user, 'isLoading:', isLoading);
    if (!id || !user || isLoading) return;

    const newSocket = io("http://192.168.100.161:3003", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected, joining chat with userId:', user.userId, 'requestId:', id);
      newSocket.emit("join_chat", { requestId: id, userId: user.userId });
    });

    newSocket.on("receive_message", (data) => {
      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        text: data.content,
        sender: data.senderId === user.userId ? "me" : "other",
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
        sender: msg.sender_user_id === user.userId ? "me" : "other",
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessages(formattedMessages);
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
      requestId: id,
      senderId: user.userId,
      content: text,
    };

    socket.emit("send_message", messageData);
    setText("");
  };

  const sendServiceProposal = () => {
    if (!serviceProposal.title || !serviceProposal.rate) {
      Alert.alert("Error", "Por favor completa el título y la tarifa del servicio");
      return;
    }

    const proposalMessage: Message = {
      id: Date.now().toString(),
      text: `Propuesta de servicio: ${serviceProposal.title}`,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "service_proposal",
      serviceData: {
        title: serviceProposal.title,
        description: serviceProposal.description,
        rate: parseFloat(serviceProposal.rate),
        estimatedHours: parseFloat(serviceProposal.estimatedHours) || 1,
      }
    };

    setMessages((prev) => [...prev, proposalMessage]);
    setShowServiceProposal(false);
    setServiceProposal({ title: '', description: '', rate: '', estimatedHours: '' });
  };

  const acceptService = (messageId: string) => {
    const acceptedMessage: Message = {
      id: Date.now().toString(),
      text: "¡Servicio aceptado! Nos pondremos en contacto pronto.",
      sender: "other",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "service_accepted",
    };

    setMessages((prev) => [...prev, acceptedMessage]);
    setConversationStatus('pending');
  };

  const rejectService = (messageId: string) => {
    const rejectedMessage: Message = {
      id: Date.now().toString(),
      text: "Lo siento, no puedo aceptar esta propuesta en este momento.",
      sender: "other",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "service_rejected",
    };

    setMessages((prev) => [...prev, rejectedMessage]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === "me";

    if (item.type === 'service_proposal' && item.serviceData) {
      return (
        <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
          <View style={styles.serviceProposal}>
            <Text style={styles.serviceTitle}>{item.serviceData.title}</Text>
            <Text style={styles.serviceDescription}>{item.serviceData.description}</Text>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceRate}>${item.serviceData.rate}/hora</Text>
              <Text style={styles.serviceHours}>{item.serviceData.estimatedHours}h estimadas</Text>
            </View>
            <Text style={styles.serviceTotal}>
              Total estimado: ${(item.serviceData.rate * item.serviceData.estimatedHours).toFixed(2)}
            </Text>
            {!isMe && conversationStatus === 'active' && (
              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={[styles.serviceButton, styles.acceptButton]}
                  onPress={() => acceptService(item.id)}
                >
                  <Text style={styles.acceptButtonText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.serviceButton, styles.rejectButton]}
                  onPress={() => rejectService(item.id)}
                >
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {item.timestamp}
          </Text>
        </View>
      );
    }

    if (item.type === 'service_accepted' || item.type === 'service_rejected') {
      return (
        <View style={styles.systemMessage}>
          <Ionicons
            name={item.type === 'service_accepted' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={item.type === 'service_accepted' ? '#10B981' : '#EF4444'}
          />
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <Text style={styles.systemTimestamp}>{item.timestamp}</Text>
        </View>
      );
    }

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
      {/* Header con información del proveedor */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
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

      {/* Modal de propuesta de servicio */}
      {showServiceProposal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Proponer Servicio</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título del servicio"
              value={serviceProposal.title}
              onChangeText={(text) => setServiceProposal(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Descripción del servicio"
              value={serviceProposal.description}
              onChangeText={(text) => setServiceProposal(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                placeholder="Tarifa por hora"
                value={serviceProposal.rate}
                onChangeText={(text) => setServiceProposal(prev => ({ ...prev, rate: text }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, { flex: 1, marginLeft: 8 }]}
                placeholder="Horas estimadas"
                value={serviceProposal.estimatedHours}
                onChangeText={(text) => setServiceProposal(prev => ({ ...prev, estimatedHours: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowServiceProposal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={sendServiceProposal}
              >
                <Text style={styles.confirmModalButtonText}>Enviar Propuesta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.serviceButton}
          onPress={() => setShowServiceProposal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#3B82F6" />
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
    paddingTop: 50, // Para notch
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingBottom: 100, // Espacio para input
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
  serviceProposal: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  serviceHours: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  systemMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  systemTimestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmModalButton: {
    backgroundColor: '#3B82F6',
  },
  cancelModalButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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