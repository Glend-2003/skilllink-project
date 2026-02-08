import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { Config, API_BASE_URL } from '../../constants/Config';
import '../chat.css';

interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  sent_at: string;
  is_read: number;
}

interface ConversationInfo {
  conversation_id: number;
  provider_user_id: number;
  client_user_id: number;
  service_id?: number;
  created_at: string;
  other_user_name?: string;
  other_user_email?: string;
  other_user_profile_image?: string;
}

export default function ChatDetail() {
  const { id: conversationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation info and messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const loadChat = async () => {
      setLoading(true);
      try {
        // Get conversation details
        const convRes = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${user.userId}`);
        const convData = await convRes.json();
        const currentConv = convData.find((c: any) => String(c.conversation_id) === conversationId);
        
        if (currentConv) {
          setConversationInfo({
            conversation_id: currentConv.conversation_id,
            provider_user_id: currentConv.provider_user_id,
            client_user_id: currentConv.client_user_id,
            service_id: currentConv.service_id,
            created_at: currentConv.created_at,
            other_user_name: currentConv.other_user_name,
            other_user_email: currentConv.other_user_email,
            other_user_profile_image: currentConv.other_user_profile_image,
          });
        }

        // Get messages
        const messagesRes = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`);
        const messagesData = await messagesRes.json();
        
        if (Array.isArray(messagesData)) {
          // Map the messages to use consistent field names
          const mappedMessages = messagesData.map((msg: any) => ({
            message_id: msg.message_id,
            conversation_id: Number(conversationId),
            sender_id: msg.sender_user_id || msg.sender_id,
            message_text: msg.message_text,
            sent_at: msg.created_at || msg.sent_at,
            is_read: msg.is_read || 0,
          }));
          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [conversationId, user]);

  // Socket.io connection
  useEffect(() => {
    if (!conversationId || !user) return;

    const socket = io(Config.CHAT_SERVICE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat service, socket ID:', socket.id);
      console.log('Joining conversation:', conversationId);
      socket.emit('join_chat', { conversationId: String(conversationId) });
    });

    socket.on('receive_message', (newMessage: any) => {
      console.log('New message received via socket:', newMessage);
      console.log('Current conversation ID:', conversationId);
      console.log('Message conversation ID:', newMessage.conversation_id);
      
      // Add message to state with proper field mapping
      const mappedMessage: Message = {
        message_id: newMessage.message_id,
        conversation_id: newMessage.conversation_id,
        sender_id: newMessage.sender_user_id || newMessage.sender_id,
        message_text: newMessage.message_text,
        sent_at: newMessage.created_at || new Date().toISOString(),
        is_read: 0,
      };
      setMessages((prevMessages) => {
        // Avoid duplicates
        const exists = prevMessages.some(m => m.message_id === mappedMessage.message_id);
        if (exists) {
          console.log('Message already exists, skipping');
          return prevMessages;
        }
        console.log('Adding new message to state');
        return [...prevMessages, mappedMessage];
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat service');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, user]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !user) {
      console.log('handleSend: validation failed', { 
        hasInput: !!input.trim(), 
        conversationId, 
        userId: user?.userId 
      });
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket not connected');
      alert('No hay conexión con el servidor de chat. Por favor recarga la página.');
      return;
    }

    const messageText = input.trim();
    console.log('Sending message via socket:', messageText);

    // Clear input immediately for better UX
    setInput('');

    try {
      // Send message via Socket.IO
      socketRef.current.emit('send_message', {
        conversationId: String(conversationId),
        sender_user_id: user.userId,
        message_text: messageText,
      });

      console.log('Message emitted to socket for conversation:', conversationId, 'from user:', user.userId);
      inputRef.current?.focus();

    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input if send failed
      setInput(messageText);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    
    if (sameDay) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="chat-detail-container">
        <div className="chat-loading">Cargando conversación...</div>
      </div>
    );
  }

  const otherUserName = conversationInfo?.other_user_name || conversationInfo?.other_user_email || 'Usuario';
  const otherUserId = user?.userId === conversationInfo?.provider_user_id 
    ? conversationInfo?.client_user_id 
    : conversationInfo?.provider_user_id;
  const avatarUrl = conversationInfo?.other_user_profile_image || `https://i.pravatar.cc/150?u=${otherUserId}`;

  return (
    <div className="chat-detail-container">
      <div className="chat-detail-header">
        <button className="chat-back-button" onClick={() => navigate('/chat')}>
          ← Volver
        </button>
        
        <div className="chat-provider-info">
          <div className="chat-provider-avatar">
            <img src={avatarUrl} alt={otherUserName} />
          </div>
          <div className="chat-provider-details">
            <h2 className="chat-provider-name">{otherUserName}</h2>
            <p className="chat-provider-status">En línea</p>
          </div>
        </div>
      </div>

      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.userId;
            return (
              <div
                key={msg.message_id}
                className={`chat-message ${isMe ? 'chat-message-me' : 'chat-message-other'}`}
              >
                <div className="chat-message-bubble">
                  <p className="chat-message-text">{msg.message_text}</p>
                  <span className="chat-message-time">
                    {formatTimestamp(msg.sent_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          autoComplete="off"
        />
        <button 
          className="chat-send-button" 
          onClick={handleSend}
          disabled={!input.trim()}
          title="Enviar mensaje"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
