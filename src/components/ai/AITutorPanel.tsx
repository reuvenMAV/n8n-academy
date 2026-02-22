'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { useLessonStore } from '@/store/lessonStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AITutorPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const lessonId = useLessonStore((s) => s.currentLessonId);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setStreaming(true);
    scrollToEnd();
    try {
      const canvasGraph = { nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })), edges: edges.map((e) => ({ source: e.source, target: e.target })) };
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lessonId: lessonId ?? undefined, canvasGraph }),
      });
      if (!res.ok || !res.body) {
        setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, the AI tutor is unavailable. Set OPENAI_API_KEY for real responses.' }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      setMessages((m) => [...m, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: full };
          return next;
        });
        scrollToEnd();
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error.' }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90"
        aria-label="מורה AI"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[400px] rounded-lg border border-white/10 bg-surface shadow-xl flex flex-col">
          <div className="p-2 border-b border-white/10 font-medium text-text-primary">{t('tutor')}</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.length === 0 && (
              <p className="text-sm text-text-secondary">שאלו שאלה על ה-workflow...</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-background/50 text-text-primary border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="שאלו שאלה על ה-workflow..."
              className="flex-1 rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="sm" onClick={handleSend} disabled={streaming}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
