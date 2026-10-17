
import { auth, db } from '../firebase.js';

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  reload
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
let accountType;
let residentFields;
let communityFields;
let registerFields;
let communityRegisterFields;
let phoneInput;
let fullNameInput;
let genderInput;
let areaInput;
let dateOfBirthInput;
let communityNameInput;
let emailInput;
let passwordInput;
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

  const container = document.querySelector('#recaptcha-container');
  if (container) container.innerHTML = '';
}

function isResident() {
  return accountType.value === 'resident';
}

function updateAccountFields() {
  const resident = isResident();

  residentFields.hidden = !resident;
  communityFields.hidden = resident;

  // Hide and disable fields that do not belong to the selected account.
  phoneInput.required = resident;
  emailInput.required = !resident;
  passwordInput.required = !resident;

  phoneInput.disabled = !resident;
  emailInput.disabled = resident;
  passwordInput.disabled = resident;

  fullNameInput.required = resident && authMode === 'register';
  genderInput.required = resident && authMode === 'register';
  areaInput.required = resident && authMode === 'register';
  dateOfBirthInput.required = resident && authMode === 'register';

  fullNameInput.disabled = !resident || authMode !== 'register';
  genderInput.disabled = !resident || authMode !== 'register';
  areaInput.disabled = !resident || authMode !== 'register';
  dateOfBirthInput.disabled = !resident || authMode !== 'register';

  communityNameInput.required =
    !resident && authMode === 'register';

  communityNameInput.disabled =
    resident || authMode !== 'register';

  communityRegisterFields.hidden =
    resident || authMode !== 'register';

  registerFields.hidden =
    resident ? authMode !== 'register' : true;

  otpSection.hidden = true;
  otpInput.required = false;
  otpInput.value = '';
  phoneInput.disabled = !resident;
  confirmationResult = null;

  resetRecaptcha();

  submitButton.disabled = false;
  submitButton.textContent = resident
    ? 'Send Verification Code'
    : authMode === 'register'
      ? 'Create Community Account'
      : 'Login';
}

function openAuth(mode) {
  authMode = mode;
  confirmationResult = null;

  modal.hidden = false;
  document.body.classList.add('modal-open');

  showNotice('');

  document.querySelector('#modal-eyebrow').textContent =
    mode === 'register' ? 'JOIN YOUR COMMUNITY' : 'WELCOME BACK';

  document.querySelector('#modal-title').textContent =
    mode === 'register' ? 'Join your neighbours.' : 'Welcome back.';

  document.querySelector('#modal-description').textContent =
    isResident()
      ? mode === 'register'
        ? 'Create your resident account using your phone number.'
        : 'Sign in to your resident account using SMS verification.'
      : mode === 'register'
        ? 'Create a Community Management account.'
        : 'Sign in to Community Management.';

  document.querySelector('#switch-auth').textContent =
    mode === 'register' ? 'Login' : 'Register';

  document.querySelector('#modal-switch').firstChild.textContent =
    mode === 'register'
      ? 'Already have an account? '
      : 'New to Community Aid? ';

  updateAccountFields();

  phoneInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
  fullNameInput.value = '';
  genderInput.value = '';
  areaInput.value = '';
  communityNameInput.value = '';
  dateOfBirthInput.value = '';

  phoneInput.focus();
}

function closeAuth() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  resetRecaptcha();
}

function normalizeMalaysianPhoneNumber(input) {
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
      message: 'Enter a Malaysian mobile number, e.g. 0123456789.'
    };
  }

  if (!/^\+601\d{8,9}$/.test(normalized)) {
    return {
      valid: false,
      message: 'Please check your Malaysian mobile number, e.g. 0123456789.'
    };
  }

  return { valid: true, phone: normalized };
}

function getAgeCategory(dateOfBirth) {
  if (!dateOfBirth) {
    return {
      valid: false,
      message: 'Please enter your date of birth.'
    };
  }

  // Parse the date as local calendar values to avoid timezone issues.
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Reject invalid or future dates.
  if (
    Number.isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day ||
    birthDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())
  ) {
    return {
      valid: false,
      message: 'Please enter a valid date of birth that is not in the future.'
    };
  }

  let age = today.getFullYear() - year;

  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age--;
  }

  return {
    valid: true,
    ageCategory: age >= 60 ? 'elderly' : 'general'
  };
}

