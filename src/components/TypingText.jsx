import { useState, useRef, useEffect } from "react";

export function TypingText({ text, onDone }) {
  const [i, setI] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    setI(0);
  }, [text]);

  useEffect(() => {
    if (i < text.length) {
      timerRef.current = setTimeout(() => setI(n => n + 1), 13);
    } else if (onDone) {
      onDone();
    }
    return () => clearTimeout(timerRef.current);
  }, [i, text, onDone]);

  return (
    <span>
      {text.slice(0, i)}
      <span style={{ opacity: i < text.length ? 1 : 0 }}>▍</span>
    </span>
  );
}
