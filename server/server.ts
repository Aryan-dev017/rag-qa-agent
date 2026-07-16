import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import healthRouter from "./routes/health";
import uploadRouter, { initDefaultDoc } from "./routes/upload";
import chatRouter from "./routes/chat";
import { CONFIG } from "./config/index";

async function startServer() {
  const app = express();
  const PORT = CONFIG.port;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Pre-load default document with embeddings
  await initDefaultDoc();

  // --- Mount API Routes ---
  app.use("/api", healthRouter);
  app.use("/api", uploadRouter);
  app.use("/api", chatRouter);

  // Serve Frontend with Vite Middleware in Development, Static Assets in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] RAG clean architecture server running on http://localhost:${PORT}`);
  });
}

startServer();
