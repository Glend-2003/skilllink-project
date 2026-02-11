import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { confirmToast } from '../utils/confirmToast';
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
    
    const confirmed = await confirmToast(
      `¿Estás seguro de que deseas eliminar la conversación con ${providerName}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== conversationId));
      } else {
        toast.error('No se pudo eliminar la conversación');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error al eliminar la conversación');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 border-b">
          <nav className="mb-4">
            <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm">
              ← Volver al inicio
            </Link>
          </nav>
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <p className="text-slate-600">
            {items.length} conversación{items.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando conversaciones...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="font-bold text-lg mb-2">No tienes conversaciones</h2>
              <p className="text-slate-600">
                Contacta a un proveedor para iniciar una conversación
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/chat/${item.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            {item.profileImageUrl ? (
                              <AvatarImage src={item.profileImageUrl} alt={item.providerName} />
                            ) : (
                              <AvatarFallback>
                                {item.providerName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold truncate">{item.providerName}</h3>
                            <span className="text-xs text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{item.providerCategory}</p>
                          <p className="text-sm text-slate-600 truncate">{item.lastMessage}</p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <button
                            className="text-red-500 hover:text-red-700 text-xs p-1"
                            onClick={(e) => handleDeleteConversation(item.id, item.providerName, e)}
                            title="Eliminar conversación"
                          >
                            🗑️
                          </button>
                          <span className="text-slate-400">→</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
