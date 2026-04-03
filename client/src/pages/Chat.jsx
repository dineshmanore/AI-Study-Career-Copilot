import { useEffect, useState, useRef } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { MessageSquare, Send, Plus, Trash2, Sparkles } from 'lucide-react';
import Markdown from '../components/Markdown';

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/chats').then((res) => setChats(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async (chatId) => {
    try {
      const res = await api.get(`/chats/${chatId}`);
      setMessages(res.data.data.messages);
      setActiveChatId(chatId);
    } catch { toast.error('Failed to load chat'); }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);

    // Add a placeholder for the AI response
    setMessages((prev) => [...prev, { role: 'model', content: '' }]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg, chatId: activeChatId }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.token) {
              fullText += data.token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', content: fullText };
                return updated;
              });
            }
            if (data.done) {
              setActiveChatId(data.chatId);
              // Refresh sidebar
              api.get('/chats').then((res) => setChats(res.data.data)).catch(() => {});
            }
            if (data.error) {
              toast.error('AI Error');
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', content: `⚠️ ${data.error}` };
                return updated;
              });
              return; // Stop processing this stream
            }
          } catch {}
        }
      }
    } catch {
      toast.error('AI service unavailable. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chats/${id}`);
      setChats(chats.filter((c) => c._id !== id));
      if (activeChatId === id) startNewChat();
      toast.success('Chat deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-primary" /> AI Doubt Solver
        </h1>
        <button onClick={startNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition">
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Chat History Sidebar */}
        <div className="hidden md:flex flex-col w-56 bg-white rounded-xl border border-border overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Recent Chats</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length > 0 ? chats.map((chat) => (
              <div key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-border/50 ${
                  activeChatId === chat._id ? 'bg-blue-50' : ''
                }`}>
                <p className="text-sm text-navy truncate flex-1">{chat.title}</p>
                <button onClick={(e) => handleDeleteChat(chat._id, e)}
                  className="p-1 text-slate-300 hover:text-danger flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )) : (
              <p className="px-4 py-6 text-xs text-text-secondary text-center">No chats yet</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-border overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-slate-100 text-text-primary border border-border rounded-bl-md'
                }`}>
                  {msg.content ? (
                    <Markdown content={msg.content} />
                  ) : (
                    <div className="loading-dots">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-1">Ask me anything!</h3>
                <p className="text-text-secondary text-sm max-w-sm">I can help with study doubts, concepts, coding problems, and more.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="Type your question..."
                disabled={streaming}
              />
              <button onClick={handleSend} disabled={streaming || !input.trim()}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
