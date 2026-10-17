
import './style.css';

import { initAuth } from './js/auth.js';
import { initDashboard } from './js/dashboard.js';

import { navbar } from './components/navbar.js';
import { homepage } from './components/homepage.js';
import { authModal } from './components/authModal.js';
import { dashboardLayout } from './components/dashboardLayout.js';

document.querySelector('#app').innerHTML = `
  ${navbar()}
  ${homepage()}
  ${authModal()}
  ${dashboardLayout()}
`;

initDashboard();
initAuth();
