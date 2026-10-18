import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import { auth, db } from "../firebase.js";
import { requestForm } from "../components/requestForm.js";

/* ---------- Save to Firestore ---------- */

export const createRequest = async (formData, currentUser, requesterName) => {
  if (!currentUser || !currentUser.uid) {
    throw new Error("Please log in before submitting a request.");
  }

  // A request needs at least one task: a ticked card OR something in "other".
  const hasTask =
    (Array.isArray(formData.tasks) && formData.tasks.length > 0) ||
    Boolean(formData.otherTask?.trim());

  if (
    !formData.area?.trim() ||
    !hasTask ||
    !formData.dateNeeded ||
    !formData.timeNeeded?.trim()
  ) {
    throw new Error("Please complete all required fields and choose at least one task.");
  }

  // The date must be in the future.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requestedDate = new Date(`${formData.dateNeeded}T00:00:00`);

  if (Number.isNaN(requestedDate.getTime()) || requestedDate <= today) {
    throw new Error("Please select a future date.");
  }

  const requestData = {
    // Entered by the resident
    area: formData.area.trim(),
    tasks: Array.isArray(formData.tasks) ? formData.tasks : [],
    otherTask: formData.otherTask?.trim() || "",
    dateNeeded: Timestamp.fromDate(requestedDate),
    timeNeeded: formData.timeNeeded.trim(),
    details: formData.details?.trim() || "",
    femaleVolunteerPreferred: Boolean(formData.femaleVolunteerPreferred),

    // From the logged-in user
    requesterId: currentUser.uid,
    requesterName: requesterName || currentUser.displayName || "Resident",

    // Set automatically
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: "submitted",
    acceptedBy: null,
    needsAttention: false
  };

  const docRef = await addDoc(collection(db, "requests"), requestData);
  return docRef.id;
};

/* ---------- Form interactions ---------- */

export function initRequestForm() {
  const container = document.querySelector("#request-form-container");
  if (!container) return;

  // Put our form inside the existing container.
  container.innerHTML = requestForm();

  const form = container.querySelector("#request-form");
  const message = container.querySelector("#request-message");
  const submitBtn = container.querySelector("#rf-submit");
  const otherWrap = container.querySelector("#rf-other-wrap");
  const dateInput = container.querySelector("#rf-date");

  // Earliest date = tomorrow (local time).
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0")
  ].join("-");

  const showMessage = (text, type) => {
    message.textContent = text;
    message.className = type ? `rf-${type}` : "";
  };

  const resetForm = () => {
    form.reset();
    form.querySelectorAll(".rf-card").forEach(c => c.setAttribute("aria-pressed", "false"));
    otherWrap.hidden = true;
  };

  const closeForm = () => {
    container.hidden = true;
    document.querySelector("#dashboard-placeholder").hidden = false;
  };

  // Click a task card to select / unselect it.
  form.addEventListener("click", event => {
    const card = event.target.closest(".rf-card");
    if (!card) return;

    const nowPressed = card.getAttribute("aria-pressed") !== "true";
    card.setAttribute("aria-pressed", String(nowPressed));

    if (card.dataset.task === "Other") otherWrap.hidden = !nowPressed;
  });

  // Cancel
  container.querySelector("#rf-cancel").addEventListener("click", () => {
    resetForm();
    showMessage("", "");
    closeForm();
  });

  // Submit
  form.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = {
      tasks: [...form.querySelectorAll('.rf-card[aria-pressed="true"]')].map(c => c.dataset.task),
      otherTask: form.querySelector("#rf-other").value,
      dateNeeded: dateInput.value,
      timeNeeded: form.querySelector("#rf-time").value,
      area: form.querySelector("#rf-area").value,
      details: form.querySelector("#rf-details").value,
      femaleVolunteerPreferred: form.querySelector("#rf-female").checked
    };

    submitBtn.disabled = true;
    showMessage("Submitting...", "");

    try {
      await createRequest(formData, auth.currentUser);
      showMessage("Request submitted! Your neighbours can now see it.", "success");
      resetForm();
      setTimeout(() => {
        showMessage("", "");
        closeForm();
      }, 1800);
    } catch (error) {
      console.error("Error submitting request:", error);
      showMessage(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

export function requestForm() {
  return `
    <style>
      .rf-label { display:block; margin:16px 0 6px; font-weight:500; }
      .rf-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .rf-card {
        padding:16px; text-align:left; font-weight:700; cursor:pointer;
        background:#fff; border:1.5px solid #dfe5e1; border-radius:14px;
      }
      .rf-card[aria-pressed="true"] { border-color:#247a54; background:#eaf5ef; }
      .rf-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .rf-input {
        width:100%; padding:12px; font:inherit; box-sizing:border-box;
        border:1.5px solid #dfe5e1; border-radius:10px; background:#fff;
      }
      .rf-check { display:flex; gap:8px; align-items:center; margin-top:16px; }
      .rf-actions { display:grid; gap:10px; margin-top:20px; }
      #request-message { margin-top:12px; font-weight:500; }
      #request-message.rf-error { color:#b3261e; }
      #request-message.rf-success { color:#247a54; }
    </style>

    <h2>What Help Do You Need?</h2>
    <p>A few details will help a neighbour understand your request.</p>

    <form id="request-form" novalidate>
      <span class="rf-label">Type of assistance *</span>
      <div class="rf-cards">
        <button type="button" class="rf-card" data-task="Buy groceries" aria-pressed="false">🛍️ Buy groceries</button>
        <button type="button" class="rf-card" data-task="Transport" aria-pressed="false">🚗 Transport</button>
        <button type="button" class="rf-card" data-task="Household Help" aria-pressed="false">🏠 Household Help</button>
        <button type="button" class="rf-card" data-task="Other" aria-pressed="false">🤍 Other</button>
      </div>

      <div id="rf-other-wrap" hidden>
        <label class="rf-label" for="rf-other">Tell us what you need</label>
        <input class="rf-input" type="text" id="rf-other" placeholder="e.g. Help carry a parcel">
      </div>

      <div class="rf-row">
        <div>
          <label class="rf-label" for="rf-date">Date needed *</label>
          <input class="rf-input" type="date" id="rf-date" required>
        </div>
        <div>
          <label class="rf-label" for="rf-time">Time needed *</label>
          <input class="rf-input" type="time" id="rf-time" required>
        </div>
      </div>

      <label class="rf-label" for="rf-area">Neighbourhood *</label>
      <select class="rf-input" id="rf-area" required>
        <option value="">Select your Fasa</option>
        <option>Fasa 1</option>
        <option>Fasa 2</option>
        <option>Fasa 3</option>
        <option>Fasa 4</option>
        <option>Fasa 5</option>
        <option>Fasa 6</option>
      </select>

      <label class="rf-label" for="rf-details">Short description (optional)</label>
      <textarea class="rf-input" id="rf-details" rows="4"
        placeholder="For example, a few groceries from the nearby shop"></textarea>

      <label class="rf-check">
        <input type="checkbox" id="rf-female">
        I prefer a female volunteer
      </label>

      <div class="rf-actions">
        <button type="submit" class="btn btn-primary" id="rf-submit">Submit Request</button>
        <button type="button" class="btn btn-outline" id="rf-cancel">Cancel</button>
      </div>

      <p id="request-message" role="status"></p>
    </form>
  `;
}