const path = require("path");
const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const tagRoutes = require("./routes/tags");
const uploadRoutes = require("./routes/upload");

require("./db");

const app = express();
const BASE = "/md-note";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticPath = path.resolve(__dirname, "..", "..", "static");
app.use(BASE, express.static(staticPath));

app.get(BASE + "/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(BASE + "/api/auth", authRoutes);
app.use(BASE + "/api/notes", noteRoutes);
app.use(BASE + "/api/tags", tagRoutes);
app.use(BASE + "/api/upload", uploadRoutes);

// SPA fallback — serve index.html for non-API routes
app.get(BASE + "/*", (req, res, next) => {
  const relativePath = req.path.startsWith(BASE)
    ? req.path.slice(BASE.length)
    : req.path;
  if (relativePath.startsWith("/api")) return next();
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
