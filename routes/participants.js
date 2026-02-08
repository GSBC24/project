import express from "express";
import { pool } from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";

// Create a router for all participant endpoints
const router = express.Router();

// --------------------------------------------------
// This function checks if the participant data is valid
// --------------------------------------------------
const validateParticipant = (data) => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Regular expression for date validation (YYYY-MM-DD or YYYY/MM/DD)
  const dateRegex = /^\d{4}[-\/]\d{2}[-\/]\d{2}$/;

  // Check if body exists and is an object
  if (!data || typeof data !== "object") {
    return "Request body must be a JSON object";
  }

  // Check email
  if (!data.email || !emailRegex.test(data.email)) {
    return "Invalid or missing email";
  }

  // Check first name
  if (!data.firstname) {
    return "Missing firstname";
  }

  // Check last name
  if (!data.lastname) {
    return "Missing lastname";
  }

  // Check date of birth
  if (!data.dob || !dateRegex.test(data.dob)) {
    return "Invalid or missing dob. Use YYYY-MM-DD or YYYY/MM/DD";
  }

  // Check work object
  if (!data.work) {
    return "Missing work object";
  }

  if (!data.work.companyname) {
    return "Missing work.companyname";
  }

  // Salary must be a number
  if (typeof data.work.salary !== "number") {
    return "Salary must be a number";
  }

  if (!data.work.currency) {
    return "Missing work.currency";
  }

  // Check home object
  if (!data.home) {
    return "Missing home object";
  }

  if (!data.home.country) {
    return "Missing home.country";
  }

  if (!data.home.city) {
    return "Missing home.city";
  }

  // If everything is OK, return null (no error)
  return null;
};

// Apply Basic Authentication to ALL routes in this file
router.use(authMiddleware);

// --------------------------------------------------
// POST /participants/add
// Add a new participant to the database
// --------------------------------------------------
router.post("/add", async (req, res) => {
  // Validate the request body
  const error = validateParticipant(req.body);

  // If validation fails, return 400 error
  if (error) {
    return res.status(400).json({ error });
  }

  // Extract data from request body
  const { email, firstname, lastname, dob, work, home } = req.body;

  try {
    // SQL query to insert a new participant
    const sql = `
      INSERT INTO participants 
      (email, firstname, lastname, dob, companyname, salary, currency, country, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query with the values
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

    // Send success response
    res.status(201).json({
      message: "Participant added successfully",
      email: email
    });

  } catch (err) {
    // If email already exists, send conflict error
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A participant with this email already exists"
      });
    }

    // Any other error
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// GET /participants
// Get all participants from database
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    // Run SQL query
    const result = await pool.execute("SELECT * FROM participants");

    // Extract rows from result
    const participants = result[0];

    // Send response
    res.json({
      count: participants.length,
      participants: participants
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// GET /participants/details
// Get basic details of all participants
// --------------------------------------------------
router.get("/details", async (req, res) => {
  try {
    const result = await pool.execute(
      "SELECT firstname, lastname, email FROM participants"
    );

    const participants = result[0];

    res.json({
      count: participants.length,
      participants: participants
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// GET /participants/details/:email
// Get details of one participant
// --------------------------------------------------
router.get("/details/:email", async (req, res) => {
  const email = req.params.email;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const result = await pool.execute(
      "SELECT firstname, lastname, email, dob FROM participants WHERE email = ?",
      [email]
    );

    const rows = result[0];

    // If no participant found
    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    // Send first (and only) result
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// GET /participants/work/:email
// Get work details of a participant
// --------------------------------------------------
router.get("/work/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const result = await pool.execute(
      "SELECT companyname, salary, currency FROM participants WHERE email = ?",
      [email]
    );

    const rows = result[0];

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// GET /participants/home/:email
// Get home details of a participant
// --------------------------------------------------
router.get("/home/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const result = await pool.execute(
      "SELECT country, city FROM participants WHERE email = ?",
      [email]
    );

    const rows = result[0];

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// DELETE /participants/:email
// Delete a participant
// --------------------------------------------------
router.delete("/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const result = await pool.execute(
      "DELETE FROM participants WHERE email = ?",
      [email]
    );

    const info = result[0];

    // If no row was deleted
    if (info.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      message: "Participant deleted successfully",
      email: email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// PUT /participants/:email
// Update a participant
// --------------------------------------------------
router.put("/:email", async (req, res) => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate request body
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

    const result = await pool.execute(sql, [
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

    const info = result[0];

    if (info.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      message: "Participant updated successfully",
      email: email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
