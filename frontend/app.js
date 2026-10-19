
const API_URL = "http://localhost:3000/api/timetable";

const form = document.getElementById("timetableForm");
const tableBody = document.getElementById("timetableBody");
const message = document.getElementById("message");
const recordId = document.getElementById("recordId");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

function showMessage(text) {
  message.textContent = text;
}

function getFormData() {
  return {
    course_code: document.getElementById("course_code").value.trim(),
    course_name: document.getElementById("course_name").value.trim(),
    day: document.getElementById("day").value,
    start_time: document.getElementById("start_time").value,
    end_time: document.getElementById("end_time").value,
    classroom: document.getElementById("classroom").value.trim()
  };
}

function resetForm() {
  form.reset();
  recordId.value = "";
  formTitle.textContent = "Add a Timetable Entry";
  saveButton.textContent = "Save Entry";
  cancelButton.hidden = true;
}

async function loadRecords() {
  try {
    const response = await fetch(API_URL);
    const records = await response.json();

    if (!response.ok) {
      throw new Error(records.error || "Could not load records.");
    }

    tableBody.replaceChildren();

    records.forEach((record) => {
      const row = document.createElement("tr");

      const values = [
        record.id,
        record.course_code,
        record.course_name,
        record.day,
        record.start_time,
        record.end_time,
        record.classroom
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editRecord(record));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteRecord(record.id));

      actionsCell.append(editButton, deleteButton);
      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });

    if (records.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 8;
      cell.textContent = "No timetable records found.";
      row.appendChild(cell);
      tableBody.appendChild(row);
    }
  } catch (error) {
    showMessage("Error loading records: " + error.message);
  }
}

function editRecord(record) {
  recordId.value = record.id;
  document.getElementById("course_code").value = record.course_code;
  document.getElementById("course_name").value = record.course_name;
  document.getElementById("day").value = record.day;
  document.getElementById("start_time").value = record.start_time;
  document.getElementById("end_time").value = record.end_time;
  document.getElementById("classroom").value = record.classroom;

  formTitle.textContent = "Edit Timetable Entry";
  saveButton.textContent = "Update Entry";
  cancelButton.hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = getFormData();
  const id = recordId.value;
  const isEditing = id !== "";

  if (data.end_time <= data.start_time) {
    showMessage("The end time must be later than the start time.");
    return;
  }

  try {
    const response = await fetch(
      isEditing ? `${API_URL}/${id}` : API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "The request failed.");
    }

    showMessage(isEditing ? "Record updated successfully." : "Record created successfully.");
    resetForm();
    await loadRecords();
  } catch (error) {
    showMessage("Error: " + error.message);
  }
});

async function deleteRecord(id) {
  if (!confirm("Are you sure you want to delete record " + id + "?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not delete the record.");
    }

    showMessage("Record deleted successfully.");
    await loadRecords();
  } catch (error) {
    showMessage("Error: " + error.message);
  }
}

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.");
});

loadRecords();
