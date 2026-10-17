
import { auth, db } from '../firebase.js';

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { showDashboard, showLandingPage } from './dashboard.js';

let modal;
let form;
let registerFields;
let phoneInput;
let fullNameInput;
let areaInput;
let notice;
let otpSection;
let otpInput;
let submitButton;
let verifyButton;

let authMode = 'login';
let confirmationResult = null;
let recaptchaVerifier = null;

function showNotice(message) {
  notice.textContent = message;
}

function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

function openAuth(mode) {
  authMode = mode;
  confirmationResult = null;

  modal.hidden = false;
  document.body.classList.add('modal-open');

  showNotice('');
  otpSection.hidden = true;
  otpInput.value = '';
  phoneInput.disabled = false;
  submitButton.disabled = false;
  submitButton.textContent = 'Send Verification Code';

  const isRegister = mode === 'register';

  document.querySelector('#modal-eyebrow').textContent =
    isRegister ? 'JOIN YOUR COMMUNITY' : 'WELCOME BACK';

  document.querySelector('#modal-title').textContent =
    isRegister ? 'Join your neighbours.' : 'Welcome back.';

  document.querySelector('#modal-description').textContent =
    isRegister
      ? 'Create your account using your phone number.'
      : 'Sign in using your phone number.';

  document.querySelector('#switch-auth').textContent =
    isRegister ? 'Login' : 'Register';

  document.querySelector('#modal-switch').firstChild.textContent =
    isRegister
      ? 'Already have an account? '
      : 'New to JiranBantu? ';

  registerFields.hidden = !isRegister;
  fullNameInput.required = isRegister;
  areaInput.required = isRegister;

  resetRecaptcha();
  phoneInput.focus();
}

function closeAuth() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function normalizeMalaysianPhoneNumber(input) {
  // Remove spaces, dashes, and brackets.
  const phone = input.trim().replace(/[\s()-]/g, '');

  let normalized;

  if (phone.startsWith('+60')) {
    normalized = phone;
  } else if (phone.startsWith('60')) {
    normalized = `+${phone}`;
  } else if (phone.startsWith('0')) {
    normalized = `+60${phone.slice(1)}`;
  } else {
    return {
      valid: false,
      message: 'Enter a Malaysian number starting with 01, 60, or +60.'
    };
  }

  // Malaysian mobile numbers generally have 9 or 10 digits
  // after the country code, depending on the prefix.
  if (!/^\+601\d{8,9}$/.test(normalized)) {
    return {
      valid: false,
      message: 'Please check your Malaysian mobile number. Example: 0123456789.'
    };
  }

  return {
    valid: true,
    phone: normalized
  };
}

async function sendOtp(event) {
    event.preventDefault();
    showNotice('');

  
    const phoneResult = normalizeMalaysianPhoneNumber(phoneInput.value);

    if (!phoneResult.valid) {
    showNotice(phoneResult.message);
    return;
    }

    const phone = phoneResult.phone;
    phoneInput.value = phone;


    if (authMode === 'register') {
        if (!fullNameInput.value.trim() || !areaInput.value.trim()) {
        showNotice('Please enter your full name and residential area.');
        return;
        }
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending code...';

        resetRecaptcha();

        recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
            size: 'normal',
            callback: () => {
            showNotice('Verification complete. Sending your code...');
            },
            'expired-callback': () => {
            showNotice('reCAPTCHA expired. Please try again.');
            }
        }
        );

        await recaptchaVerifier.render();

        confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier
        );

        phoneInput.disabled = true;
        otpSection.hidden = false;
        otpInput.required = true;
        submitButton.textContent = 'Code Sent';
        submitButton.disabled = true;

        showNotice('Verification code sent. Enter the SMS code below.');
        otpInput.focus();
    } 
