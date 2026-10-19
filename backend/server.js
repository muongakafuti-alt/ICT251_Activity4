
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: allow JSON request bodies and cross-origin requests.
app.use(cors());
app.use(express.json());

// GET: List all timetable records.
app.get("/api/timetable", (req, res) => {
  try {
    const records = db.prepare(
      "SELECT * FROM timetable ORDER BY day, start_time"
    ).all();

    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve timetable records." });
  }
});

// GET: Retrieve one record by ID.
app.get("/api/timetable/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "A valid positive ID is required." });
  }

  try {
    const record = db.prepare(
      "SELECT * FROM timetable WHERE id = ?"
    ).get(id);

    if (!record) {
      return res.status(404).json({ error: "Timetable record not found." });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve the timetable record." });
  }
});

// POST: Create a new record.
app.post("/api/timetable", (req, res) => {
  const { course_code, course_name, day, start_time, end_time, classroom } = req.body;

  if (
    !course_code || !course_name || !day ||
    !start_time || !end_time || !classroom
  ) {
    return res.status(400).json({
      error: "All timetable fields are required."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO timetable
      (course_code, course_name, day, start_time, end_time, classroom)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      course_code.trim(),
      course_name.trim(),
      day,
      start_time,
      end_time,
      classroom.trim()
    );

    const newRecord = db.prepare(
      "SELECT * FROM timetable WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create the timetable record." });
  }
});

// PUT: Update an existing record.
app.put("/api/timetable/:id", (req, res) => {
  const id = Number(req.params.id);
  const { course_code, course_name, day, start_time, end_time, classroom } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "A valid positive ID is required." });
  }

  if (
    !course_code || !course_name || !day ||
    !start_time || !end_time || !classroom
  ) {
    return res.status(400).json({
      error: "All timetable fields are required."
    });
  }

  try {
    const existing = db.prepare(
      "SELECT id FROM timetable WHERE id = ?"
    ).get(id);

    if (!existing) {
      return res.status(404).json({ error: "Timetable record not found." });
    }

    db.prepare(`
      UPDATE timetable
      SET course_code = ?,
          course_name = ?,
          day = ?,
          start_time = ?,
          end_time = ?,
          classroom = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      course_code.trim(),
      course_name.trim(),
      day,
      start_time,
      end_time,
      classroom.trim(),
      id
    );

    const updatedRecord = db.prepare(
      "SELECT * FROM timetable WHERE id = ?"
    ).get(id);

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update the timetable record." });
  }
});

// DELETE: Delete a record by ID.
app.delete("/api/timetable/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "A valid positive ID is required." });
  }

  try {
    const result = db.prepare(
      "DELETE FROM timetable WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Timetable record not found." });
    }

    res.status(200).json({
      message: "Timetable record deleted successfully.",
      id: id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete the timetable record." });
  }
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Timetable API is running at http://localhost:${PORT}`);
});
