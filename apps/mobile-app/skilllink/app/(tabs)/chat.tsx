import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';

interface Conversation {
  id: string;
  providerName: string;
  providerCategory: string;
  lastMessage: string;
  time: string;
  avatar: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  unreadCount: number;
  serviceType?: string;
  proposedRate?: number;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    providerName: "Carlos Méndez",
    providerCategory: "Plomería",
    lastMessage: "Perfecto, puedo ir mañana a las 10 AM",
    time: "10:45",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: 'active',
    unreadCount: 2,
    serviceType: "Reparación de grifo",
    proposedRate: 25,
  },
  {
    id: "2",
    providerName: "Ana López",
    providerCategory: "Electricista",
    lastMessage: "¿Cuánto cobrás por hora?",
    time: "Ayer",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: 'pending',
    unreadCount: 0,
    serviceType: "Instalación de tomacorrientes",
  },
  {
    id: "3",
    providerName: "Miguel Torres",
    providerCategory: "Barbería",
    lastMessage: "Servicio completado satisfactoriamente",
    time: "2 días",
    avatar: "https://i.pravatar.cc/150?img=7",
    status: 'completed',
    unreadCount: 0,
    serviceType: "Corte de cabello",
    proposedRate: 20,
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'all') return true;
    return conv.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'active': return '#10B981';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
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

        {item.serviceType && (
          <Text style={styles.serviceType} numberOfLines={1}>
            📋 {item.serviceType}
          </Text>
        )}

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>

        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {item.proposedRate && (
            <Text style={styles.rate}>${item.proposedRate}/h</Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderTab = (tab: 'all' | 'active' | 'pending' | 'completed', label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
      {tab !== 'all' && (
        <Text style={[styles.tabCount, activeTab === tab && styles.activeTabCount]}>
          ({conversations.filter(c => c.status === tab).length})
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
        <Text style={styles.subtitle}>
          {filteredConversations.length} conversación{filteredConversations.length !== 1 ? 'es' : ''}
        </Text>
      </View>

      <View style={styles.tabs}>
        {renderTab('all', 'Todos')}
        {renderTab('active', 'Activos')}
        {renderTab('pending', 'Pendientes')}
        {renderTab('completed', 'Completados')}
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'all' ? 'No tienes conversaciones' : `No hay conversaciones ${getStatusText(activeTab).toLowerCase()}`}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all'
                ? 'Contacta a un profesional para comenzar una conversación'
                : `Las conversaciones ${getStatusText(activeTab).toLowerCase()} aparecerán aquí`
              }
            </Text>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  tabCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeTabCount: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
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