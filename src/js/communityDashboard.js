
import '../communityDashboard.css';

export {
  renderCommunityDashboard,
  renderCommunityRequestCard
} from '../components/communityDashboard.js';

// Time thresholds in milliseconds
const TWO_HOURS = 2 * 60 * 60 * 1000;
const THREE_HOURS = 3 * 60 * 60 * 1000;

// Convert Firestore Timestamp, Date, or date string
// into a JavaScript Date.
function toDate(value) {
  if (!value) return null;

  let date;

  if (typeof value.toDate === 'function') {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return null;
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

// Determine whether a request needs attention

export function requestNeedsAttention(request, now = new Date()) {
  const status = String(request.status || '')
    .trim()
    .toLowerCase();

  // Accepted, completed and cancelled are excluded.
  if (['accepted', 'completed', 'cancelled'].includes(status)) {
    return false;
  }

  // Unclaimed requests always need attention.
  if (status === 'unclaimed') {
    return true;
  }

  // Urgent requests need attention immediately,
  // provided they are still open.
  if (status === 'open' && request.isUrgent === true) {
    return true;
  }

  return false;
}


// Get only requests requiring attention

export function getAttentionRequests(requests, now = new Date()) {
  const priority = {
    'Urgent Request': 1,
    'Overdue Request': 2,
    'No Volunteer After 2 Hours': 3,
    'Unclaimed Request': 4
  };

  return requests
    .filter(request => requestNeedsAttention(request, now))
    .sort((a, b) => {
      const reasonA = getAttentionReason(a, now);
      const reasonB = getAttentionReason(b, now);

      const priorityA = priority[reasonA] ?? 99;
      const priorityB = priority[reasonB] ?? 99;

      return priorityA - priorityB;
    });
}



export function getEffectiveStatus(request, now = new Date()) {
  const status = String(request.status || '')
    .trim()
    .toLowerCase();

  // Only open requests can become unclaimed.
  if (status !== 'open') {
    return status;
  }

  const submittedAt = toDate(request.createdAt);
  const neededAt = toDate(request.dateNeeded);

  const noVolunteerAfterTwoHours =
    submittedAt !== null &&
    now.getTime() - submittedAt.getTime() >= TWO_HOURS;

  const overdueThreeHours =
    neededAt !== null &&
    now.getTime() - neededAt.getTime() >= THREE_HOURS;

  if (noVolunteerAfterTwoHours || overdueThreeHours) {
    return 'unclaimed';
  }

  return 'open';
}

export function prepareCommunityRequests(requests, now = new Date()) {
  return requests.map(request => ({
    ...request,
    status: getEffectiveStatus(request, now)
  }));
}


export function getAttentionReason(request, now = new Date()) {
  const status = String(request.status || '')
    .trim()
    .toLowerCase();

  // Requests already handled don't need attention
  if (['accepted', 'completed', 'cancelled'].includes(status)) {
    return null;
  }

  // Urgent open requests
  if (status === 'open' && request.isUrgent === true) {
    return 'Urgent Request';
  }

  // Only unclaimed requests continue below
  if (status !== 'unclaimed') {
    return null;
  }

  const neededAt = toDate(request.dateNeeded);
  const submittedAt = toDate(request.createdAt);

  // Overdue by 3 hours
  if (
    neededAt &&
    now.getTime() - neededAt.getTime() >= THREE_HOURS
  ) {
    return 'Overdue Request';
  }

  // No volunteer after 2 hours
  if (
    submittedAt &&
    now.getTime() - submittedAt.getTime() >= TWO_HOURS
  ) {
    return 'No Volunteer After 2 Hours';
  }

  return 'Unclaimed Request';
}

