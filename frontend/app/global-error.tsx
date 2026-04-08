"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: "hsl(30 20% 98%)",
          color: "hsl(240 10% 10%)",
          margin: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 700,
              color: "hsl(0 72% 51%)",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "hsl(240 5% 45%)" }}>{error.message}</p>
          <button
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "hsl(262 80% 50%)",
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
