import express from "express";
import { pool } from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ---------- VALIDACIÓN DE DATOS ----------
const validateParticipant = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dateRegex = /^\d{4}[-\/]\d{2}[-\/]\d{2}$/; // acepta - o /

  if (!data || typeof data !== "object") {
    return "Request body must be a JSON object";
  }

  if (!data.email || !emailRegex.test(data.email)) {
    return "Invalid or missing email";
  }

  if (!data.firstname) return "Missing firstname";
  if (!data.lastname) return "Missing lastname";

  if (!data.dob || !dateRegex.test(data.dob)) {
    return "Invalid or missing dob. Use YYYY-MM-DD or YYYY/MM/DD";
  }

  if (!data.work) return "Missing work object";
  if (!data.work.companyname) return "Missing work.companyname";
  if (typeof data.work.salary !== "number") return "Salary must be a number";
  if (!data.work.currency) return "Missing work.currency";

  if (!data.home) return "Missing home object";
  if (!data.home.country) return "Missing home.country";
  if (!data.home.city) return "Missing home.city";

  return null;
};

// Aplicar Basic Auth a TODAS las rutas
router.use(authMiddleware);

// ---------- POST /participants/add ----------
router.post("/add", async (req, res) => {
  const error = validateParticipant(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { email, firstname, lastname, dob, work, home } = req.body;

  try {
    const sql = `
      INSERT INTO participants 
      (email, firstname, lastname, dob, companyname, salary, currency, country, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      email,
      firstname,
      lastname,
      dob,
      work.companyname,
      work.salary,
      work.currency,
      home.country,
      home.city
    ]);

    res.status(201).json({
      message: "Participant added successfully",
      email
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Participant with this email already exists" });
    }

    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /participants ----------
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM participants");

    res.json({
      count: rows.length,
      participants: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /participants/details ----------
router.get("/details", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT firstname, lastname, email FROM participants"
    );

    res.json({
      count: rows.length,
      participants: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /participants/details/:email ----------
router.get("/details/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT firstname, lastname, email, dob FROM participants WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /participants/work/:email ----------
router.get("/work/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT companyname, salary, currency FROM participants WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /participants/home/:email ----------
router.get("/home/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT country, city FROM participants WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- DELETE /participants/:email ----------
router.delete("/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM participants WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      message: "Participant deleted successfully",
      email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PUT /participants/:email ----------
router.put("/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const error = validateParticipant(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { firstname, lastname, dob, work, home } = req.body;

  try {
    const sql = `
      UPDATE participants 
      SET firstname=?, lastname=?, dob=?, 
          companyname=?, salary=?, currency=?, 
          country=?, city=?
      WHERE email=?
    `;

    const [result] = await pool.execute(sql, [
      firstname,
      lastname,
      dob,
      work.companyname,
      work.salary,
      work.currency,
      home.country,
      home.city,
      email
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      message: "Participant updated successfully",
      email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
