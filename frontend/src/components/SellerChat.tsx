import React, { useState, useRef, useEffect } from 'react';
import './SellerChat.css';
import { buildApiUrl } from '../services/api';

interface Conversation {
  id: string;
  store_id: string;
  buyer_id: string;
  last_message?: string;
  updated_at: string;
  buyerName?: string; // populated client side
  buyerAvatar?: string; // initials
}

interface ApiMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'buyer' | 'seller';
  content: string;
  created_at: string;
}

interface SellerChatProps {
  // No onBack needed since this is embedded in dashboard
}

const SellerChat: React.FC<SellerChatProps> = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const token = localStorage.getItem('auth_token') || '';

  // fetch conversations list for seller
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        setLoading(true);
        // Use the regular chat API (chat handler works for both buyer and seller)
        const res = await fetch(buildApiUrl('/chat/conversations'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        if (!data.error) {
          const convs: Conversation[] = data.data;
          
          // For seller, we need to filter conversations where this user is the seller
          // and get buyer information instead of store information
          const enriched = await Promise.all(
            convs.map(async (cv) => {
              try {
                // Set default buyer info
                cv.buyerName = 'Pembeli';
                cv.buyerAvatar = 'P';
                
                // Get last message for this conversation
                const mres = await fetch(buildApiUrl(`/chat/conversations/${cv.id}/messages`), {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const mdata = await mres.json();
                if (!mdata.error && mdata.data && mdata.data.length > 0) {
                  const lastMsg = mdata.data[mdata.data.length - 1];
                  cv.last_message = lastMsg.content.length > 50 
                    ? lastMsg.content.substring(0, 50) + '...' 
                    : lastMsg.content;
                } else {
                  cv.last_message = 'Belum ada pesan';
                }
                
                cv.buyerAvatar = getInitials(cv.buyerName || 'P');
              } catch (_) {
                cv.buyerName = 'Pembeli';
                cv.buyerAvatar = 'P';
                cv.last_message = 'Belum ada pesan';
              }
              return cv;
            })
          );
          setConversations(enriched);
        } else {
          setError(data.message || 'Failed to load conversations');
        }
      } catch (err) {
        setError('Failed to load conversations');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConvs();
  }, [token]);

  // fetch messages when selectedChat changes
  useEffect(() => {
    const fetchMsgs = async () => {
      if (!selectedChat) return;
      try {
        const res = await fetch(buildApiUrl(`/chat/conversations/${selectedChat}/messages`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error) setMessages(data.data);
      } catch (_) {}
    };
    if (selectedChat && token) fetchMsgs();
  }, [selectedChat, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const res = await fetch(buildApiUrl(`/chat/conversations/${selectedChat}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (!data.error) {
        setMessages((prev) => [...prev, data.data]);
        
        // Update last message in conversations list
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedChat) {
            return {
              ...conv,
              last_message: newMessage.length > 50 ? newMessage.substring(0, 50) + '...' : newMessage
            };
          }
          return conv;
        }));
        
        setNewMessage('');
      }
    } catch (err) { 
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChatRooms = conversations.filter(cv => 
    (cv.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const formatTime = (time: string) => new Date(time).toLocaleTimeString();

  const currentRoom = conversations.find(cv => cv.id === selectedChat);

  if (loading) {
    return (
      <div className="seller-chat">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Memuat percakapan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-chat">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Gagal Memuat Chat</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-chat">
      <div className="seller-chat-header">
        <h1>Chat dengan Pembeli</h1>
        <p>Kelola percakapan dengan pembeli Anda</p>
      </div>

      <div className="seller-chat-content">
        {/* Chat List Sidebar */}
        <div className="seller-chat-list">
          <div className="seller-chat-list-header">
            <div className="seller-chat-search">
              <input
                type="text"
                placeholder="Cari pembeli..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="seller-chat-list-items">
            {filteredChatRooms.length > 0 ? (
              filteredChatRooms.map((room) => (
                <div 
                  key={room.id}
                  className={`seller-chat-item ${selectedChat === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(room.id)}
                >
                  <div className="seller-chat-avatar">
                    {room.buyerAvatar}
                  </div>
                  
                  <div className="seller-chat-info">
                    <h4 className="seller-chat-name">{room.buyerName}</h4>
                    <p className="seller-chat-last-message">{room.last_message || 'Belum ada pesan'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="seller-chat-list-empty">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <h4>Belum ada percakapan</h4>
                <p>Pembeli akan muncul di sini ketika mereka memulai chat dengan Anda</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        {currentRoom ? (
          <div className="seller-chat-window">
            <div className="seller-chat-window-header">
              <div className="buyer-avatar">
                {currentRoom.buyerAvatar}
              </div>
              <div className="buyer-info">
                <h3>{currentRoom.buyerName}</h3>
                <p className="buyer-status online-status">
                  Online
                </p>
              </div>
            </div>

            <div className="seller-chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`seller-message ${message.sender_type === 'seller' ? 'own' : ''}`}
                >
                  <div className="seller-message-avatar">
                    {message.sender_type === 'seller' ? 'S' : currentRoom.buyerAvatar}
                  </div>
                  
                  <div className="seller-message-content">
                    <div className="seller-message-bubble">
                      {message.content}
                    </div>
                    <div className="seller-message-time">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="seller-chat-input-container">
              <div className="seller-chat-input-wrapper">
                <button className="seller-attachment-btn" title="Lampirkan file">
                  📎
                </button>
                
                <textarea
                  ref={textareaRef}
                  className="seller-chat-input"
                  placeholder="Ketik balasan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />
                
                <div className="seller-chat-actions">
                  <button className="seller-attachment-btn" title="Emoji">
                    😊
                  </button>
                  
                  <button 
                    className="seller-send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    title="Kirim pesan"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="seller-chat-empty">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3>Pilih Chat untuk Memulai</h3>
            <p>Pilih salah satu pembeli di sebelah kiri untuk membalas pesan mereka</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChat; 