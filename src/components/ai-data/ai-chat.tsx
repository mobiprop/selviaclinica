"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Sparkles, ArrowUp, Loader2, AlertCircle } from "lucide-react";
import { renderLiteMarkdown } from "@/lib/format-markdown";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's our net revenue this month?",
  "How many patients do we have in total?",
  "Which supplies are tracked with exact usage?",
  "How many appointments are scheduled but not completed?",
];

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/ai-data/chat")
      .then((res) => res.json())
      .then((data) => setNotConfigured(!data.configured))
      .catch(() => setNotConfigured(true));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    requestAnimationFrame(autoResize);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai-data/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "not_configured") {
          setNotConfigured(true);
          setMessages(messages);
          return;
        }
        throw new Error(data.message || `The AI assistant didn't respond (${res.status}). Try again.`);
      }
      if (!res.body) {
        throw new Error("The AI assistant didn't respond. Try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assembled = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        const text = assembled;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: text };
          return copy;
        });
      }
    } catch (err) {
      setMessages(messages);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">AI Data</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Ask questions about your patients, revenue, or supplies — answered from your real, live data.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={notConfigured}
                  className="rounded-xl border border-border bg-card p-3 text-left text-sm text-foreground shadow-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                {m.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-foreground">
                    {m.content}
                  </div>
                ) : (
                  <div className="flex w-full max-w-[90%] gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    {m.content ? (
                      <div
                        className="min-w-0 flex-1 text-sm leading-relaxed text-foreground [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: renderLiteMarkdown(m.content) }}
                      />
                    ) : (
                      streaming &&
                      i === messages.length - 1 && (
                        <Loader2 className="mt-1 h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-2xl">
          {notConfigured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                AI Data needs an Anthropic API key
              </div>
              <p className="mt-1.5">
                Get one at{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  console.anthropic.com
                </a>{" "}
                and set <code className="rounded bg-amber-100 px-1 py-0.5">ANTHROPIC_API_KEY</code> in{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5">.env.local</code>, then restart the dev server.
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about patients, revenue, or supplies..."
                rows={1}
                className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
