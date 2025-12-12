// File: js/app.js
// Student: Ayoub Aghbar (12428124)
// This file is intentionally incomplete.
// Your task is to implement the required behaviour using JavaScript and the Fetch API.

/*
  API ENDPOINTS (already implemented on the server):

  Base URL:
    http://portal.almasar101.com/assignment/api

  1) Add task  (POST)
     add.php?stdid=STUDENT_ID&key=API_KEY
     Body (JSON): { "title": "Task title" }
     Returns JSON with the added task.

  2) Get tasks (GET)
     get.php?stdid=STUDENT_ID&key=API_KEY
     - If "id" is omitted: returns all tasks for this student.
     - If "id=NUMBER" is provided: returns one task.

  3) Delete task (GET or DELETE)
     delete.php?stdid=STUDENT_ID&key=API_KEY&id=TASK_ID
     Deletes the task with that ID for the given student.
*/

// Configuration for this student (do not change STUDENT_ID value)
const STUDENT_ID = "12428124";
const API_KEY = "nYs43u5f1oGK9";
const API_BASE = "https://portal.almasar101.com/assignment/api";

// Grab elements from the DOM
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");

/**
 * Helper to update status message.
 * You can use this in your code.
 */
function setStatus(message, isError = false) {
    if (!statusDiv) return;
    statusDiv.textContent = message || "";
    statusDiv.style.color = isError ? "#d9363e" : "#666666";
}

// Normalize task object from API
function normalizeTask(raw) {
    if (!raw) return null;
    const id = raw.id ?? raw.task_id ?? raw.ID ?? raw.insertId ?? null;
    const title = raw.title ?? raw.name ?? raw.task ?? "";
    if (!id) return null;
    return { id: String(id), title: String(title) };
}

/**
 * TODO 1:
 * When the page loads, fetch all existing tasks for this student using:
 *   GET: API_BASE + "/get.php?stdid=" + STUDENT_ID + "&key=" + API_KEY
 * Then:
 *   - Parse the JSON response.
 *   - Loop over the "tasks" array (if it exists).
 *   - For each task, create an <li> with class "task-item"
 *     and append it to #task-list.
 */
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
});

// Load tasks
async function loadTasks() {
    setStatus("Loading tasks...");
    const url = `${API_BASE}/get.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)}`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error();

        let data;
        try {
            data = await resp.json();
        } catch {
            data = {};
        }

        list.innerHTML = "";

        const tasksArray = Array.isArray(data.tasks) ? data.tasks : Array.isArray(data.data) ? data.data : null;

        if (tasksArray) {
            tasksArray.forEach((task) => renderTask(task));
            setStatus("");
            return;
        }

        if (data && (data.id || data.title)) {
            renderTask(data);
            setStatus("");
            return;
        }

        setStatus("");
    } catch {
        setStatus("Failed to load tasks.", true);
    }
}

/**
 * TODO 2:
 * When the form is submitted:
 *   - prevent the default behaviour.
 *   - read the value from #task-input.
 *   - send a POST request using fetch to:
 *       API_BASE + "/add.php?stdid=" + STUDENT_ID + "&key=" + API_KEY
 *     with headers "Content-Type: application/json"
 *     and body JSON: { title: "..." }
 *   - on success, add the new task to the DOM and clear the input.
 */
if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        addTask(input.value);
    });
}

// Add task
async function addTask(title) {
    const trimmed = (title || "").trim();
    if (!trimmed) {
        setStatus("Please enter a task title.", true);
        return;
    }

    setStatus("Adding task...");
    const url = `${API_BASE}/add.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)}`;

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmed }),
        });

        if (!resp.ok) throw new Error();

        let data;
        try {
            data = await resp.json();
        } catch {
            data = {};
        }

        const created = data.task ?? data.data ?? data ?? null;
        const t = normalizeTask(created);
        if (!t) throw new Error();

        renderTask(t);
        input.value = "";
        input.focus();
        setStatus("");
    } catch {
        setStatus("Failed to add task.", true);
    }
}

/**
 * TODO 3:
 * For each task that you render, create a "Delete" button.
 * When clicked:
 *   - send a request to:
 *       API_BASE + "/delete.php?stdid=" + STUDENT_ID + "&key=" + API_KEY + "&id=" + TASK_ID
 *   - on success, remove that <li> from the DOM.
 *
 * You can create a helper function like "renderTask(task)" that:
 *   - Creates <li>, <span> for title, and a "Delete" <button>.
 *   - Attaches a click listener to the delete button.
 *   - Appends the <li> to #task-list.
 */

// Suggested helper (you can modify it or make your own):
function renderTask(task) {
    const t = normalizeTask(task);
    if (!t) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = t.id;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = t.title;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "task-delete";
    delBtn.type = "button";

    delBtn.addEventListener("click", function () {
        deleteTask(t.id, li);
    });

    li.appendChild(titleSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
}

// Delete task
async function deleteTask(id, liElement) {
    const url = `${API_BASE}/delete.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)}&id=${encodeURIComponent(id)}`;

    setStatus("Deleting...");

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error();

        let data;
        try {
            data = await resp.json();
        } catch {
            data = {};
        }

        if (liElement && liElement.parentNode) liElement.remove();
        setStatus("");
    } catch {
        setStatus("Failed to delete task.", true);
    }
}
