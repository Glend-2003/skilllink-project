import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';

interface ConversationItemUI {
  id: string;
  providerName: string;
  providerCategory: string;
  lastMessage: string;
  time: string;
  avatar: string;
  profileImageUrl?: string;
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ConversationItemUI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConversations = useCallback(async () => {
    if (!user || !user.userId) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${user.userId}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setItems([]);
        return;
      }
      const providerConvs = data.filter((c: any) => c.is_provider === 1);
      const mapped: ConversationItemUI[] = providerConvs.map((c: any) => ({
        id: String(c.conversation_id),
        providerName: c.other_user_name || c.other_user_email || 'Proveedor',
        providerCategory: 'Servicios',
        lastMessage: c.last_message_text || 'Inicia una conversación',
        time: formatTime(c.last_activity_at || c.last_message_at || c.created_at),
        avatar: `https://i.pravatar.cc/150?u=${c.other_user_id}`,
        profileImageUrl: c.other_user_profile_image || undefined,
      }));
      setItems(mapped);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Chats</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : items.length === 0 ? (
        <div>No hay conversaciones.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Último Mensaje</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.providerName}</td>
                <td>{item.lastMessage}</td>
                <td>{item.time}</td>
                <td>
                  <button onClick={() => navigate(`/chat/${item.id}`)}>Abrir Chat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
