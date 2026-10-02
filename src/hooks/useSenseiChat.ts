import { useState, useCallback, useRef } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function useSenseiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"free" | "grammar" | "kanji">("free");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/sensei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], mode }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("API Error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg
              )
            );
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Chat error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, mode]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return { messages, input, setInput, isLoading, sendMessage, stop, mode, setMode };
}
