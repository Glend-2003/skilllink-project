import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import CustomAlert from '../../components/CustomAlert';

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
  unread_count: number;
};

interface ConversationItemUI {
  id: string;
  providerName: string;
  providerCategory: string;
  lastMessage: string;
  time: string;
  avatar: string;
  profileImageUrl?: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItemUI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const fetchConversations = useCallback(async () => {
    if (!user || !user.userId) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${Config.API_GATEWAY_URL}/api/v1/chat/conversations/${user.userId}`);
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        setItems([]);
        return;
      }
      
      const mapped: ConversationItemUI[] = data.map(c => ({
        id: String(c.conversation_id),
        providerName: c.other_user_name || c.other_user_email || 'Usuario',
        providerCategory: c.is_provider === 1 ? 'Servicios' : 'Usuario',
        lastMessage: c.last_message_text || 'Inicia una conversación',
        time: formatTime(c.last_activity_at || c.last_message_at || c.created_at),
        // PNG avatar to ensure RN Image compatibility
        avatar: `https://i.pravatar.cc/150?u=${c.other_user_id}`,
        profileImageUrl: c.other_user_profile_image || undefined,
        unreadCount: c.unread_count || 0,
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
      const readSub = DeviceEventEmitter.addListener('messages_read', fetchConversations);
      const interval = setInterval(fetchConversations, 7000);
      return () => {
        clearInterval(interval);
        sub.remove();
        readSub.remove();
      };
    }, [fetchConversations])
  );

  const countText = useMemo(() => {
    const n = items.length;
    return `${n} conversación${n !== 1 ? 'es' : ''}`;
  }, [items]);

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== conversationId));
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar la conversación. Intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al eliminar la conversación.',
      });
    }
  };

  const confirmDelete = (conversationId: string, providerName: string) => {
    setAlert({
      visible: true,
      type: 'warning',
      title: 'Eliminar Conversación',
      message: `¿Estás seguro de que deseas eliminar la conversación con ${providerName}?`,
      showCancel: true,
      onConfirm: () => deleteConversation(conversationId),
      onCancel: () => {},
    });
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: ConversationItemUI
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => confirmDelete(item.id, item.providerName)}
      >
        <Animated.View
          style={[
            styles.deleteActionContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.deleteText}>Eliminar</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderConversation = ({ item }: { item: ConversationItemUI }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.profileImageUrl ? (
            <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={['#58b9f1', '#2563eb']}
              style={styles.avatarCircle}
            >
              <Ionicons name="person-circle-outline" size={28} color="#FFF" />
            </LinearGradient>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
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

          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.chevron} />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
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

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={alert.showCancel}
        onConfirm={() => {
          if (alert.onConfirm) {
            alert.onConfirm();
          }
          setAlert({ ...alert, visible: false });
        }}
        onCancel={alert.onCancel ? () => {
          if (alert.onCancel) {
            alert.onCancel();
          }
          setAlert({ ...alert, visible: false });
        } : undefined}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  conversationsList: {
    paddingVertical: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteActionContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  category: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 6,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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