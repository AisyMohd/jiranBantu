
import { initRequestForm } from './request.js';


import {
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
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
  
  // Request-card actions.
  
dashboard.addEventListener('click', async event => {
  
  // COMMUNITY DASHBOARD — View Details
  const communityDetailsButton = event.target.closest('[data-request-id]');

  if (communityDetailsButton && currentRole === 'community') {
    const requestId = communityDetailsButton.dataset.requestId;

    try {
      const requestSnapshot = await getDoc(doc(db, 'requests', requestId));

      if (!requestSnapshot.exists()) {
        showAppModal({
          title: 'Request Not Found',
          message: 'This request may have been removed.',
          buttons: [{ label: 'Close' }]
        });
        return;
      }

      const data = requestSnapshot.data();
      const taskNames = [
        ...(Array.isArray(data.tasks) ? data.tasks : []),
        ...(data.otherTask?.trim() ? [data.otherTask.trim()] : [])
      ];

      const neededDate = data.dateNeeded?.toDate
        ? data.dateNeeded.toDate()
        : data.dateNeeded
          ? new Date(data.dateNeeded)
          : null;

      showRequestDetails({
        task: taskNames.join(', ') || 'Help request',
        area: data.area || 'Not specified',
        date: neededDate && !Number.isNaN(neededDate.getTime())
          ? neededDate.toLocaleDateString('en-MY')
          : 'Date not specified',
        time: data.timeNeeded || 'Not specified',
        details: data.details || 'No additional details provided.',
        status: data.status === 'submitted'
          ? 'Open'
          : data.status || 'Open'
      });
    } catch (error) {
      console.error('Failed to load community request details:', error);

      showAppModal({
        title: 'Unable to Load Details',
        message: 'Please try again.',
        buttons: [{ label: 'Close' }]
      });
    }

    return;
  }

  // COMMUNITY DASHBOARD — I Can Help
  const communityHelpButton = event.target.closest('[data-help-request-id]');

  if (communityHelpButton && currentRole === 'community') {
    const requestId = communityHelpButton.dataset.helpRequestId;
    const helperUid = auth.currentUser?.uid;

    if (!helperUid) {
      showAppModal({
        title: 'Login Required',
        message: 'Please log in before accepting a request.',
        buttons: [{ label: 'Close' }]
      });
      return;
    }

    try {
      const requestSnapshot = await getDoc(doc(db, 'requests', requestId));

      if (!requestSnapshot.exists()) {
        showAppModal({
          title: 'Request Not Found',
          message: 'This request may have been removed.',
          buttons: [{ label: 'Close' }]
        });
        return;
      }

      const data = requestSnapshot.data();

      if (data.requesterId === helperUid) {
        showAppModal({
          title: 'Your Own Request',
          message: 'You cannot accept your own request.',
          buttons: [{ label: 'Close' }]
        });
        return;
      }

      if (data.status !== 'submitted' || data.acceptedBy !== null) {
        showAppModal({
          title: 'Request Unavailable',
          message: 'This request has already been taken or is no longer available.',
          buttons: [{ label: 'Close' }]
        });
        return;
      }

      const taskNames = [
        ...(Array.isArray(data.tasks) ? data.tasks : []),
        ...(data.otherTask?.trim() ? [data.otherTask.trim()] : [])
      ];

      const neededDate = data.dateNeeded?.toDate
        ? data.dateNeeded.toDate()
        : data.dateNeeded
          ? new Date(data.dateNeeded)
          : null;

      const requestData = {
        task: taskNames.join(', ') || 'Help request',
        area: data.area || 'Not specified',
        date: neededDate && !Number.isNaN(neededDate.getTime())
          ? neededDate.toLocaleDateString('en-MY')
          : 'Date not specified',
        time: data.timeNeeded || 'Not specified',
        details: data.details || 'No additional details provided.',
        status: 'Open'
      };

      showAppModal({
        title: 'Help Your Neighbour',
        message: 'Would you like to accept this request? Once confirmed, you will be assigned to help this neighbour.',
        requestData,
        buttons: [
          { label: 'Cancel', style: 'secondary' },
          {
            label: 'Yes, I Can Help',
            style: 'primary',
            onClick: async ({ close, button }) => {
              button.disabled = true;
              button.textContent = 'Accepting...';

              try {
                const requestRef = doc(db, 'requests', requestId);

                await runTransaction(db, async transaction => {
                  const snapshot = await transaction.get(requestRef);

                  if (!snapshot.exists()) {
                    throw new Error('This request no longer exists.');
                  }

                  const request = snapshot.data();

                  if (
                    request.requesterId === helperUid ||
                    request.status !== 'submitted' ||
                    request.acceptedBy !== null
                  ) {
                    throw new Error('This request is no longer available. Please refresh.');
                  }

                  transaction.update(requestRef, {
                    status: 'accepted',
                    acceptedBy: helperUid,
                    updatedAt: serverTimestamp()
                  });
                });

                close();

                let phone = '';

                try {
                  const contactSnapshot = await getDoc(
                    doc(db, 'requests', requestId, 'private', 'contact')
                  );

                  if (contactSnapshot.exists()) {
                    phone = contactSnapshot.data().requesterPhone || '';
                  }
                } catch (contactError) {
                  console.error('Could not retrieve requester contact:', contactError);
                }

                showAppModal({
                  title: 'Thank You for Helping!',
                  message: phone
                    ? `You have accepted this request successfully. Contact the requester at ${phone}.`
                    : 'You accepted the request successfully, but the contact number could not be retrieved.',
                  buttons: [{
                    label: 'Done',
                    style: 'primary',
                    onClick: ({ close: closeSuccess }) => {
                      closeSuccess();
                      void loadCommunityDashboard();
                    }
                  }]
                });
              } catch (error) {
                console.error('Failed to accept community request:', error);
                close();

                showAppModal({
                  title: 'Unable to Accept Request',
                  message: error.message || 'Something went wrong. Please try again.',
                  buttons: [{
                    label: 'Close',
                    style: 'secondary',
                    onClick: ({ close: closeError }) => {
                      closeError();
                      void loadCommunityDashboard();
                    }
                  }]
                });
              }
            }
          }
        ]
      });
    } catch (error) {
      console.error('Failed to prepare community help request:', error);

      showAppModal({
        title: 'Unable to Accept Request',
        message: 'Unable to check this request. Please try again.',
        buttons: [{ label: 'Close' }]
      });
    }

    return;
  }

  const detailsButton = event.target.closest('[data-request-details]');
  const helpButton = event.target.closest('[data-request-help]');

  if (detailsButton?._requestData) {
    showRequestDetails(detailsButton._requestData);
    return;
  }

  if (!helpButton) return;

  const requestId = helpButton.dataset.requestHelp;
  const helperUid = auth.currentUser?.uid;

  if (!helperUid) {
    showAppModal({
      title: 'Login Required',
      message: 'Please log in before accepting a request.',
      buttons: [{ label: 'Close' }]
    });
    return;
  }

  showAppModal({
    title: 'Help Your Neighbour',
    message:
      'Would you like to accept this request? ' +
      'Once confirmed, you will be assigned to help this neighbour.',
    requestData: helpButton._requestData,
    buttons: [
      {
        label: 'Cancel',
        style: 'secondary'
      },
      {
        label: 'Yes, I Can Help',
        style: 'primary',
        onClick: async ({ close, button }) => {
          button.disabled = true;
          button.textContent = 'Accepting...';

          try {
            const requestRef = doc(db, 'requests', requestId);

            await runTransaction(db, async transaction => {
              const snapshot = await transaction.get(requestRef);

              if (!snapshot.exists()) {
                throw new Error('This request no longer exists.');
              }

              const request = snapshot.data();

              if (request.requesterId === helperUid) {
                throw new Error('You cannot accept your own request.');
              }

              if (
                request.status !== 'submitted' ||
                request.acceptedBy !== null
              ) {
                throw new Error(
                  'This request has already been taken. Please refresh.'
                );
              }

              transaction.update(requestRef, {
                status: 'accepted',
                acceptedBy: helperUid,
                updatedAt: serverTimestamp()
              });
            });

            close();

            // Only the accepted helper can read this private contact.
            const contactRef = doc(
              db,
              'requests',
              requestId,
              'private',
              'contact'
            );

            let phone = '';

            try {
              const contactSnapshot = await getDoc(contactRef);

              if (contactSnapshot.exists()) {
                phone = contactSnapshot.data().requesterPhone || '';
              }
            } catch (contactError) {
              console.error(
                'Could not retrieve requester contact:',
                contactError
              );
            }

            showAppModal({
              title: 'Thank You for Helping!',
              message: phone
                ? `You have accepted this request successfully. Contact the requester at ${phone}.`
                : 'You accepted the request successfully, but the contact number could not be retrieved.',
              buttons: [
                {
                  label: 'Done',
                  style: 'primary',
                  onClick: ({ close: closeSuccess }) => {
                    closeSuccess();
                    openResidentPage(currentPageId);
                  }
                }
              ]
            });

          } catch (error) {
            console.error('Failed to accept request:', error);

            close();

            showAppModal({
              title: 'Unable to Accept Request',
              message:
                error.message ||
                'Something went wrong. Please try again.',
              buttons: [
                {
                  label: 'Close',
                  style: 'secondary',
                  onClick: ({ close: closeError }) => {
                    closeError();
                    openResidentPage(currentPageId);
                  }
                }
              ]
            });
          }
        }
      }
    ]
  });
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

  const rawStatus = String(
    request.status || 'submitted'
  ).toLowerCase();

  const status = rawStatus === 'submitted' ? 'Open' : rawStatus;

  const statusClass = status
    .toLowerCase()
    .replace(/[^a-z-]/g, '');

  const date = request.dateNeeded?.toDate?.();

  const dateLabel = date
    ? date.toLocaleDateString('en-MY')
    : 'Date not specified';

  const requestData = {
    ...request,
    task,
    area: request.area || 'Neighbourhood not specified',
    date: dateLabel,
    time: request.timeNeeded || 'Time not specified',
    details: request.details || 'No additional details provided.',
    status
  };

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
    `${requestData.area} · ${dateLabel}` +
    (request.timeNeeded ? ` at ${request.timeNeeded}` : '');

  const description = document.createElement('p');
  description.className = 'jb-request-description';
  description.textContent = requestData.details;

  const actions = document.createElement('div');
  actions.className = 'jb-request-actions';

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'jb-secondary-btn';
  detailsButton.dataset.requestDetails = request.id;
  detailsButton.textContent = 'View Details';
  detailsButton._requestData = requestData;

  actions.append(detailsButton);

  if (
    pageId !== 'my-requests' &&
    rawStatus === 'submitted'
  ) {
    const helpButton = document.createElement('button');
    helpButton.type = 'button';
    helpButton.className = 'jb-primary-btn';
    helpButton.dataset.requestHelp = request.id;
    helpButton.textContent = 'I Can Help';
    helpButton._requestData = requestData;

    actions.append(helpButton);
  }

  card.append(heading, meta, description, actions);

  return card;
}



function showRequestDetails(request) {
  showAppModal({
    title: 'Request Details',
    message: 'Here is what your neighbour needs help with.',
    requestData: request,
    buttons: [
      {
        label: 'Close',
        style: 'secondary'
      }
    ]
  });
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

function showAppModal({
  title,
  message = '',
  requestData = null,
  buttons = []
}) {
  // Remove an existing request modal, if present.
  document.querySelector('.jb-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'jb-modal-overlay';

  const modal = document.createElement('section');
  modal.className = 'jb-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', title);

  const header = document.createElement('div');
  header.className = 'jb-modal-header';

  const heading = document.createElement('h2');
  heading.className = 'jb-modal-title';
  heading.textContent = title;

  const closeButton = document.createElement('button');
  closeButton.className = 'jb-modal-close';
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close');

  header.append(heading, closeButton);
  modal.append(header);

  if (message) {
    const paragraph = document.createElement('p');
    paragraph.className = 'jb-modal-message';
    paragraph.textContent = message;
    modal.append(paragraph);
  }

  if (requestData) {
    const details = document.createElement('div');
    details.className = 'jb-modal-details';

    const fields = [
      ['Help needed', requestData.task],
      ['Area', requestData.area],
      ['Date needed', requestData.date],
      ['Time', requestData.time],
      ['Additional details', requestData.details],
      ['Status', requestData.status]
    ];

    fields.forEach(([label, value]) => {
      if (!value) return;

      const item = document.createElement('div');
      item.className = 'jb-modal-detail';

      const fieldLabel = document.createElement('span');
      fieldLabel.className = 'jb-modal-detail-label';
      fieldLabel.textContent = label;

      const fieldValue = document.createElement('div');
      fieldValue.className = 'jb-modal-detail-value';
      fieldValue.textContent = value;

      item.append(fieldLabel, fieldValue);
      details.append(item);
    });

    modal.append(details);
  }

  const actions = document.createElement('div');
  actions.className = 'jb-modal-actions';

  function closeModal() {
    overlay.remove();
  }

  closeButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeModal();
  });

  buttons.forEach(({ label, style = 'secondary', onClick }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className =
      `jb-modal-btn jb-modal-btn-${style}`;
    button.textContent = label;

    button.addEventListener('click', async () => {
      if (onClick) {
        await onClick({
          close: closeModal,
          button
        });
      } else {
        closeModal();
      }
    });

    actions.append(button);
  });

  modal.append(actions);
  overlay.append(modal);
  document.body.append(overlay);

  closeButton.focus();

  return { close: closeModal };
}

