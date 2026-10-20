
import { initRequestForm } from './request.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { renderCommunityDashboard, loadCommunityDashboard } from './communityDashboard.js';

let dashboard;
let dashboardNav;
let landingNavbar;
let landingMain;
let landingFooter;
let currentRole = 'resident';
let currentPageId = 'overview';

const dashboardPages = {
  resident: [
    { id: 'overview', label: 'Overview', description: 'Your neighbourhood at a glance.' },
    { id: 'browse', label: 'Browse Requests', description: 'Find neighbours who need help.' },
    { id: 'my-requests', label: 'My Requests', description: 'Track your help requests.' },
    { id: 'my-offers', label: 'My Offers', description: 'Track help you have offered.' },
    { id: 'profile', label: 'My Profile', description: 'Your account and area details.' }
  ],
  community: [
    { id: 'overview', label: 'Overview', description: 'Community activity at a glance.' },
    { id: 'requests', label: 'All Requests', description: 'Review neighbourhood requests.' },
    { id: 'escalations', label: 'Escalations', description: 'Review requests needing more support.' },
    { id: 'manage', label: 'Manage Requests', description: 'Monitor request progress.' }
  ]
};

function openDashboardPage(pageId) {
  const page = dashboardPages[currentRole].find(
    item => item.id === pageId
  );

  if (!page) return;

  currentPageId = pageId;

  const panelTitle = document.querySelector('#dashboard-panel-title');
  const description = document.querySelector('#dashboard-panel-description');
  const requestList = document.querySelector('#dashboard-request-list');
  const communityMount = document.querySelector('#community-dashboard-mount');
  const dashboardPlaceholder = document.querySelector('#dashboard-placeholder');

  const isCommunityOverview =
    currentRole === 'community' && pageId === 'overview';

  // Update the standard dashboard panel.
  panelTitle.hidden = isCommunityOverview;
  description.hidden = isCommunityOverview;
  requestList.hidden = isCommunityOverview || pageId !== 'my-requests';

  panelTitle.textContent = page.label;
  description.textContent = page.description;

  requestList.replaceChildren();

  // Show the dedicated Community Dashboard UI.
  communityMount.hidden = !isCommunityOverview;

  if (isCommunityOverview) {
    communityMount.innerHTML = renderCommunityDashboard();
    return;
  }

  // Reset the mount when navigating away.
  communityMount.replaceChildren();

  if (pageId === 'my-requests') {
    void loadMyRequests(requestList);
  }
}

async function loadMyRequests(container) {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    container.textContent = 'Please log in to view your requests.';
    return;
  }

  container.textContent = 'Loading your requests...';

  try {
    const requestsQuery = query(
      collection(db, 'requests'),
      where('requesterId', '==', userId)
    );
    const snapshot = await getDocs(requestsQuery);

    if (currentPageId !== 'my-requests') return;

    const requests = snapshot.docs
      .map(request => ({ id: request.id, ...request.data() }))
      .sort((first, second) => {
        const firstTime = first.createdAt?.toMillis?.() || 0;
        const secondTime = second.createdAt?.toMillis?.() || 0;
        return secondTime - firstTime;
      });

    if (requests.length === 0) {
      container.textContent = 'You have not submitted any requests yet.';
      return;
    }

    container.replaceChildren(...requests.map(createRequestCard));
  } catch (error) {
    console.error('Error loading requests:', error);
    container.textContent = 'Unable to load your requests. Please try again.';
  }
}

function createRequestCard(request) {
  const card = document.createElement('article');
  card.className = 'request-list-card';

  const heading = document.createElement('h3');
  const taskNames = [
    ...(Array.isArray(request.tasks) ? request.tasks : []),
    ...(request.otherTask ? [request.otherTask] : [])
  ];
  heading.textContent = taskNames.length > 0
    ? taskNames.join(', ')
    : 'Help request';

  const details = document.createElement('p');
  const date = request.dateNeeded?.toDate?.();
  const dateLabel = date
    ? date.toLocaleDateString()
    : 'Date not available';
  details.textContent = `${request.area || 'Neighbourhood not specified'} · ${dateLabel}${request.timeNeeded ? ` at ${request.timeNeeded}` : ''}`;

  const status = document.createElement('span');
  status.className = 'request-list-status';
  status.textContent = request.status || 'submitted';

  card.append(heading, details, status);
  return card;
}

export function initDashboard() {
  dashboard = document.querySelector('#dashboard');
  dashboardNav = document.querySelector('#dashboard-nav');
  landingNavbar = document.querySelector('#app > .navbar');
  landingMain = document.querySelector('#app > main');
  landingFooter = document.querySelector('#app > .footer');

  dashboardNav.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (button) openDashboardPage(button.dataset.page);
  });

  document.querySelector('#dashboard-brand').addEventListener('click', event => {
    event.preventDefault();
    showLandingPage();
  });

  initRequestForm({
    onSubmitted: () => openDashboardPage('my-requests')
  });
}

export function showDashboard(role, profile = {}) {
  currentRole = role === 'community' ? 'community' : 'resident';

  const isCommunity = currentRole === 'community';

  const needHelpButton = document.querySelector('#need-help-btn');
  const residentContent = document.querySelector(
    '#resident-dashboard-content'
  );
  const communityMount = document.querySelector(
    '#community-dashboard-mount'
  );

  if (needHelpButton) {
    needHelpButton.hidden = isCommunity;
  }

  landingNavbar.hidden = true;
  landingMain.hidden = true;
  landingFooter.hidden = true;
  document.querySelector('#auth-modal').hidden = true;

  dashboard.hidden = false;
  document.body.classList.remove('modal-open');

  // Shared navbar and heading
  document.querySelector('#dashboard-user').textContent =
    profile.fullName || (isCommunity ? 'Community Team' : 'Resident');

  document.querySelector('#dashboard-role').textContent =
    isCommunity ? 'COMMUNITY MANAGEMENT' : 'YOUR NEIGHBOURHOOD';

  document.querySelector('#dashboard-title').textContent =
    isCommunity ? 'Community Dashboard' : 'Resident Dashboard';

  document.querySelector('#dashboard-description').textContent =
    isCommunity
      ? 'Coordinate support and monitor requests across your community.'
      : 'Ask for help, offer help, and support your neighbours.';

  if (isCommunity) {
    // Show the separate Community Dashboard.
    dashboardNav.innerHTML = '';
    residentContent.hidden = true;

    communityMount.hidden = false;
    communityMount.innerHTML = renderCommunityDashboard();

    // Do not call openDashboardPage() for community here.
    loadCommunityDashboard();
  } else {
    // Show the existing Resident Dashboard.
    communityMount.hidden = true;
    communityMount.replaceChildren();

    residentContent.hidden = false;

    dashboardNav.innerHTML = dashboardPages.resident.map(page => `
      <button class="dashboard-card" type="button" data-page="${page.id}">
        <h3>${page.label}</h3>
        <p>${page.description}</p>
        <span>Open page →</span>
      </button>
    `).join('');

    openDashboardPage('overview');
  }
}

export function showLandingPage() {
  dashboard.hidden = true;
  landingNavbar.hidden = false;
  landingMain.hidden = false;
  landingFooter.hidden = false;
}

