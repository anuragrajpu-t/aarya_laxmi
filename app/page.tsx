"use client";

import { useState } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, price: Number(price) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Request failed");
      } else {
        setStatus("Message sent");
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Telegram Notify Tester</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div>Symbol</div>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. AAPL"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          <div>Price</div>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 195.25"
            type="number"
            step="any"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <button type="submit" style={{ padding: 10 }}>Send</button>
      </form>
      {status && <div style={{ color: "green", marginTop: 12 }}>{status}</div>}
      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
    </div>
  );
}
