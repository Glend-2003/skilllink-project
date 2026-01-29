import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter } from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';

type ApiConversation = {
  conversation_id: number;
  other_user_id: number;
  other_user_email: string;
  other_user_name: string;
  is_provider: number;
  last_message_text: string | null;
  last_activity_at: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user_profile_image: string | null;
};

interface ConversationItemUI {
  id: string;
  providerName: string;
  providerCategory: string;
  lastMessage: string;
  time: string;
  avatar: string;
  profileImageUrl?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItemUI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConversations = useCallback(async () => {
    if (!user || !user.userId) {
      console.log('No user or userId:', user);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching conversations for userId:', user.userId);
      const res = await fetch(`${Config.CHAT_SERVICE_URL}/api/conversations/${user.userId}`);
      console.log('Response status:', res.status);
      const data: ApiConversation[] = await res.json();
      console.log('Conversations data:', data);
      const providerConvs = (data || []).filter(c => c.is_provider === 1);
      const mapped: ConversationItemUI[] = providerConvs.map(c => ({
        id: String(c.conversation_id),
        providerName: c.other_user_name || c.other_user_email || 'Proveedor',
        providerCategory: 'Servicios',
        lastMessage: c.last_message_text || 'Inicia una conversación',
        time: formatTime(c.last_activity_at || c.last_message_at || c.created_at),
        // PNG avatar to ensure RN Image compatibility
        avatar: `https://i.pravatar.cc/150?u=${c.other_user_id}`,
        profileImageUrl: c.other_user_profile_image || undefined,
      }));
      setItems(mapped);
    } catch (e) {
      console.error('Error fetching conversations:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const formatTime = (iso: string | null): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const sub = DeviceEventEmitter.addListener('conversation_sent', fetchConversations);
      const interval = setInterval(fetchConversations, 7000);
      return () => {
        clearInterval(interval);
        sub.remove();
      };
    }, [fetchConversations])
  );

  const countText = useMemo(() => {
    const n = items.length;
    return `${n} conversación${n !== 1 ? 'es' : ''}`;
  }, [items]);

  const renderConversation = ({ item }: { item: ConversationItemUI }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.providerName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.providerName} numberOfLines={1}>
            {item.providerName}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.category}>{item.providerCategory}</Text>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
        <Text style={styles.subtitle}>{countText}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No tienes conversaciones</Text>
            <Text style={styles.emptyText}>Contacta a un profesional para comenzar una conversación</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  conversationsList: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});