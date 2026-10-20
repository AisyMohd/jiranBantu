
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

const sampleRequests = [
  {
    id: 1,
    tasks: 'Buy groceries',
    area: 'Fasa 6',
    date: '21 Oct 2026 at 10:00',
    submitted: '20 Oct, 3:19 pm',
    description: 'A few groceries from the nearby shop.',
    status: 'Open',
    statusClass: 'open',
    message: 'Open — waiting for a volunteer.',
    canHelp: true
  },
  {
    id: 2,
    tasks: 'Transport',
    area: 'Fasa 6',
    date: '21 Oct 2026 at 14:00',
    submitted: '4 hours ago',
    description: 'A lift to the community centre.',
    status: 'Unclaimed',
    statusClass: 'unclaimed',
    message: 'Open — waiting for a volunteer.',
    canHelp: true
  },
  {
    id: 3,
    tasks: 'Household Help',
    area: 'Fasa 5',
    date: '22 Oct 2026 at 09:30',
    submitted: '20 Oct, 2:19 pm',
    description: 'Help carrying a small parcel upstairs.',
    status: 'Open',
    statusClass: 'open',
    message: 'Open — waiting for a volunteer.',
    canHelp: true
  },
  {
    id: 4,
    tasks: 'Transport',
    area: 'Fasa 6',
    date: '23 Oct 2026 at 11:00',
    submitted: '19 Oct, 4:19 pm',
    description: 'A lift for an appointment.',
    status: 'Accepted',
    statusClass: 'accepted',
    message: 'Accepted — a volunteer has accepted.',
    canHelp: false
  }
];

function renderRequests() {
  const requestList = document.querySelector('#request-list');

  if (!requestList) return;

  requestList.innerHTML = sampleRequests.map(request => `
    <article class="jb-request-card">
      <div class="jb-request-card-heading">
        <h3>${request.tasks}</h3>
        <span class="jb-request-status ${request.statusClass}">
          ${request.status}
        </span>
      </div>

      <p class="jb-request-meta">
        ${request.area} · ${request.date} · Submitted ${request.submitted}
      </p>

      <p class="jb-request-description">
        ${request.description}
      </p>

      <p class="jb-request-state">
        ${request.message}
      </p>

      <div class="jb-request-actions">
        <button
          type="button"
          class="jb-secondary-btn"
          data-request-details="${request.id}"
        >
          View details
        </button>

        ${request.canHelp ? `
          <button
            type="button"
            class="jb-primary-btn"
            data-request-help="${request.id}"
          >
            I Can Help
          </button>
        ` : ''}
      </div>
    </article>
  `).join('');
}



function openDashboardPage(pageId) {
  const page = dashboardPages[currentRole].find(
    item => item.id === pageId
  );

  if (!page) return;

  const title = document.querySelector('#dashboard-panel-title');
  const description = document.querySelector('#dashboard-panel-description');
  const requestList = document.querySelector('#request-list');
  const requestForm = document.querySelector('#request-form-container');
  const placeholder = document.querySelector('#dashboard-placeholder');

  // Keep the home page focused on requests.
  if (currentRole === 'resident' &&
      (pageId === 'overview' || pageId === 'browse')) {
    title.textContent = 'All Requests';
    description.textContent =
      'See how you can support your neighbours.';

    placeholder.hidden = false;
    requestForm.hidden = true;
    renderRequests();
  } else {
    title.textContent = page.label;
    description.textContent = page.description;

    placeholder.hidden = false;
    requestForm.hidden = true;

    if (requestList) {
      requestList.innerHTML = `
        <p class="jb-empty-message">
          This page is a placeholder for now.
        </p>
      `;
    }
  }

  document.querySelectorAll(
    '#dashboard-sidebar-nav [data-page], .jb-bottom-nav [data-page]'
  ).forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.page === pageId
    );
  });
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

  
  // Handle request card actions.
  document.querySelector('#request-list').addEventListener('click', event => {
    const detailsButton = event.target.closest('[data-request-details]');
    const helpButton = event.target.closest('[data-request-help]');

    if (detailsButton) {
      const request = sampleRequests.find(
        item => item.id === Number(detailsButton.dataset.requestDetails)
      );

      if (request) {
        alert(
          `${request.title}\n\n` +
          `Area: ${request.area}\n` +
          `Date: ${request.date}\n\n` +
          `${request.description}\n\n` +
          `Status: ${request.status}`
        );
      }
    }

    if (helpButton) {
      const request = sampleRequests.find(
        item => item.id === Number(helpButton.dataset.requestHelp)
      );

      if (request) {
        alert(
          `You selected "${request.title}".\n\n` +
          'Volunteer confirmation will be implemented later.'
        );
      }
    }
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

   // Connect the new sidebar and bottom navigation to existing pages.
  document.querySelectorAll(
    '#dashboard-sidebar-nav [data-page], .jb-bottom-nav [data-page]'
  ).forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.page;

      openDashboardPage(pageId);

      document.querySelectorAll(
        '#dashboard-sidebar-nav [data-page], .jb-bottom-nav [data-page]'
      ).forEach(link => {
        link.classList.toggle(
          'active',
          link.dataset.page === pageId
        );
      });
    });
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

  const userName = profile.fullName || 'Resident';

  document.querySelector('#dashboard-title').textContent =
  `Welcome, ${userName}`;

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