async function sendOtp(event) {
  event.preventDefault();
  showNotice('');

  if (!isResident()) {
    await handleCommunityAuth();
    return;
  }

  const phoneResult = normalizeMalaysianPhoneNumber(phoneInput.value);

  if (!phoneResult.valid) {
    showNotice(phoneResult.message);
    return;
  }

  const phone = phoneResult.phone;

  
  if (authMode === 'register') {
    if (
      !fullNameInput.value.trim() ||
      !genderInput.value ||
      !areaInput.value.trim()
    ) {
      showNotice('Please complete your name, gender and residential area.');
      return;
    }

    const ageResult = getAgeCategory(dateOfBirthInput.value);

    if (!ageResult.valid) {
      showNotice(ageResult.message);
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

    showNotice('SMS code sent. Enter the 6-digit code below.');
    otpInput.focus();
  } catch (error) {
    console.error('Send OTP error:', error);

    const messages = {
      'auth/invalid-phone-number':
        'Invalid phone number. Try +60123456789.',
      'auth/operation-not-allowed':
        'Enable Phone authentication in your Firebase Console.',
      'auth/billing-not-enabled':
        'Check Firebase billing and SMS configuration.',
      'auth/too-many-requests':
        'Too many attempts. Please wait before trying again.',
      'auth/quota-exceeded':
        'The SMS quota has been reached. Try again later.',
      'auth/captcha-check-failed':
        'reCAPTCHA verification failed. Please try again.',
      'auth/invalid-app-credential':
        'App verification failed. Check your Firebase authorised domains.'
    };

    showNotice(
      messages[error.code] ||
      `Could not send the verification code: ${error.message}`
    );

    resetRecaptcha();
    submitButton.disabled = false;
    submitButton.textContent = 'Try Again';
  }
}

async function verifyOtp() {
  showNotice('');

  if (!confirmationResult) {
    showNotice('Please request a verification code first.');
    return;
  }

  const code = otpInput.value.trim();

  if (!/^\d{6}$/.test(code)) {
    showNotice('Enter the 6-digit verification code.');
    return;
  }

 
try {
  verifyButton.disabled = true;
  verifyButton.textContent = 'Verifying...';

  const result = await confirmationResult.confirm(code);
  const user = result.user;

  const residentRef = doc(db, 'residents', user.uid);
  const snapshot = await getDoc(residentRef);

  if (authMode === 'register') {
    if (snapshot.exists()) {
      await signOut(auth);
      showNotice('This resident account already exists. Please log in.');
      return;
    }

    
    const ageResult = getAgeCategory(dateOfBirthInput.value);

    if (!ageResult.valid) {
      await signOut(auth);
      showNotice(ageResult.message);
      return;
    }

    const profile = {
      uid: user.uid,
      phone: user.phoneNumber || phoneInput.value.trim(),
      fullName: fullNameInput.value.trim(),
      gender: genderInput.value,
      area: areaInput.value.trim(),
      ageCategory: ageResult.ageCategory,
      role: 'resident',
      createdAt: serverTimestamp()
    };


    await setDoc(residentRef, profile);
    showDashboard('resident', {
      ...profile,
      createdAt: new Date()
    });
    return;
  }

  if (!snapshot.exists()) {
    await signOut(auth);
    showNotice('No resident account found. Please register first.');
    return;
  }

  const profile = snapshot.data();

  if (
    profile.uid !== user.uid ||
    profile.role !== 'resident'
  ) {
    await signOut(auth);
    showNotice('This is not a valid resident account.');
    return;
  }

  showDashboard('resident', profile);

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

async function handleCommunityAuth() {
  showNotice('');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    showNotice('Enter your email address and password.');
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent =
      authMode === 'register' ? 'Creating account...' : 'Signing in...';

    if (authMode === 'register') {
      const fullName = communityNameInput.value.trim();

      if (!fullName) {
        showNotice('Enter your full name.');
        return;
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = credential.user;

      await sendEmailVerification(user);
      await signOut(auth);

      showNotice(
        'Account created! Check your inbox and click the verification link. An administrator must approve your account before you can access Community Management.'
      );
      return;
    }

    // Log in using email and password.
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    // Refresh Firebase's user information to get the latest
    // email verification status.
    await reload(user);

    if (!auth.currentUser.emailVerified) {
      await signOut(auth);
      showNotice(
        'Please verify your email first. Open the verification link in your inbox, then log in again.'
      );
      return;
    }

    // Check the administrator-created profile.
    const profileRef = doc(db, 'communityUsers', user.uid);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      await signOut(auth);
      showNotice(
        'Your email is verified, but your account is waiting for administrator approval.'
      );
      return;
    }

    const profile = snapshot.data();

    if (
      profile.uid !== user.uid ||
      profile.role !== 'community' ||
      profile.approved !== true
    ) {
      await signOut(auth);
      showNotice(
        'Your Community Management account has not been approved yet.'
      );
      return;
    }

    showDashboard('community', profile);
  } catch (error) {
    console.error('Community authentication error:', error);

    const messages = {
      'auth/email-already-in-use':
        'This email is already registered. Please log in.',
      'auth/invalid-email':
        'Please enter a valid email address.',
      'auth/weak-password':
        'Choose a password with at least 6 characters.',
      'auth/invalid-credential':
        'Incorrect email or password.',
      'auth/user-not-found':
        'No account found. Please register first.',
      'auth/wrong-password':
        'Incorrect email or password.',
      'auth/operation-not-allowed':
        'Enable Email/Password authentication in Firebase Console.',
      'auth/too-many-requests':
        'Too many attempts. Please wait before trying again.'
    };

    showNotice(
      messages[error.code] ||
      `Authentication failed: ${error.message}`
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent =
      authMode === 'register'
        ? isResident()
          ? 'Send Verification Code'
          : 'Create Community Account'
        : isResident()
          ? 'Send Verification Code'
          : 'Login';
  }
}

export function initAuth() {
  modal = document.querySelector('#auth-modal');
  form = document.querySelector('#auth-form');

  accountType = document.querySelector('#account-type');
  residentFields = document.querySelector('#resident-auth-fields');
  communityFields = document.querySelector('#community-auth-fields');

  registerFields = document.querySelector('#register-fields');
  communityRegisterFields = document.querySelector('#community-register-fields');

  phoneInput = document.querySelector('#phone');
  fullNameInput = document.querySelector('#full-name');
  genderInput = document.querySelector('#gender');
  areaInput = document.querySelector('#area');
  dateOfBirthInput = document.querySelector('#date-of-birth');

  // Prevent selecting a future date using the date picker.
  const today = new Date();

  dateOfBirthInput.max = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  communityNameInput = document.querySelector('#community-name');
  emailInput = document.querySelector('#email');
  passwordInput = document.querySelector('#password');

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

  accountType.addEventListener('change', () => {
    showNotice('');
    updateAccountFields();

    document.querySelector('#modal-description').textContent =
      isResident()
        ? 'Use your phone number and SMS verification.'
        : 'Use your Community Management email and password.';
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

  updateAccountFields();
}
