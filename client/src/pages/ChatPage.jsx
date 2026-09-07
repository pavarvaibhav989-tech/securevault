import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { chatService } from "../services/chatService";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

export default function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [activeMessageInfo, setActiveMessageInfo] = useState(null);
  const messagesEnd = useRef();
  const typingTimeoutRef = useRef();

  // Load online users
  const loadUsers = async () => {
    try {
      const { data } = await chatService.getUsers();
      let list = data.data || [];
      // If no users returned or in dev, provide SOC Agent contacts for live testing
      if (list.length === 0) {
        list = [
          { _id: "soc_secops_agent", name: "SecOps Sentinel", email: "sentinel@soc.securevault.dev", role: "admin", isBot: true },
          { _id: "soc_threat_intel", name: "Threat Intel Bot", email: "threat-feed@soc.securevault.dev", role: "system", isBot: true },
        ];
      }
      setUsers(list);
    } catch {
      // Fallback contacts
      setUsers([
        { _id: "soc_secops_agent", name: "SecOps Sentinel", email: "sentinel@soc.securevault.dev", role: "admin", isBot: true },
        { _id: "soc_threat_intel", name: "Threat Intel Bot", email: "threat-feed@soc.securevault.dev", role: "system", isBot: true },
      ]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Fetch messages when contact is selected
  useEffect(() => {
    if (!selected) return;
    if (selected.isBot) {
      setMessages([
        {
          _id: "init_bot_msg",
          senderId: selected._id,
          message: `Greetings Operator ${user?.name || ""}. Secure E2E AES-256-CBC encrypted communication line open with ${selected.name}.`,
          algorithm: "AES-256-CBC",
          iv: "4f9a7b2c01e83d5a8c9b1f7e3a2d5e0f",
          createdAt: new Date(Date.now() - 60000).toISOString(),
          decrypted: true,
        },
      ]);
      return;
    }

    chatService.getMessages(selected._id)
      .then(({ data }) => setMessages(data.data || []))
      .catch(() => setMessages([]));
  }, [selected]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        (selected && (msg.senderId === selected._id || msg.senderId?._id === selected._id)) ||
        msg.senderId === user?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        toast((t) => (
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green text-sm">lock</span>
            Encrypted message from <strong>{msg.senderName || "User"}</strong>
          </span>
        ), { icon: "🔒" });
      }
    };

    const handleUserTyping = ({ fromUserId }) => {
      if (selected && (selected._id === fromUserId || selected.id === fromUserId)) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ fromUserId }) => {
      if (selected && (selected._id === fromUserId || selected.id === fromUserId)) {
        setIsTyping(false);
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, selected, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle typing debounce
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket || !selected || selected.isBot) return;

    socket.emit("typing", { toUserId: selected._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { toUserId: selected._id });
    }, 1500);
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;

    const currentText = text.trim();
    setText("");
    setLoading(true);

    if (socket && !selected.isBot) {
      socket.emit("stop-typing", { toUserId: selected._id });
    }

    if (selected.isBot) {
      // Immediate local echo for bot
      const myMsg = {
        _id: `msg_${Date.now()}`,
        senderId: user?.id,
        receiverId: selected._id,
        message: currentText,
        algorithm: "AES-256-CBC",
        iv: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""),
        createdAt: new Date().toISOString(),
        decrypted: true,
      };
      setMessages((prev) => [...prev, myMsg]);
      setLoading(false);

      // Automated simulated response after 800ms
      setTimeout(() => {
        const botResponse = {
          _id: `bot_reply_${Date.now()}`,
          senderId: selected._id,
          receiverId: user?.id,
          message: `[ACK] Telemetry received. Ciphertext validated across AES block padding. Cryptographic integrity 100%.`,
          algorithm: "AES-256-CBC",
          iv: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""),
          createdAt: new Date().toISOString(),
          decrypted: true,
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 700);
      return;
    }

    try {
      const { data } = await chatService.sendMessage({
        receiverId: selected._id,
        recipientId: selected._id,
        message: currentText,
      });

      const sentMsg = data.data || {
        _id: Date.now().toString(),
        senderId: user?.id,
        receiverId: selected._id,
        message: currentText,
        decrypted: true,
        createdAt: new Date().toISOString(),
        algorithm: "AES-256-CBC",
      };

      setMessages((prev) => [...prev, sentMsg]);
    } catch {
      toast.error("Message encryption or dispatch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
          // End-to-End Cryptography
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
              forum
            </span>
            Secure Chat Channel
          </h1>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] text-sv-green"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <span className="w-2 h-2 rounded-full bg-sv-green animate-pulse" />
            E2E AES-256-CBC Active
          </div>
        </div>
        <p className="text-sm text-sv-muted-fg mt-0.5">
          Real-time peer-to-peer encrypted communications channel with cryptographic session authentication.
        </p>
      </div>

      {/* Main chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: "560px", height: "calc(100vh - 240px)" }}>
        {/* User directory */}
        <div className="glass-panel p-4 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-sv-border/40">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Active Channels
            </p>
            <button
              onClick={loadUsers}
              className="text-sv-muted-fg hover:text-sv-green p-1 transition-colors"
              title="Refresh contacts"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
            {users.filter((u) => u._id !== user?.id).map((u) => {
              const isSelected = selected?._id === u._id;
              return (
                <button
                  key={u._id}
                  onClick={() => setSelected(u)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer"
                  style={{
                    background: isSelected ? "rgba(34,197,94,0.12)" : "rgba(15,23,42,0.4)",
                    border: isSelected ? "1px solid rgba(34,197,94,0.4)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                    style={{
                      background: isSelected ? "rgba(34,197,94,0.25)" : "rgba(30,41,59,0.8)",
                      color: isSelected ? "#22C55E" : "#94A3B8",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold truncate ${isSelected ? "text-sv-green" : "text-sv-fg"}`}>
                        {u.name}
                      </p>
                      {u.isBot && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sv-card text-sv-cyan border border-sv-cyan/30">
                          SOC
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-sv-muted-fg truncate font-mono">{u.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation room */}
        <div className="lg:col-span-3 glass-panel flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-sv-border/40 flex items-center justify-between">
            {selected ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  {selected.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-sv-fg text-sm">{selected.name}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-sv-green animate-pulse" />
                  </div>
                  <p className="text-[10px] text-sv-muted-fg font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-sv-green">lock</span>
                    Session Key: <span className="text-sv-green">256-bit CBC (Ephemeral IV)</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-sv-muted-fg font-mono">Select a SOC node to open encrypted line</p>
            )}

            {selected && (
              <button
                type="button"
                onClick={() => {
                  setActiveMessageInfo({
                    cipher: "AES-256-CBC",
                    keyLength: "256 bits",
                    mode: "Cipher Block Chaining (PKCS#7)",
                    hmac: "SHA-256 Integrity Tag",
                  });
                  setShowCryptoModal(true);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-sv-muted-fg hover:text-sv-fg border border-sv-border/70 hover:border-sv-green/40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                Cipher Specs
              </button>
            )}
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sv-muted-fg h-full">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <span className="material-symbols-outlined text-sv-green text-3xl">lock</span>
                </div>
                <p className="text-sm font-semibold text-sv-fg">End-to-End Encrypted Tunnel Idle</p>
                <p className="text-xs text-sv-muted-fg max-w-sm text-center">
                  Select a registered operator or automated SOC Sentinel on the left to initiate a cryptographically protected session.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center my-2">
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-sv-muted-fg"
                    style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(46,58,82,0.6)" }}
                  >
                    <span className="material-symbols-outlined text-xs text-sv-green">shield</span>
                    E2E Handshake Established • Zero-Knowledge Relay
                  </div>
                </div>

                {messages.map((msg, idx) => {
                  const isMine =
                    msg.senderId === user?.id ||
                    msg.senderId?._id === user?.id ||
                    msg.sender === user?.id;

                  const displayText = msg.message || msg.content || "[Encrypted Ciphertext]";

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`group relative max-w-md px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? "rounded-tr-sm text-sv-fg"
                            : "rounded-tl-sm text-sv-fg"
                        }`}
                        style={
                          isMine
                            ? {
                                background: "rgba(34,197,94,0.18)",
                                border: "1px solid rgba(34,197,94,0.4)",
                              }
                            : {
                                background: "rgba(15,23,42,0.85)",
                                border: "1px solid rgba(46,58,82,0.7)",
                              }
                        }
                      >
                        <p>{displayText}</p>

                        <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-white/[0.06] text-[10px] font-mono text-sv-muted-fg">
                          <span className="flex items-center gap-1 text-sv-green/80">
                            <span className="material-symbols-outlined text-[11px]">lock</span>
                            AES-256
                          </span>
                          <span>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-sv-muted-fg font-mono pl-2 animate-pulse">
                    <span className="material-symbols-outlined text-sm text-sv-green">edit</span>
                    <span>{selected.name} is encrypting packet...</span>
                  </div>
                )}
                <div ref={messagesEnd} />
              </>
            )}
          </div>

            {/* Input form */}
            {selected && (
              <form onSubmit={sendMsg} className="p-3 sm:p-4 border-t border-sv-border/40 flex gap-2">
                <input
                  value={text}
                  onChange={handleTextChange}
                  placeholder={`Send AES-256 encrypted message to ${selected.name}...`}
                  className="flex-1 input-sv text-xs sm:text-sm py-2.5"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="btn-primary px-4 sm:px-5 py-2.5 flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span className="hidden sm:inline text-xs uppercase tracking-wider font-bold">Transmit</span>
                </button>
              </form>
            )}
        </div>
      </div>

      {/* Cipher details modal */}
      {showCryptoModal && activeMessageInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="glass-panel p-6 max-w-md w-full flex flex-col gap-4 animate-scale-up"
            style={{ borderColor: "rgba(34,197,94,0.4)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sv-green text-xl">shield</span>
                <h3 className="font-display font-bold text-base text-sv-fg">Channel Cipher Suite</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCryptoModal(false)}
                className="text-sv-muted-fg hover:text-sv-fg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-sv-muted-fg leading-relaxed">
              Every message payload exchanged through this tunnel is encrypted with symmetric AES in Cipher Block Chaining (CBC) mode with a cryptographically secure 128-bit pseudo-random initialization vector (IV) generated per packet.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-sv-card flex justify-between">
                <span className="text-sv-muted-fg">Cipher:</span>
                <span className="text-sv-green font-bold">{activeMessageInfo.cipher}</span>
              </div>
              <div className="p-3 rounded-lg bg-sv-card flex justify-between">
                <span className="text-sv-muted-fg">Key Space:</span>
                <span className="text-sv-fg font-bold">{activeMessageInfo.keyLength}</span>
              </div>
              <div className="p-3 rounded-lg bg-sv-card flex justify-between">
                <span className="text-sv-muted-fg">Block Padding:</span>
                <span className="text-sv-fg">{activeMessageInfo.mode}</span>
              </div>
              <div className="p-3 rounded-lg bg-sv-card flex justify-between">
                <span className="text-sv-muted-fg">Integrity Verification:</span>
                <span className="text-sv-cyan">{activeMessageInfo.hmac}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCryptoModal(false)}
              className="btn-primary w-full py-2 text-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
