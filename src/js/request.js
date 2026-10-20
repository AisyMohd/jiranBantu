import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import { auth, db } from "../firebase.js";

// Firestore/base punya part
export const createRequest = async (formData, currentUser, requesterName) => {
  if (!currentUser || !currentUser.uid) {
    throw new Error("Please log in before submitting a request.");
  }

// tick task, can be more than one (bincang again)
  const hasTask =
    (Array.isArray(formData.tasks) && formData.tasks.length > 0) ||
    Boolean(formData.otherTask?.trim());
  const validPriorities = ["normal", "urgent", "emergency"];

  if (
    !formData.area?.trim() ||
    !hasTask ||
    !formData.dateNeeded ||
    !formData.timeNeeded?.trim() ||
    !validPriorities.includes(formData.priority)
  ) {
    throw new Error("Please complete all required fields, choose a priority, and select at least one task.");
  }

  // The date must be in the future.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requestedDate = new Date(`${formData.dateNeeded}T00:00:00`);

  if (Number.isNaN(requestedDate.getTime()) || requestedDate <= today) {
    throw new Error("Please select a future date.");
  }

  const requestData = {
    //form resident
    area: formData.area.trim(),
    tasks: Array.isArray(formData.tasks) ? formData.tasks : [],
    otherTask: formData.otherTask?.trim() || "",
    dateNeeded: Timestamp.fromDate(requestedDate),
    timeNeeded: formData.timeNeeded.trim(),
    details: formData.details?.trim() || "",
    femaleVolunteerPreferred: Boolean(formData.femaleVolunteerPreferred),
    priority: formData.priority,

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

/*Form interactions*/

export function initRequestForm({ onSubmitted } = {}) {
  const container = document.querySelector("#request-form-container");
  const openButton = document.querySelector("#need-help-btn");
  if (!container || !openButton) return;

  container.innerHTML = requestForm();

  const form = container.querySelector("#request-form");
  const message = container.querySelector("#request-message");
  const submitBtn = container.querySelector("#rf-submit");
  const otherWrap = container.querySelector("#rf-other-wrap");
  const dateInput = container.querySelector("#rf-date");

  //date
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
    document.body.classList.remove("modal-open");
    openButton.focus();
  };

  const resetAndCloseForm = () => {
    resetForm();
    showMessage("", "");
    closeForm();
  };

  openButton.addEventListener("click", () => {
    container.hidden = false;
    document.body.classList.add("modal-open");
    container.querySelector("#rf-close").focus();
  });

  container.querySelector("#rf-close").addEventListener("click", resetAndCloseForm);

  container.addEventListener("click", event => {
    if (event.target === container) resetAndCloseForm();
  });

  //Choose task(s)
  form.addEventListener("click", event => {
    const card = event.target.closest(".rf-card");
    if (!card) return;

    const nowPressed = card.getAttribute("aria-pressed") !== "true";
    card.setAttribute("aria-pressed", String(nowPressed));

    if (card.dataset.task === "Other") otherWrap.hidden = !nowPressed;
  });

  // Cancel
  container.querySelector("#rf-cancel").addEventListener("click", resetAndCloseForm);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !container.hidden) {
      resetAndCloseForm();
    }
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
      femaleVolunteerPreferred: form.querySelector("#rf-female").checked,
      priority: form.querySelector('input[name="priority"]:checked')?.value
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
        onSubmitted?.();
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
    <section class="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
      <button class="modal-close" id="rf-close" type="button" aria-label="Close dialog">×</button>
      <h2 id="request-modal-title">What Help Do You Need?</h2>
      <p>A few details will help a neighbour understand your request.</p>

      <form id="request-form" novalidate>
        <fieldset class="rf-priority">
          <legend class="rf-label">How urgent is this request? *</legend>
          <div class="rf-priority-options">
            <label class="rf-priority-option">
              <input type="radio" name="priority" value="normal" checked required>
              <span class="rf-priority-content">
                <strong>Normal</strong>
                <small>Help needed as planned</small>
              </span>
            </label>
            <label class="rf-priority-option">
              <input type="radio" name="priority" value="urgent" required>
              <span class="rf-priority-content">
                <strong>Urgent</strong>
                <small>Help needed soon</small>
              </span>
            </label>
            <label class="rf-priority-option">
              <input type="radio" name="priority" value="emergency" required>
              <span class="rf-priority-content">
                <strong>Emergency</strong>
                <small>Immediate, serious situation</small>
              </span>
            </label>
          </div>
          <p class="rf-emergency-note">For immediate danger or a life-threatening emergency, contact local emergency services directly. This form does not provide emergency response.</p>
        </fieldset>

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
    </section>
  `;
}