import { useState } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { mockConversations, mockProviders, currentUser } from '../../data/mockData';

interface ChatProps {
  onViewChange: (view: string) => void;
}

export function Chat({ onViewChange }: ChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    senderId: string;
    message: string;
    timestamp: string;
  }>>([
    {
      id: '1',
      senderId: '1',
      message: 'Hola, ¿en qué puedo ayudarte?',
      timestamp: '2026-01-12T10:00:00',
    },
    {
      id: '2',
      senderId: currentUser.id,
      message: 'Hola, tengo una fuga en la cocina',
      timestamp: '2026-01-12T10:15:00',
    },
    {
      id: '3',
      senderId: '1',
      message: 'Entendido, ¿puedes enviarme una foto del problema?',
      timestamp: '2026-01-12T10:20:00',
    },
    {
      id: '4',
      senderId: currentUser.id,
      message: 'Claro, te la envío ahora',
      timestamp: '2026-01-12T10:25:00',
    },
    {
      id: '5',
      senderId: '1',
      message: '¿A qué hora te queda mejor mañana?',
      timestamp: '2026-01-12T10:30:00',
    },
  ]);

  const selectedProvider = selectedConversation 
    ? mockProviders.find(p => p.id === selectedConversation)
    : null;

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-57px)] md:h-[calc(100vh-73px)] flex bg-white">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Mensajes</h2>
        </div>
        <ScrollArea className="h-[calc(100%-65px)]">
          <div className="divide-y">
            {mockConversations.map((conversation) => {
              const isActive = selectedConversation === conversation.providerId;
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.providerId)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.providerAvatar} alt={conversation.providerName} />
                        <AvatarFallback>{conversation.providerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center bg-red-600 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold truncate">{conversation.providerName}</h3>
                        <span className="text-xs text-slate-500">
                          {new Date(conversation.timestamp).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation && selectedProvider ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarImage src={selectedProvider.avatar} alt={selectedProvider.name} />
                <AvatarFallback>{selectedProvider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedProvider.name}</h3>
                <p className="text-sm text-slate-600">
                  {selectedProvider.isAvailable ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] md:max-w-[60%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-lg mb-2">Selecciona una conversación</p>
            <p className="text-sm">para empezar a chatear</p>
          </div>
        </div>
      )}
    </div>
  );
}
