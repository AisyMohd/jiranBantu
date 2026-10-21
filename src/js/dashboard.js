
import { initRequestForm } from './request.js';

import {
  collection,
  getDocs
} from 'firebase/firestore';

import { auth, db } from '../firebase.js';

import { residentDashboard } from '../components/residentDashboard.js';

import {
  renderCommunityDashboard,
  loadCommunityDashboard
} from './communityDashboard.js';

let dashboard;
let landingNavbar;
let landingMain;
let landingFooter;

let currentRole = 'resident';
let currentPageId = 'overview';
let requestFormInitialized = false;

const residentPages = {
  overview: {
    title: 'All Requests',
    description: 'See how you can support your neighbours.'
  },
  browse: {
    title: 'Help Neighbours',
    description: 'Find requests from neighbours who need assistance.'
  },
  'my-requests': {
    title: 'My Requests',
    description: 'Track the help you have requested.'
  }
};

export function initDashboard() {
  dashboard = document.querySelector('#dashboard');

  landingNavbar = document.querySelector('#app > .navbar');
  landingMain = document.querySelector('#app > main');
  landingFooter = document.querySelector('#app > .footer');

  if (!dashboard) {
    console.error('Dashboard layout #dashboard was not found.');
    return;
  }

  // Shared navigation for Resident and Community dashboards.
  dashboard.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button || button.hidden) return;

    if (currentRole === 'resident') {
      openResidentPage(button.dataset.page);
    } else {
      openCommunityPage(button.dataset.page);
    }
  });

  document.querySelector('#dashboard-brand')
    ?.addEventListener('click', event => {
      event.preventDefault();
      showLandingPage();
    });

  // Request-card actions.
  dashboard.addEventListener('click', event => {
    const detailsButton = event.target.closest('[data-request-details]');
    const helpButton = event.target.closest('[data-request-help]');

    if (detailsButton?._requestData) {
      showRequestDetails(detailsButton._requestData);
    }

    if (helpButton) {
      alert(
        'The request is visible, but accepting a request still needs to be connected to your volunteer workflow.'
      );
    }
  });
}

export function showDashboard(role, profile = {}) {
  currentRole = role === 'community' ? 'community' : 'resident';

  const isCommunity = currentRole === 'community';

  const residentMount = document.querySelector('#resident-dashboard-mount');
  const communityMount = document.querySelector('#community-dashboard-mount');

  if (!residentMount || !communityMount) {
    console.error('Resident or Community dashboard mount was not found.');
    return;
  }

  if (landingNavbar) landingNavbar.hidden = true;
  if (landingMain) landingMain.hidden = true;
  if (landingFooter) landingFooter.hidden = true;

  const authModal = document.querySelector('#auth-modal');
  if (authModal) authModal.hidden = true;

  dashboard.hidden = false;
  document.body.classList.remove('modal-open');

  const userLabel = document.querySelector('#dashboard-user');
  if (userLabel) {
    userLabel.textContent =
      profile.fullName || (isCommunity ? 'Community Team' : 'Resident');
  }

  // Show the correct shared bottom navigation.
  document.querySelectorAll('[data-resident-only]').forEach(element => {
    element.hidden = isCommunity;
  });

  document.querySelectorAll('[data-community-only]').forEach(element => {
    element.hidden = !isCommunity;
  });

  if (isCommunity) {
    residentMount.hidden = true;
    communityMount.hidden = false;

    // Keep the existing Community Dashboard implementation.
    communityMount.innerHTML = renderCommunityDashboard();
    void loadCommunityDashboard();

    openCommunityPage('overview');
    return;
  }

  communityMount.hidden = true;
  residentMount.hidden = false;

  // Render the Resident Dashboard once, inside its designated mount.
  if (!residentMount.firstElementChild) {
    residentMount.innerHTML = residentDashboard();
  }

  const roleLabel = residentMount.querySelector('#dashboard-role');
  if (roleLabel) {
    roleLabel.textContent = 'RESIDENT';
  }

  // Initialize the real request form after its button and shared
  // request-form container exist in the page.
  if (!requestFormInitialized) {
    initRequestForm({
      onSubmitted: () => openResidentPage('my-requests')
    });

    requestFormInitialized = true;
  }

  openResidentPage('overview');
}

function openResidentPage(pageId) {
  const page = residentPages[pageId];
  if (!page) return;

  currentPageId = pageId;

  // These IDs match components/residentDashboard.js.
  const panelTitle = document.querySelector('#dashboard-panel-title');
  const panelDescription = document.querySelector('#dashboard-panel-description');
  const list = document.querySelector('#request-list');

  if (panelTitle) panelTitle.textContent = page.title;
  if (panelDescription) panelDescription.textContent = page.description;

  document.querySelectorAll(
    '#dashboard-sidebar-nav [data-page], .jb-bottom-nav [data-resident-only][data-page]'
  ).forEach(button => {
    button.classList.toggle('active', button.dataset.page === pageId);
  });

  if (!list) {
    console.error('Resident request list #request-list was not found.');
    return;
  }

  list.replaceChildren();
  void loadResidentRequests(list, pageId);
}

