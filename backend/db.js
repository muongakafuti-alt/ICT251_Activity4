
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Get the database location from the .env file.
const dbPath = path.resolve(__dirname, process.env.DB_PATH || "./timetable.db");

// Open the database, creating it if necessary.
const db = new Database(dbPath);

// Create the table using schema.sql.
const schema = fs.readFileSync(
  path.join(__dirname, "schema.sql"),
  "utf8"
);
db.exec(schema);

// Insert 10 sample records the first time the table is empty.
const count = db.prepare(
  "SELECT COUNT(*) AS total FROM timetable"
).get().total;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO timetable
    (course_code, course_name, day, start_time, end_time, classroom)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleRecords = [
    ["ICT251", "Web Development", "Monday", "08:00", "10:00", "Lab 1"],
    ["ICT261", "Java Programming", "Monday", "10:00", "12:00", "Lab 2"],
    ["ICT281", "Probability and Statistics", "Tuesday", "08:00", "10:00", "Room 3"],
    ["ICT271", "Computer Architecture", "Tuesday", "10:00", "12:00", "Room 4"],
    ["ICT291", "Database Systems", "Wednesday", "08:00", "10:00", "Lab 1"],
    ["ICT251", "Web Development", "Wednesday", "10:00", "12:00", "Lab 2"],
    ["ICT261", "Java Programming", "Thursday", "08:00", "10:00", "Lab 3"],
    ["ICT281", "Probability and Statistics", "Thursday", "10:00", "12:00", "Room 3"],
    ["ICT271", "Computer Architecture", "Friday", "08:00", "10:00", "Room 4"],
    ["ICT291", "Database Systems", "Friday", "10:00", "12:00", "Lab 1"]
  ];

  const insertMany = db.transaction((records) => {
    for (const record of records) {
      insert.run(...record);
    }
  });

  insertMany(sampleRecords);
}

module.exports = db;
