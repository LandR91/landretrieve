"use client";

// =============================================================================
// Dashboard Messaggi — LandRetrieve.com
// 2-column chat UI: thread list (left) + chat window (right)
// Real-time via Socket.io, file attachments via REST → R2
// =============================================================================

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useSession } from "next-auth/react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserBasic {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatar: string | null;
}

interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Message {
  id: string;
  threadId: string;
  createdById: string;
  message: string;
  attachments: MessageAttachment[] | null;
  isRead: boolean;
  createdAt: string;
  createdBy: UserBasic;
}

interface Thread {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  other: UserBasic;
  lastMsg: { id: string; message: string; createdAt: string; createdById: string; isRead: boolean } | null;
  unreadCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function displayName(u: UserBasic): string {
  return (u.displayName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) || "Utente";
}

function initials(u: UserBasic): string {
  const name = displayName(u);
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// ── Avatar Bubble ─────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }: { user: UserBasic; size?: number }) {
  if (user.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={displayName(user)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: GREEN, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials(user)}
    </div>
  );
}

// ── Thread List Item ──────────────────────────────────────────────────────────
function ThreadItem({
  thread,
  active,
  currentUserId,
  onClick,
}: {
  thread: Thread;
  active: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const preview = thread.lastMsg?.message ?? "Nessun messaggio ancora";
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        display: "flex", alignItems: "center", gap: ".75rem",
        padding: ".85rem 1rem",
        background: active ? "#f0fbf5" : "transparent",
        border: "none",
        borderLeft: active ? `3px solid ${GREEN}` : "3px solid transparent",
        cursor: "pointer",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar user={thread.other} size={42} />
        {hasUnread && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            width: 16, height: 16, borderRadius: "50%",
            background: GREEN, color: "#fff",
            fontSize: ".62rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".15rem" }}>
          <span style={{ fontWeight: hasUnread ? 700 : 500, fontSize: ".88rem", color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
            {displayName(thread.other)}
          </span>
          {thread.lastMsg && (
            <span style={{ fontSize: ".68rem", color: "#9ca3af", flexShrink: 0 }}>
              {formatTime(thread.lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div style={{ fontSize: ".78rem", color: hasUnread ? TEXT : "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: hasUnread ? 600 : 400 }}>
          {thread.lastMsg?.createdById === currentUserId ? "Tu: " : ""}
          {preview}
        </div>
      </div>
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isMine,
  onTranslate,
  translating,
  translation,
}: {
  msg: Message;
  isMine: boolean;
  onTranslate: (id: string, text: string) => void;
  translating: boolean;
  translation?: string;
}) {
  const attachments = msg.attachments as MessageAttachment[] | null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: ".65rem" }}>
      <div
        style={{
          maxWidth: "68%",
          padding: ".6rem .9rem",
          borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isMine ? "#dcfce7" : "#ffffff",
          border: isMine ? "1px solid #bbf7d0" : `1px solid ${BORDER}`,
          fontSize: ".88rem",
          color: TEXT,
          lineHeight: 1.55,
          wordBreak: "break-word",
        }}
      >
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.message}</p>

        {attachments && attachments.length > 0 && (
          <div style={{ marginTop: ".5rem", display: "flex", flexDirection: "column", gap: ".35rem" }}>
            {attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: ".5rem",
                  padding: ".4rem .6rem",
                  background: "rgba(0,0,0,.04)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: LABEL,
                  fontSize: ".78rem",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>
                  {att.type.startsWith("image/") ? "🖼️" : "📄"}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{att.name}</span>
                <span style={{ color: "#9ca3af", flexShrink: 0 }}>{formatBytes(att.size)}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginTop: ".2rem" }}>
        <span style={{ fontSize: ".65rem", color: "#9ca3af" }}>{formatTime(msg.createdAt)}</span>
        {isMine && (
          <span style={{ fontSize: ".68rem", color: msg.isRead ? "#0ea5e9" : "#9ca3af" }} title={msg.isRead ? "Letto" : "Inviato"}>
            {msg.isRead ? "✓✓" : "✓"}
          </span>
        )}
        {!isMine && (
          <button
            onClick={() => onTranslate(msg.id, msg.message)}
            style={{ fontSize: ".65rem", color: "#9ca3af", background: "transparent", border: "none", cursor: "pointer", padding: "0 .2rem" }}
            title="Traduci"
          >
            🌐
          </button>
        )}
      </div>

      {translating && (
        <div style={{ fontSize: ".72rem", color: "#9ca3af", fontStyle: "italic", marginTop: ".15rem" }}>
          Traduzione in corso...
        </div>
      )}
      {translation && (
        <div style={{
          maxWidth: "68%",
          marginTop: ".25rem",
          padding: ".45rem .75rem",
          background: "#f0fbf5",
          border: `1px solid ${GREEN}40`,
          borderRadius: 10,
          fontSize: ".8rem",
          color: LABEL,
        }}>
          🌐 {translation}
        </div>
      )}
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────
function EmptyThreads() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: "3rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
      <p style={{ fontWeight: 600, color: LABEL, margin: "0 0 .35rem", textAlign: "center" }}>Nessun messaggio</p>
      <p style={{ fontSize: ".82rem", margin: 0, textAlign: "center" }}>
        I tuoi messaggi appariranno qui quando ricevi o avvii una conversazione.
      </p>
    </div>
  );
}

function EmptyChat() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👈</div>
      <p style={{ fontWeight: 600, color: LABEL, margin: "0 0 .35rem" }}>Seleziona una conversazione</p>
      <p style={{ fontSize: ".82rem", margin: 0 }}>Scegli un thread dalla lista a sinistra per iniziare.</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MessaggiPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? "";
  const accessToken = (session?.user as { accessToken?: string })?.accessToken ?? "";

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [attachmentPending, setAttachmentPending] = useState<MessageAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, remoteTyping]);

  // ── Fetch threads ─────────────────────────────────────────────────────────
  const fetchThreads = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/messaging/threads`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) setThreads(await res.json());
    } finally {
      setThreadsLoading(false);
    }
  }, [accessToken]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (threadId: string) => {
    if (!accessToken) return;
    const res = await fetch(`${API_URL}/api/messaging/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });
    if (res.ok) setMessages(await res.json());
  }, [accessToken]);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === msg.threadId
            ? {
                ...t,
                lastMsg: { id: msg.id, message: msg.message, createdAt: msg.createdAt, createdById: msg.createdById, isRead: msg.isRead },
                unreadCount: msg.createdById !== currentUserId ? t.unreadCount + 1 : t.unreadCount,
              }
            : t,
        ).sort((a, b) => (b.lastMsg?.createdAt ?? "") > (a.lastMsg?.createdAt ?? "") ? 1 : -1),
      );
    });

    socket.on("message_read", ({ threadId }: { threadId: string }) => {
      if (activeThreadId === threadId) setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    socket.on("user_typing", ({ threadId }: { threadId: string }) => {
      if (activeThreadId === threadId) setRemoteTyping(true);
    });

    socket.on("user_stop_typing", ({ threadId }: { threadId: string }) => {
      if (activeThreadId === threadId) setRemoteTyping(false);
    });

    fetchThreads();

    return () => { disconnectSocket(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Join thread ───────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeThreadId) return;
    socket.emit("join_thread", { threadId: activeThreadId });
    setMessages([]);
    setRemoteTyping(false);
    setTranslations({});
    fetchMessages(activeThreadId);
    socket.emit("mark_read", { threadId: activeThreadId });
    setThreads((prev) => prev.map((t) => (t.id === activeThreadId ? { ...t, unreadCount: 0 } : t)));

    return () => { socket.emit("leave_thread", { threadId: activeThreadId }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  function handleInputChange(val: string) {
    setInput(val);
    setSendError(null);
    const socket = socketRef.current;
    if (!socket || !activeThreadId) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing_start", { threadId: activeThreadId });
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing_stop", { threadId: activeThreadId });
    }, 2000);
  }

  // ── File attachment ───────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAttachmentError(null);

    if (!ALLOWED_MIME.has(file.type)) {
      setAttachmentError("Formato non supportato. Accettati: JPEG, JPG, PNG, WebP, PDF.");
      return;
    }
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      setAttachmentError("Formato non supportato. Accettati: JPEG, JPG, PNG, WebP, PDF.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/messaging/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? "Errore durante il caricamento");
      }
      setAttachmentPending(await res.json());
    } catch (err: unknown) {
      setAttachmentError(err instanceof Error ? err.message : "Errore di caricamento");
    } finally {
      setUploading(false);
    }
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  function sendMessage() {
    const socket = socketRef.current;
    if (!socket || !activeThreadId) return;
    const text = input.trim();
    if (!text && !attachmentPending) return;

    setSendError(null);
    const payload: { threadId: string; message: string; attachments?: MessageAttachment[] } = {
      threadId: activeThreadId,
      message: text || "(allegato)",
    };
    if (attachmentPending) payload.attachments = [attachmentPending];

    socket.emit("send_message", payload);
    socket.once("exception", (err: { message?: string }) => {
      setSendError(err?.message ?? "Errore durante l'invio del messaggio.");
    });

    setInput("");
    setAttachmentPending(null);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(false);
    socket.emit("typing_stop", { threadId: activeThreadId });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Translate ─────────────────────────────────────────────────────────────
  async function handleTranslate(msgId: string, text: string) {
    if (translations[msgId]) {
      setTranslations((prev) => { const n = { ...prev }; delete n[msgId]; return n; });
      return;
    }
    setTranslatingId(msgId);
    try {
      const lang = navigator.language.slice(0, 2).toUpperCase();
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`,
      );
      const data = await res.json() as { responseData?: { translatedText?: string } };
      const translated = data?.responseData?.translatedText;
      if (translated) setTranslations((prev) => ({ ...prev, [msgId]: translated }));
    } catch { /* silently ignore */ }
    finally { setTranslatingId(null); }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", background: "#f5f5f5", marginLeft: -240 }}>

      {/* ── Thread list (1/3) ──────────────────────────────────────────────── */}
      <div style={{ width: 320, flexShrink: 0, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, margin: 0 }}>Messaggi</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {threadsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
            </div>
          ) : threads.length === 0 ? (
            <EmptyThreads />
          ) : (
            threads.map((t) => (
              <React.Fragment key={t.id}>
                <ThreadItem thread={t} active={t.id === activeThreadId} currentUserId={currentUserId} onClick={() => setActiveThreadId(t.id)} />
                <div style={{ height: 1, background: BORDER, marginLeft: "4.5rem" }} />
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* ── Chat window (2/3) ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!activeThread ? (
          <EmptyChat />
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: ".85rem 1.5rem", borderBottom: `1px solid ${BORDER}`, background: "#ffffff", display: "flex", alignItems: "center", gap: ".75rem", flexShrink: 0 }}>
              <Avatar user={activeThread.other} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>{displayName(activeThread.other)}</div>
                {remoteTyping && <div style={{ fontSize: ".75rem", color: GREEN, fontStyle: "italic" }}>Sta scrivendo...</div>}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column" }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: ".85rem" }}>
                  Nessun messaggio. Inizia la conversazione!
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.createdById === currentUserId}
                    onTranslate={handleTranslate}
                    translating={translatingId === msg.id}
                    translation={translations[msg.id]}
                  />
                ))
              )}

              {/* Typing dots */}
              {remoteTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".5rem" }}>
                  <Avatar user={activeThread.other} size={24} />
                  <div style={{ padding: ".5rem .75rem", background: "#f3f4f6", borderRadius: "14px 14px 14px 4px", border: `1px solid ${BORDER}` }}>
                    <span style={{ display: "inline-flex", gap: ".25rem" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", display: "inline-block", animation: `bounce .9s ease-in-out ${i * 0.15}s infinite` }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview */}
            {attachmentPending && (
              <div style={{ padding: ".5rem 1.5rem 0", display: "flex", alignItems: "center", gap: ".5rem", background: "#ffffff", borderTop: `1px solid ${BORDER}` }}>
                <span>{attachmentPending.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                <span style={{ fontSize: ".78rem", color: LABEL, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachmentPending.name}</span>
                <span style={{ fontSize: ".72rem", color: "#9ca3af" }}>{formatBytes(attachmentPending.size)}</span>
                <button onClick={() => setAttachmentPending(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700, fontSize: "1.1rem" }}>×</button>
              </div>
            )}

            {/* Errors */}
            {(attachmentError || sendError) && (
              <div style={{ padding: ".4rem 1.5rem", background: "#fef2f2", borderTop: "1px solid #fecaca", fontSize: ".78rem", color: "#dc2626" }}>
                {attachmentError || sendError}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: ".85rem 1.5rem", borderTop: `1px solid ${BORDER}`, background: "#ffffff", display: "flex", alignItems: "flex-end", gap: ".6rem", flexShrink: 0 }}>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: "none" }} onChange={handleFileChange} />
              <button
                onClick={() => { setAttachmentError(null); fileInputRef.current?.click(); }}
                disabled={uploading}
                title="Allega file (JPEG, PNG, WebP, PDF — max 20 MB)"
                style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: uploading ? "#f5f5f5" : "#ffffff", cursor: uploading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, transition: "border-color .2s" }}
                onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.borderColor = GREEN; }}
                onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.borderColor = BORDER; }}
              >
                {uploading ? "⏳" : "📎"}
              </button>

              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Scrivi un messaggio... (Invio per inviare, Shift+Invio per a capo)"
                rows={1}
                style={{
                  flex: 1, resize: "none", maxHeight: 120,
                  padding: ".55rem .85rem", borderRadius: 8,
                  fontSize: ".88rem", fontFamily: "inherit", color: TEXT, lineHeight: 1.5,
                  overflowY: "auto",
                  border: `1.5px solid ${inputFocused ? GREEN : BORDER}`, outline: "none",
                  transition: "border-color .2s",
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() && !attachmentPending}
                style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: (input.trim() || attachmentPending) ? GREEN : "#e5e7eb",
                  border: "none",
                  cursor: (input.trim() || attachmentPending) ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background-color .2s",
                }}
                onMouseEnter={(e) => { if (input.trim() || attachmentPending) e.currentTarget.style.backgroundColor = "#1d8a4b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = (input.trim() || attachmentPending) ? GREEN : "#e5e7eb"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