async function loadResidentRequests(container, pageId) {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    container.textContent = 'Please log in to view requests.';
    return;
  }

  container.textContent = 'Loading requests...';

  try {
    const snapshot = await getDocs(collection(db, 'requests'));

    // Ignore old results if the resident has changed pages or roles.
    if (
      currentRole !== 'resident' ||
      currentPageId !== pageId ||
      !container.isConnected
    ) {
      return;
    }

    let requests = snapshot.docs.map(documentSnapshot => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }));

    if (pageId === 'my-requests') {
      requests = requests.filter(
        request => request.requesterId === userId
      );
    } else {
      // Overview and Browse show requests available to neighbours.
      requests = requests.filter(request => {
        const status = String(request.status || 'submitted').toLowerCase();

        return ['submitted', 'open', 'unclaimed'].includes(status);
      });

      // Residents should not volunteer for their own requests.
      requests = requests.filter(
        request => request.requesterId !== userId
      );
    }

    requests.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    if (!requests.length) {
      container.textContent = pageId === 'my-requests'
        ? 'You have not submitted any requests yet.'
        : 'There are no available neighbour requests right now.';
      return;
    }

    container.replaceChildren(
      ...requests.map(request => createRequestCard(request, pageId))
    );
  } catch (error) {
    console.error('Failed to load Resident requests:', error);
    container.textContent = 'Unable to load requests. Please try again.';
  }
}

function createRequestCard(request, pageId) {
  const card = document.createElement('article');
  card.className = 'jb-request-card';

  const taskNames = [
    ...(Array.isArray(request.tasks) ? request.tasks : []),
    ...(request.otherTask ? [request.otherTask] : [])
  ];

  const task = taskNames.length
    ? taskNames.join(', ')
    : 'Help request';

  const rawStatus = String(request.status || 'submitted').toLowerCase();
  const status = rawStatus === 'submitted' ? 'Open' : rawStatus;
  const statusClass = status.toLowerCase().replace(/[^a-z-]/g, '');

  const date = request.dateNeeded?.toDate?.();
  const dateLabel = date
    ? date.toLocaleDateString('en-MY')
    : 'Date not specified';

  const heading = document.createElement('div');
  heading.className = 'jb-request-card-heading';

  const title = document.createElement('h3');
  title.textContent = task;

  const statusLabel = document.createElement('span');
  statusLabel.className = `jb-request-status ${statusClass}`;
  statusLabel.textContent = status;

  heading.append(title, statusLabel);

  const meta = document.createElement('p');
  meta.className = 'jb-request-meta';
  meta.textContent =
    `${request.area || 'Neighbourhood not specified'} · ${dateLabel}` +
    `${request.timeNeeded ? ` at ${request.timeNeeded}` : ''}`;

  const details = document.createElement('p');
  details.className = 'jb-request-description';
  details.textContent =
    request.details || 'No additional details provided.';

  const actions = document.createElement('div');
  actions.className = 'jb-request-actions';

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'jb-secondary-btn';
  detailsButton.dataset.requestDetails = request.id;
  detailsButton.textContent = 'View details';

  detailsButton._requestData = {
    ...request,
    task,
    displayStatus: status,
    dateLabel
  };

  actions.append(detailsButton);

  if (
    pageId !== 'my-requests' &&
    ['submitted', 'open', 'unclaimed'].includes(rawStatus)
  ) {
    const helpButton = document.createElement('button');
    helpButton.type = 'button';
    helpButton.className = 'jb-primary-btn';
    helpButton.dataset.requestHelp = request.id;
    helpButton.textContent = 'I Can Help';

    actions.append(helpButton);
  }

  card.append(heading, meta, details, actions);
  return card;
}

function showRequestDetails(request) {
  alert(
    `${request.task}\n\n` +
    `Neighbourhood: ${request.area || 'Not specified'}\n` +
    `Date: ${request.dateLabel}\n` +
    `Time: ${request.timeNeeded || 'Not specified'}\n\n` +
    `${request.details || 'No additional details provided.'}\n\n` +
    `Status: ${request.displayStatus}`
  );
}

function openCommunityPage(pageId) {
  currentPageId = pageId;

  document.querySelectorAll('.jb-bottom-nav [data-community-only]')
    .forEach(button => {
      button.classList.toggle('active', button.dataset.page === pageId);
    });

  if (pageId === 'requests') {
    document.querySelector('#community-request-list')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (pageId === 'escalations') {
    document.querySelector('#community-attention-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    document.querySelector('#community-dashboard-mount')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function showLandingPage() {
  if (dashboard) dashboard.hidden = true;
  if (landingNavbar) landingNavbar.hidden = false;
  if (landingMain) landingMain.hidden = false;
  if (landingFooter) landingFooter.hidden = false;
}
