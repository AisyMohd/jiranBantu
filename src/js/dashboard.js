
let dashboard;
let dashboardNav;
let landingNavbar;
let landingMain;
let landingFooter;
let currentRole = 'resident';

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

  document.querySelector('#dashboard-panel-title').textContent =
    page.label;

  document.querySelector('#dashboard-panel-description').textContent =
    `${page.description} This page is a placeholder for now.`;
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
  
  // Temporary request form navigation
  const needHelpButton = document.querySelector('#need-help-btn');
  const dashboardPlaceholder = document.querySelector('#dashboard-placeholder');
  const requestFormContainer = document.querySelector('#request-form-container');
  const cancelRequestButton = document.querySelector('#cancel-request-btn');
  const temporaryRequestForm = document.querySelector('#temporary-request-form');
  const requestMessage = document.querySelector('#temporary-request-message');

  needHelpButton.addEventListener('click', () => {
    dashboardPlaceholder.hidden = true;
    requestFormContainer.hidden = false;
    requestMessage.textContent = '';
  });

  cancelRequestButton.addEventListener('click', () => {
    requestFormContainer.hidden = true;
    dashboardPlaceholder.hidden = false;
    temporaryRequestForm.reset();
    requestMessage.textContent = '';
  });

  temporaryRequestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    requestMessage.textContent =
      'Test form works! Mira can now develop the actual request form and Firebase submission.';
  });

}

export function showDashboard(role, profile = {}) {
  currentRole = role === 'community' ? 'community' : 'resident';

  const isCommunity = currentRole === 'community';
  const needHelpButton = document.querySelector('#need-help-btn');

if (needHelpButton) {
  needHelpButton.hidden = isCommunity;
}
  landingNavbar.hidden = true;
  landingMain.hidden = true;
  landingFooter.hidden = true;
  document.querySelector('#auth-modal').hidden = true;

  dashboard.hidden = false;
  document.body.classList.remove('modal-open');

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

  dashboardNav.innerHTML = dashboardPages[currentRole].map(page => `
    <button class="dashboard-card" type="button" data-page="${page.id}">
      <h3>${page.label}</h3>
      <p>${page.description}</p>
      <span>Open page →</span>
    </button>
  `).join('');

  openDashboardPage('overview');
}

export function showLandingPage() {
  dashboard.hidden = true;
  landingNavbar.hidden = false;
  landingMain.hidden = false;
  landingFooter.hidden = false;
}

// import {
//   renderResidentDashboard
// } from '../components/residentDashboard.js';

// import {
//   renderCommunityDashboard
// } from '../components/communityDashboard.js';