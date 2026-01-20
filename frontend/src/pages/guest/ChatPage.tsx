import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatPage.css';
import { buildApiUrl, buildServerUrl } from '../../services/api';

interface Conversation {
  id: string;
  store_id: string;
  seller_id: string;
  last_message?: string;
  updated_at: string;
  storeName?: string; // populated client side
  storeAvatar?: string; // initials
}

interface ApiMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'buyer' | 'seller';
  content: string;
  created_at: string;
}

interface ChatPageProps {
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBack }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const token = localStorage.getItem('auth_token') || '';

  // get conv from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convId = params.get('conv');
    if (convId) setSelectedChat(convId);
  }, [location.search]);

  // fetch conversations list
  useEffect(() => {
    const fetchConvs = async () => {
      setLoadingConv(true);
      try {
        const res = await fetch(buildApiUrl('/chat/conversations'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error) {
          const convs: Conversation[] = data.data;
          // enrich with store name and last message
          const enriched = await Promise.all(
            convs.map(async (cv) => {
              try {
                // Get store information
                const sres = await fetch(buildApiUrl(`/buyer/stores/${cv.store_id}`));
                const sdata = await sres.json();
                cv.storeName = sdata.data.store.store_name;
                cv.storeAvatar = getInitials(cv.storeName || '');
                
                // Get last message for this conversation
                const mres = await fetch(buildApiUrl(`/chat/conversations/${cv.id}/messages`), {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const mdata = await mres.json();
                if (!mdata.error && mdata.data && mdata.data.length > 0) {
                  // Get the last message (messages are ordered by created_at)
                  const lastMsg = mdata.data[mdata.data.length - 1];
                  cv.last_message = lastMsg.content.length > 50 
                    ? lastMsg.content.substring(0, 50) + '...' 
                    : lastMsg.content;
                } else {
                  cv.last_message = 'Belum ada pesan';
                }
              } catch (_) {
                cv.last_message = 'Belum ada pesan';
              }
              return cv;
            })
          );
          setConversations(enriched);
        } else {
          console.error('Failed to fetch conversations:', data.message);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoadingConv(false);
      }
    };
    if (token) fetchConvs();
  }, [token]);

  // If selectedChat is set but not in conversations, fetch it
  useEffect(() => {
    const fetchSingle = async () => {
      if (!selectedChat || loadingConv) return;
      
      const exists = conversations.find(c => c.id === selectedChat);
      if (exists) return;

      try {
        const res = await fetch(buildApiUrl(`/chat/conversations/${selectedChat}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error && data.data) {
           const cv = data.data;
           // enrich
           try {
              const sres = await fetch(buildApiUrl(`/buyer/stores/${cv.store_id}`));
              const sdata = await sres.json();
              cv.storeName = sdata.data.store.store_name;
              cv.storeAvatar = getInitials(cv.storeName || '');
              cv.last_message = 'Belum ada pesan'; // New conv might not have messages yet
           } catch (_) {}
           setConversations(prev => [cv, ...prev]);
        }
      } catch (_) {}
    };
    if (token && selectedChat) fetchSingle();
  }, [selectedChat, loadingConv, conversations, token]);

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
    } catch (err) { console.error(err);}  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChatRooms = conversations.filter(cv => (cv.storeName||'').toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const formatTime = (time: string) => new Date(time).toLocaleTimeString();

  const currentRoom = conversations.find(cv => cv.id === selectedChat);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="container">
          <h2>Chat dengan Penjual</h2>
        </div>
      </div>

      <div className="chat-content">
        {/* Chat List Sidebar */}
        <div className="chat-list">
          <div className="chat-list-header">
            <div className="chat-search">
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="chat-list-items">
            {filteredChatRooms.length > 0 ? (
              filteredChatRooms.map((room) => (
                <div 
                  key={room.id}
                  className={`chat-item ${selectedChat === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(room.id)}
                >
                  <div className="chat-avatar">
                    {room.storeAvatar}
                  </div>
                  
                  <div className="chat-info">
                    <h4 className="chat-name">{room.storeName}</h4>
                    <p className="chat-last-message">{room.last_message || 'Belum ada pesan'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="chat-list-empty">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <h4>Belum ada percakapan</h4>
                <p>Mulai chat dengan penjual dari halaman produk untuk memulai percakapan</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        {currentRoom ? (
          <div className="chat-window">
            <div className="chat-window-header">
              <div className="seller-avatar">
                {currentRoom.storeAvatar}
              </div>
              <div className="seller-info">
                <h3>{currentRoom.storeName}</h3>
                <p className="seller-status online-status">
                  Online
                </p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`message ${message.sender_type === 'buyer' ? 'own' : ''}`}
                >
                  <div className="message-avatar">
                    {message.sender_type === 'buyer' ? 'U' : currentRoom.storeAvatar}
                  </div>
                  
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <button className="attachment-btn" title="Lampirkan file">
                  📎
                </button>
                
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />
                
                <div className="chat-actions">
                  <button className="attachment-btn" title="Emoji">
                    😊
                  </button>
                  
                  <button 
                    className="send-btn"
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
          <div className="chat-empty">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3>Pilih Chat untuk Memulai</h3>
            <p>Pilih salah satu chat di sebelah kiri untuk memulai percakapan dengan penjual</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 