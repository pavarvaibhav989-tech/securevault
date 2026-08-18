import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { chatService } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef();

  useEffect(() => {
    chatService.getUsers().then(({ data }) => setUsers(data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selected) return;
    chatService.getMessages(selected._id).then(({ data }) => setMessages(data.data || [])).catch(console.error);
  }, [selected]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setLoading(true);
    try {
      const { data } = await chatService.sendMessage({ recipientId: selected._id, message: text });
      setMessages((m) => [...m, data.data]);
      setText("");
    } catch { toast.error("Send failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">forum</span>Secure Chat
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">End-to-end encrypted messaging with AES session keys.</p>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-tertiary/10 border border-tertiary/25 rounded-lg text-sm text-tertiary">
        <span className="material-symbols-outlined">lock</span>
        <span>All messages are encrypted with AES-256 before transmission. Private keys never leave your device.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: "500px" }}>
        {/* Users list */}
        <div className="glass-panel p-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">group</span>Users Online
          </p>
          {users.length === 0 && <p className="text-xs text-sv-muted-fg italic">No other users yet.</p>}
          {users.filter((u) => u._id !== user?.id).map((u) => (
            <button
              key={u._id}
              onClick={() => setSelected(u)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selected?._id === u._id ? "bg-primary/15 border border-primary/40" : "hover:bg-white/5"}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
              >
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{u.name}</p>
                <p className="text-xs text-sv-muted-fg truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 glass-panel flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            {selected ? (
              <>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-primary text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
                >
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{selected.name}</p>
                  <div className="flex items-center gap-1 text-xs text-tertiary">
                    <span className="material-symbols-outlined text-[12px]">lock</span>End-to-end encrypted
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sv-muted-fg text-sm">Select a user to start chatting</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {!selected && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sv-muted-fg/50 h-full">
                <span className="material-symbols-outlined text-5xl">forum</span>
                <p className="text-sm">Select a contact to start a secure conversation.</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const mine = msg.senderId === user?.id || msg.sender === user?.id;
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${mine ? "text-on-primary rounded-br-sm" : "bg-sv-card text-on-surface rounded-bl-sm"}`}
                    style={mine ? { background: "#adc6ff", color: "#002e6a" } : {}}
                  >
                    {msg.message || msg.content}
                    <p className={`text-xs mt-1 ${mine ? "text-right opacity-60" : "text-sv-muted-fg"}`}>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEnd} />
          </div>

          {selected && (
            <form onSubmit={sendMsg} className="px-4 py-3 border-t border-white/5 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message (AES encrypted)..."
                className="flex-1 input-sv py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold disabled:opacity-40 transition-all hover:opacity-90 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

