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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticPath = path.resolve(__dirname, "..", "..", "static");
app.use(express.static(staticPath));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/upload", uploadRoutes);

// SPA fallback — serve index.html for non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
