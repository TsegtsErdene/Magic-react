import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

type Msg = { Direction: number; Sender: string; Body: string; CreatedAt: string };

const API = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const token = localStorage.getItem("token") || "";
  const userEmail = localStorage.getItem("username") || "";
  const projectName = localStorage.getItem("projectName") || "";

  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);

  const canSend = useMemo(() => !!(conversationId && text.trim() && !busy), [conversationId, text, busy]);

  async function startOrEnsureConversation() {
    const { data } = await axios.post(
      `${API}/api/chat/start`,
      { userId: userEmail, projectName, conversationId: conversationId || undefined },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    setConversationId(data.conversationId);
    await loadHistory(data.conversationId);
  }

async function loadHistory(cid: string) {
  try {
    const { data } = await axios.get(`${API}/api/chat/history/${cid}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // normalize to array
    const arr =
      Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.messages)
          ? (data as any).messages
          : [];

    setMessages(arr as Msg[]);
  } catch (e) {
    console.error('history load error', e);
    setMessages([]); // fallback to empty array
  }
}
  async function send() {
    if (!canSend) return;
    setBusy(true);
    const payload = { conversationId, userId: userEmail, text: text.trim() };
    setText("");
    await axios.post(`${API}/api/chat/send`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    await loadHistory(conversationId);
    setBusy(false);
  }

  useEffect(() => {
    startOrEnsureConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    timer.current = window.setInterval(() => loadHistory(conversationId), 5000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [conversationId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Support Chat</h2>
        <div className="text-xs opacity-70">
          Project: <b>{projectName || "-"}</b> &nbsp;|&nbsp; Conv: <code>{conversationId || "-"}</code>
        </div>
      </div>

      <div className="border rounded-2xl p-4 h-[60vh] overflow-auto bg-white/5">
        {(messages ?? []).map((m, i) => {
          const mine = m.Direction === 0; // 0 = Portal → Teams
          return (
            <div key={i} className={`mb-3 ${mine ? "text-right" : "text-left"}`}>
              <div className="text-[11px] opacity-60">
                {m.Sender} — {new Date(m.CreatedAt).toLocaleTimeString()}
              </div>
              <div
                className={`inline-block mt-1 px-3 py-2 rounded-2xl ${
                  mine ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                }`}
              >
                {m.Body}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-sm opacity-60 py-10">Энд одоогоор мессеж алга.</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Та мессежээ бичнэ үү…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <button
          className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50"
          onClick={send}
          disabled={!canSend}
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>

      <p className="mt-2 text-xs opacity-60">
        Tip: мессеж илгээсний дараа 5 секунд тутам шинэчлэгдэнэ (Flow #2 → backend → SQL).
      </p>
    </div>
  );
}