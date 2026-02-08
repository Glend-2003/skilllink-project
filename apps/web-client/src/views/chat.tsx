import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';
import './chat.css';

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
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
      console.error('Error fetching conversations:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 7000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleDeleteConversation = async (conversationId: string, providerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la conversación con ${providerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== conversationId));
      } else {
        alert('No se pudo eliminar la conversación');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error al eliminar la conversación');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <nav style={{ marginBottom: '16px' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            ← Volver al inicio
          </Link>
        </nav>
        <h1 className="chat-title">Mensajes</h1>
        <p className="chat-subtitle">
          {items.length} conversación{items.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="chat-content">
        {loading ? (
          <div className="chat-loading">
            <div>Cargando conversaciones...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h2 className="chat-empty-title">No tienes conversaciones</h2>
            <p className="chat-empty-text">
              Contacta a un proveedor para iniciar una conversación
            </p>
          </div>
        ) : (
          <div className="conversations-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="conversation-card"
                onClick={() => navigate(`/chat/${item.id}`)}
              >
                <div className="conversation-avatar">
                  {item.profileImageUrl ? (
                    <img src={item.profileImageUrl} alt={item.providerName} />
                  ) : (
                    <div className="conversation-avatar-initial">
                      {item.providerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{item.providerName}</h3>
                    <span className="conversation-time">{item.time}</span>
                  </div>
                  <p className="conversation-category">{item.providerCategory}</p>
                  <p className="conversation-lastmsg">{item.lastMessage}</p>
                </div>

                <div className="conversation-actions">
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteConversation(item.id, item.providerName, e)}
                    title="Eliminar conversación"
                  >
                    🗑️
                  </button>
                  <span className="conversation-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