catch (error) {
  console.error('Send OTP error:', error);

  const messages = {
    'auth/invalid-phone-number':
      'Invalid phone number. Enter a valid Malaysian number, e.g. +60123456789.',

    'auth/operation-not-allowed':
      'SMS delivery is not allowed for this region. Check Firebase SMS region settings.',

    'auth/billing-not-enabled':
      'Firebase billing must be configured for real SMS. Use a configured test number during development.',

    'auth/too-many-requests':
      'Too many attempts. Please wait before trying again.',

    'auth/quota-exceeded':
      'The SMS quota has been reached. Please try again later.',

    'auth/captcha-check-failed':
      'reCAPTCHA verification failed. Please try again.',

    'auth/invalid-app-credential':
      'App verification failed. Refresh the page and try again.'
  };

  showNotice(
    messages[error.code] ||
    `Could not send the verification code. ${error.message}`
  );

  resetRecaptcha();
  submitButton.disabled = false;
  submitButton.textContent = 'Try Again';
}

}

async function verifyOtp() {
  showNotice('');

  const code = otpInput.value.trim();

  if (!confirmationResult) {
    showNotice('Please request a verification code first.');
    return;
  }

  if (!/^\d{6}$/.test(code)) {
    showNotice('Enter the 6-digit verification code.');
    return;
  }

  try {
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';

    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const profileRef = doc(db, 'users', user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (authMode === 'register') {
      if (profileSnapshot.exists()) {
        const profile = profileSnapshot.data();
        showDashboard(profile.role, profile);
        return;
      }

      const profile = {
        uid: user.uid,
        phone: user.phoneNumber || phoneInput.value.trim(),
        fullName: fullNameInput.value.trim(),
        area: areaInput.value.trim(),
        role: 'resident',
        createdAt: serverTimestamp()
      };

      await setDoc(profileRef, profile);

      showDashboard('resident', profile);
      return;
    }

    if (!profileSnapshot.exists()) {
      await signOut(auth);
      showNotice('No JiranBantu profile found. Please register first.');
      return;
    }

    const profile = profileSnapshot.data();
    showDashboard(profile.role, profile);
  } catch (error) {
    console.error('Verify OTP error:', error);

    showNotice(
      error.code === 'auth/invalid-verification-code'
        ? 'Incorrect code. Please check the SMS and try again.'
        : `Verification failed: ${error.message}`
    );
  } finally {
    verifyButton.disabled = false;
    verifyButton.textContent = 'Verify Code';
  }
}

export function initAuth() {
  // Query the page only after main.js has inserted its HTML.
  modal = document.querySelector('#auth-modal');
  form = document.querySelector('#auth-form');
  registerFields = document.querySelector('#register-fields');
  phoneInput = document.querySelector('#phone');
  fullNameInput = document.querySelector('#full-name');
  areaInput = document.querySelector('#area');
  notice = document.querySelector('#form-notice');
  otpSection = document.querySelector('#otp-section');
  otpInput = document.querySelector('#otp');
  submitButton = document.querySelector('#submit-auth');
  verifyButton = document.querySelector('#verify-otp-btn');

  document.querySelector('#login-btn')
    .addEventListener('click', () => openAuth('login'));

  document.querySelector('#register-btn')
    .addEventListener('click', () => openAuth('register'));

  document.querySelector('#get-started-btn')
    .addEventListener('click', () => openAuth('register'));

  document.querySelector('#close-modal')
    .addEventListener('click', closeAuth);

  document.querySelector('#switch-auth')
    .addEventListener('click', () => {
      openAuth(authMode === 'login' ? 'register' : 'login');
    });

  modal.addEventListener('click', event => {
    if (event.target === modal) closeAuth();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeAuth();
  });

  form.addEventListener('submit', sendOtp);
  verifyButton.addEventListener('click', verifyOtp);

  document.querySelector('#logout-btn')
    .addEventListener('click', async () => {
      try {
        await signOut(auth);
        showLandingPage();
        openAuth('login');
        showNotice('You have logged out successfully.');
      } catch (error) {
        console.error('Logout error:', error);
        showNotice('Logout failed. Please try again.');
      }
    });
}
