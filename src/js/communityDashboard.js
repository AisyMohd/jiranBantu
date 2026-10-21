
import '../communityDashboard.css';

import {
  renderCommunityDashboard,
  renderCommunityRequestCard
} from '../components/communityDashboard.js';

export {
  renderCommunityDashboard,
  renderCommunityRequestCard
};
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

import { auth, db } from '../firebase.js';

// Time thresholds
const TWO_HOURS = 2 * 60 * 60 * 1000;
const THREE_HOURS = 3 * 60 * 60 * 1000;

function toDate(value) {
  if (!value) return null;

  let date;

  if (typeof value.toDate === 'function') {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    date = new Date(value);
  } else {
    return null;
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

export function requestNeedsAttention(request, now = new Date()) {
  const status = String(request.status || '').trim().toLowerCase();

  if (['accepted', 'completed', 'cancelled'].includes(status)) {
    return false;
  }

  if (status === 'unclaimed') return true;

  return status === 'open' && request.isUrgent === true;
}

export function getAttentionRequests(requests, now = new Date()) {
  const priority = {
    'Urgent Request': 1,
    'Overdue Request': 2,
    'No Volunteer After 2 Hours': 3,
    'Unclaimed Request': 4
  };

  return requests
    .filter(request => requestNeedsAttention(request, now))
    .sort((a, b) =>
      (priority[getAttentionReason(a, now)] ?? 99) -
      (priority[getAttentionReason(b, now)] ?? 99)
    );
}

export function getEffectiveStatus(request, now = new Date()) {
  const status = String(request.status || '').trim().toLowerCase();

  if (status !== 'open') return status;

  const submittedAt = toDate(request.createdAt);
  const neededAt = toDate(request.dateNeeded);

  const noVolunteerAfterTwoHours =
    submittedAt &&
    now.getTime() - submittedAt.getTime() >= TWO_HOURS;

  const overdueThreeHours =
    neededAt &&
    now.getTime() - neededAt.getTime() >= THREE_HOURS;

  return noVolunteerAfterTwoHours || overdueThreeHours
    ? 'unclaimed'
    : 'open';
}

export function prepareCommunityRequests(requests, now = new Date()) {
  return requests.map(request => ({
    ...request,
    status: getEffectiveStatus(request, now)
  }));
}

export function getAttentionReason(request, now = new Date()) {
  const status = String(request.status || '').trim().toLowerCase();

  if (['accepted', 'completed', 'cancelled'].includes(status)) {
    return null;
  }

  if (status === 'open' && request.isUrgent === true) {
    return 'Urgent Request';
  }

  if (status !== 'unclaimed') return null;

  const neededAt = toDate(request.dateNeeded);
  const submittedAt = toDate(request.createdAt);

  if (
    neededAt &&
    now.getTime() - neededAt.getTime() >= THREE_HOURS
  ) {
    return 'Overdue Request';
  }

  if (
    submittedAt &&
    now.getTime() - submittedAt.getTime() >= TWO_HOURS
  ) {
    return 'No Volunteer After 2 Hours';
  }

  return 'Unclaimed Request';
}

// Connect the existing dashboard UI to Firestore.
export async function loadCommunityDashboard() {
  const requestList = document.querySelector('#community-request-list');
  const attentionList = document.querySelector('#community-attention-list');
  const acceptedList = document.querySelector('#community-accepted-list');

  if (!requestList || !attentionList) return;

  requestList.innerHTML = '<p>Loading requests...</p>';
  attentionList.innerHTML = '<p>Loading requests...</p>';
  if (acceptedList) {
  acceptedList.innerHTML = '<p>Loading your accepted requests...</p>';
}

  try {
    const snapshot = await getDocs(collection(db, 'requests'));

    const requests = snapshot.docs.map(documentSnapshot => {
    const data = documentSnapshot.data();

    // Convert the form's tasks array into a readable title.
    const taskNames = Array.isArray(data.tasks) ? data.tasks : [];

    if (data.otherTask?.trim()) {
      taskNames.push(data.otherTask.trim());
    }

    const task = taskNames.length
      ? taskNames.join(', ')
      : 'Untitled Request';

    // Your form uses "submitted", but the dashboard
    // currently expects "open" for a new request.
    const rawStatus = String(data.status || 'submitted')
      .trim()
      .toLowerCase();

    const status = rawStatus === 'submitted'
      ? 'open'
      : rawStatus;

    return {
      id: documentSnapshot.id,
      ...data,
      task,
      fasa: data.area || 'Not specified',
      status,
      isUrgent: ['urgent', 'emergency'].includes(
        String(data.priority || '').toLowerCase()
      ),
      dateNeeded: data.dateNeeded,
      timeNeeded: data.timeNeeded || '',
      details: data.details || '',
      requesterName: data.requesterName || 'Resident'
    };
  });

    const preparedRequests = prepareCommunityRequests(requests);
    const attentionRequests = getAttentionRequests(preparedRequests);
    
    // Load requests accepted by the currently logged-in community member.
    if (acceptedList) {
      const helperUid = auth.currentUser?.uid;

      if (!helperUid) {
        acceptedList.innerHTML =
          '<p>Please log in to view your accepted requests.</p>';
      } else {
        const myAcceptedRequests = requests.filter(
          request => request.acceptedBy === helperUid
        );

        const acceptedWithContacts = await Promise.all(
          myAcceptedRequests.map(async request => {
            let requesterPhone = '';

            try {
              const contactSnapshot = await getDoc(
                doc(db, 'requests', request.id, 'private', 'contact')
              );

              if (contactSnapshot.exists()) {
                requesterPhone =
                  contactSnapshot.data().requesterPhone || '';
              }
            } catch (error) {
              console.error(
                `Could not retrieve contact for ${request.id}:`,
                error
              );
            }

            return { ...request, requesterPhone };
          })
        );

        const escapeHTML = value =>
          String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          })[char]);

        acceptedList.innerHTML = acceptedWithContacts.length
          ? acceptedWithContacts.map(request => {
              const card = renderCommunityRequestCard(request);
              const contactDetails = `
                <div class="jb-accepted-contact">
                  <p><strong>Requester:</strong> ${escapeHTML(
                    request.requesterName || 'Resident'
                  )}</p>
                  <p><strong>Phone:</strong> ${
                    request.requesterPhone
                      ? `<a href="tel:${escapeHTML(request.requesterPhone)}">${escapeHTML(request.requesterPhone)}</a>`
                      : 'Contact unavailable'
                  }</p>
                </div>
              `;

              return card.replace('</article>', `${contactDetails}</article>`);
            }).join('')
          : '<p>You have not accepted any requests yet.</p>';
      }
    }


    // Update the four statistic cards.
    const counts = {
      'stat-open': preparedRequests.filter(r => r.status === 'open').length,
      'stat-accepted': preparedRequests.filter(r => r.status === 'accepted').length,
      'stat-unclaimed': preparedRequests.filter(r => r.status === 'unclaimed').length,
      'stat-completed': preparedRequests.filter(r => r.status === 'completed').length
    };

    Object.entries(counts).forEach(([elementId, count]) => {
      const element = document.getElementById(elementId);
      if (element) element.textContent = count;
    });

    // Render every request using your friend's existing card design.
    requestList.innerHTML = preparedRequests.length
      ? preparedRequests.map(request =>
          renderCommunityRequestCard({
            ...request,
            attentionReason: getAttentionReason(request)
          })
        ).join('')
      : '<p>No requests have been submitted yet.</p>';

    // Render only requests that need attention.
    attentionList.innerHTML = attentionRequests.length
      ? attentionRequests.map(request =>
          renderCommunityRequestCard({
            ...request,
            attentionReason: getAttentionReason(request)
          })
        ).join('')
      : '<p>No requests currently need attention.</p>';

  } catch (error) {
    console.error('Failed to load community requests:', error);

    requestList.innerHTML =
      '<p>Unable to load requests. Please check your connection and Firebase permissions.</p>';

    attentionList.innerHTML =
      '<p>Unable to load requests.</p>';
  }
}
