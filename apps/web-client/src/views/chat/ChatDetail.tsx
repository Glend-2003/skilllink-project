import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

const mockProviders: Record<string, { id: string; name: string; category: string; rating: number; avatar: string; verified: boolean }> = {
  '1': {
    id: '1',
    name: 'Carlos Méndez',
    category: 'Plomería',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=3',
    verified: true,
  },
  '2': {
    id: '2',
    name: 'Ana López',
    category: 'Electricista',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=5',
    verified: true,
  },
};

const initialMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hola, vi tu perfil de plomería', sender: 'other', timestamp: '10:30' },
    { id: '2', text: '¡Hola! Claro, ¿en qué puedo ayudarte?', sender: 'me', timestamp: '10:31' },
    { id: '3', text: '¿Cuánto cobrás por hora?', sender: 'other', timestamp: '10:32' },
    { id: '4', text: 'Cobro $25 por hora. ¿Qué tipo de trabajo necesitas?', sender: 'me', timestamp: '10:33' },
  ],
  '2': [
    { id: '1', text: 'Hola, necesito instalar tomacorrientes', sender: 'other', timestamp: '15:20' },
    { id: '2', text: '¡Hola! Claro, puedo ayudarte con eso', sender: 'me', timestamp: '15:21' },
  ],
};

export default function ChatDetail() {
  const { id } = useParams();
  const provider = id ? mockProviders[id] : undefined;
  const [messages, setMessages] = useState<Message[]>(id && initialMessages[id] ? initialMessages[id] : []);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: String(messages.length + 1), text: input, sender: 'me', timestamp: new Date().toLocaleTimeString().slice(0,5) }]);
    setInput('');
  };

  if (!provider) return <div>Proveedor no encontrado</div>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <img src={provider.avatar} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 'bold' }}>{provider.name}</div>
          <div style={{ color: '#888' }}>{provider.category}</div>
          <div>⭐ {provider.rating}</div>
        </div>
      </div>
      <div style={{ minHeight: 200, border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fafafa' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ textAlign: msg.sender === 'me' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{ background: msg.sender === 'me' ? '#2563eb' : '#e5e7eb', color: msg.sender === 'me' ? '#fff' : '#222', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>{msg.text}</span>
            <div style={{ fontSize: 10, color: '#888' }}>{msg.timestamp}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc' }} placeholder="Escribe un mensaje..." />
        <button onClick={handleSend} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' }}>Enviar</button>
      </div>
    </div>
  );
}
