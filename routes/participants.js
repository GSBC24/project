const validateParticipant = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!data.email || !emailRegex.test(data.email)) {
    return "Invalid or missing email";
  }

  if (!data.firstname) return "Missing firstname";
  if (!data.lastname) return "Missing lastname";

  if (!data.dob || !dateRegex.test(data.dob)) {
    return "Invalid or missing dob. Use YYYY-MM-DD";
  }

  if (!data.work || !data.work.companyname || !data.work.salary || !data.work.currency) {
    return "Missing work details";
  }

  if (!data.home || !data.home.country || !data.home.city) {
    return "Missing home details";
  }

  return null;
};
// Principal Routes
import express from "express";
import { pool } from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

//POST /participants/add

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

    res.status(201).json({ message: "Participant added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//GET /participants

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM participants");
    res.json({ participants: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /participants/details

router.get("/details", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT firstname, lastname, email FROM participants"
    );
    res.json({ participants: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//GET /participants/details/:email

router.get("/details/:email", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT firstname, lastname, email, dob FROM participants WHERE email = ?",
      [req.params.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET /participants/work/:email

router.get("/work/:email", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT companyname, salary, currency FROM participants WHERE email = ?",
      [req.params.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET /participants/home/:email


router.get("/home/:email", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT country, city FROM participants WHERE email = ?",
      [req.params.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//DELETE /participants/:email

router.delete("/:email", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM participants WHERE email = ?",
      [req.params.email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ message: "Participant deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /participants/:email

router.put("/:email", async (req, res) => {
  const error = validateParticipant(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { firstname, lastname, dob, work, home } = req.body;

  try {
    const sql = `
      UPDATE participants 
      SET firstname=?, lastname=?, dob=?, companyname=?, salary=?, currency=?, country=?, city=?
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
      req.params.email
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ message: "Participant updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
