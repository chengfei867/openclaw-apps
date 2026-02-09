import express from "express";
import * as dbModule from "../db.js";

const router = express.Router();
const db = dbModule.default ?? dbModule.db;

// Keep response payloads consistent across endpoints.
const sendError = (res, status, message) =>
  res.status(status).json({ success: false, data: null, error: message });
const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const parseId = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const normalizeCompleted = (value) => {
  if (value === undefined) {
    return { value: undefined };
  }
  if (value === 0 || value === "0" || value === false) {
    return { value: 0 };
  }
  if (value === 1 || value === "1" || value === true) {
    return { value: 1 };
  }
  return { error: "completed must be 0 or 1" };
};

const normalizeTitle = (value, required) => {
  if (value === undefined) {
    return required ? { error: "title is required" } : { value: undefined };
  }
  if (typeof value !== "string") {
    return { error: "title must be a string" };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { error: "title cannot be empty" };
  }
  return { value: trimmed };
};

const normalizeDescription = (value) => {
  if (value === undefined) {
    return { value: undefined };
  }
  if (value === null) {
    return { value: "" };
  }
  if (typeof value !== "string") {
    return { error: "description must be a string" };
  }
  return { value };
};

// GET /api/todos?completed=0|1
router.get("/", (req, res) => {
  if (!db) {
    return sendError(res, 500, "Database is not initialized");
  }

  const completedParam = req.query.completed;
  const completedCheck = normalizeCompleted(completedParam);
  if (completedCheck.error) {
    return sendError(res, 400, completedCheck.error);
  }

  try {
    let todos;
    if (completedParam !== undefined) {
      const stmt = db.prepare(
        "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE completed = ? ORDER BY created_at DESC"
      );
      todos = stmt.all(completedCheck.value);
    } else {
      const stmt = db.prepare(
        "SELECT id, title, description, completed, created_at, updated_at FROM todos ORDER BY created_at DESC"
      );
      todos = stmt.all();
    }

    return sendSuccess(res, todos);
  } catch (error) {
    console.error("Failed to list todos:", error);
    return sendError(res, 500, "Failed to load todos");
  }
});

// POST /api/todos
router.post("/", (req, res) => {
  if (!db) {
    return sendError(res, 500, "Database is not initialized");
  }

  const titleCheck = normalizeTitle(req.body?.title, true);
  if (titleCheck.error) {
    return sendError(res, 400, titleCheck.error);
  }
  const descriptionCheck = normalizeDescription(req.body?.description);
  if (descriptionCheck.error) {
    return sendError(res, 400, descriptionCheck.error);
  }

  try {
    const insert = db
      .prepare(
        "INSERT INTO todos (title, description, completed) VALUES (?, ?, 0)"
      )
      .run(titleCheck.value, descriptionCheck.value ?? "");

    const todo = db
      .prepare(
        "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = ?"
      )
      .get(insert.lastInsertRowid);

    return sendSuccess(res, todo, 201);
  } catch (error) {
    console.error("Failed to create todo:", error);
    return sendError(res, 500, "Failed to create todo");
  }
});

// GET /api/todos/:id
router.get("/:id", (req, res) => {
  if (!db) {
    return sendError(res, 500, "Database is not initialized");
  }

  const todoId = parseId(req.params.id);
  if (!todoId) {
    return sendError(res, 400, "Invalid todo id");
  }

  try {
    const todo = db
      .prepare(
        "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = ?"
      )
      .get(todoId);

    if (!todo) {
      return sendError(res, 404, "Todo not found");
    }

    return sendSuccess(res, todo);
  } catch (error) {
    console.error("Failed to fetch todo:", error);
    return sendError(res, 500, "Failed to fetch todo");
  }
});

// PUT /api/todos/:id
router.put("/:id", (req, res) => {
  if (!db) {
    return sendError(res, 500, "Database is not initialized");
  }

  const todoId = parseId(req.params.id);
  if (!todoId) {
    return sendError(res, 400, "Invalid todo id");
  }

  const titleCheck = normalizeTitle(req.body?.title, false);
  if (titleCheck.error) {
    return sendError(res, 400, titleCheck.error);
  }
  const descriptionCheck = normalizeDescription(req.body?.description);
  if (descriptionCheck.error) {
    return sendError(res, 400, descriptionCheck.error);
  }
  const completedCheck = normalizeCompleted(req.body?.completed);
  if (completedCheck.error) {
    return sendError(res, 400, completedCheck.error);
  }

  const updates = [];
  const params = [];

  if (titleCheck.value !== undefined) {
    updates.push("title = ?");
    params.push(titleCheck.value);
  }
  if (descriptionCheck.value !== undefined) {
    updates.push("description = ?");
    params.push(descriptionCheck.value);
  }
  if (completedCheck.value !== undefined) {
    updates.push("completed = ?");
    params.push(completedCheck.value);
  }

  if (updates.length === 0) {
    return sendError(res, 400, "No fields provided for update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  try {
    const result = db
      .prepare(`UPDATE todos SET ${updates.join(", ")} WHERE id = ?`)
      .run(...params, todoId);

    if (result.changes === 0) {
      return sendError(res, 404, "Todo not found");
    }

    const todo = db
      .prepare(
        "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = ?"
      )
      .get(todoId);

    return sendSuccess(res, todo);
  } catch (error) {
    console.error("Failed to update todo:", error);
    return sendError(res, 500, "Failed to update todo");
  }
});

// DELETE /api/todos/:id
router.delete("/:id", (req, res) => {
  if (!db) {
    return sendError(res, 500, "Database is not initialized");
  }

  const todoId = parseId(req.params.id);
  if (!todoId) {
    return sendError(res, 400, "Invalid todo id");
  }

  try {
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(todoId);
    if (result.changes === 0) {
      return sendError(res, 404, "Todo not found");
    }

    return sendSuccess(res, { id: todoId });
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return sendError(res, 500, "Failed to delete todo");
  }
});

export default router;
