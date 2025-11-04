"use client";

import { useState } from "react";

export default function AuthDemo() {
  // API-URL aus Umgebungsvariable (mit Fallback)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dal-ai.sunrise-avengers.ch";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <h1>Auth Demo</h1>
      <p>API URL: <strong>{apiUrl}</strong></p>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {response && (
        <pre
          style={{
            marginTop: "1.5rem",
            background: "#f3f3f3",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        >
          {response}
        </pre>
      )}
    </div>
  );
}
