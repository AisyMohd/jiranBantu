
export function authModal() {
  return `
    <div class="modal-backdrop" id="auth-modal" hidden>
      <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" id="close-modal" type="button" aria-label="Close dialog">×</button>

        <div class="modal-brand">
          <span class="modal-brand-icon" aria-hidden="true">✳</span>
          <span>Jiran<span class="brand-accent">Bantu</span></span>
        </div>
        <div class="modal-intro">
          <span class="section-label" id="modal-eyebrow">WELCOME TO YOUR COMMUNITY</span>
          <h2 id="modal-title">Welcome back.</h2>
          <p id="modal-description">Sign in to connect with your neighbours.</p>
        </div>

        <form id="auth-form">
          <div class="auth-field">
            <label for="account-type">I’m signing in as</label>
            <select id="account-type" required>
              <option value="resident">Resident</option>
              <option value="community">Community Management</option>
            </select>
          </div>

          <div id="resident-auth-fields">
            <div class="auth-field">
              <label for="phone">Phone number</label>
              <input type="tel" id="phone" placeholder="e.g. 012 345 6789" autocomplete="tel" />
              <span class="field-hint">We’ll send you a one-time code by SMS.</span>
            </div>

            <div id="otp-section" hidden>
              <div class="auth-field">
                <label for="otp">SMS verification code</label>
                <input type="text" id="otp" inputmode="numeric" autocomplete="one-time-code" placeholder="Enter 6-digit code" />
              </div>
              <button class="btn btn-outline otp-verify" type="button" id="verify-otp-btn">Verify code</button>
            </div>

            <div id="recaptcha-container"></div>

            <div id="register-fields" hidden>
              <div class="register-section-heading">
                <span>About you</span>
                <small>Help us personalise your community profile.</small>
              </div>
              <div class="auth-field">
                <label for="full-name">Full name</label>
                <input id="full-name" name="fullName" type="text" placeholder="Your full name" autocomplete="name" />
              </div>
              <div class="auth-field">
                <label for="gender">Gender</label>
                <select id="gender" name="gender">
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div class="auth-field">
                <label for="area">Neighbourhood / Fasa</label>
                <select id="area" name="area">
                  <option value="">Select your Fasa</option>
                  <option value="Fasa 1">Fasa 1</option>
                  <option value="Fasa 2">Fasa 2</option>
                  <option value="Fasa 3">Fasa 3</option>
                  <option value="Fasa 4">Fasa 4</option>
                  <option value="Fasa 5">Fasa 5</option>
                  <option value="Fasa 6">Fasa 6</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="auth-field" id="other-area-field" hidden>
                <label for="other-area">Your neighbourhood / Fasa</label>
                <input id="other-area" name="otherArea" type="text" placeholder="Enter your neighbourhood" />
              </div>
              <div class="auth-field">
                <label for="id-number">Malaysian MyKad / ID number</label>
                <input
                  id="id-number"
                  name="idNumber"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="14"
                  placeholder="12 digits; dashes optional"
                  aria-describedby="id-number-hint"
                />
                <span class="field-hint" id="id-number-hint">Your birth date and age fill automatically from the first 6 digits. Dashes are optional. This ID number will be saved to your resident profile.</span>
              </div>
              <div class="birth-info-grid">
                <div class="auth-field">
                  <label for="date-of-birth">Date of birth</label>
                  <input
                    id="date-of-birth"
                    name="dateOfBirth"
                    type="date"
                    autocomplete="bday"
                    max="${new Date().toISOString().split('T')[0]}"
                    readonly
                  />
                </div>
                <div class="auth-field">
                  <label for="age-display">Age</label>
                  <input id="age-display" type="text" placeholder="Auto-filled" readonly />
                </div>
              </div>
              <p class="form-hint">
                Residents aged 60 and above will receive an Elderly label.
              </p>
            </div>
          </div>

          <div id="community-auth-fields" hidden>
            <div id="community-register-fields" hidden>
              <div class="auth-field">
                <label for="community-name">Full name</label>
                <input id="community-name" name="communityName" type="text" placeholder="Your full name" autocomplete="name" />
              </div>
            </div>

            <div class="auth-field">
              <label for="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" />
            </div>

            <div class="auth-field">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" minlength="6" />
              <span class="field-hint">Use at least 6 characters.</span>
            </div>
          </div>

          <p class="form-notice" id="form-notice" aria-live="polite"></p>

          <button class="btn btn-primary modal-submit" id="submit-auth" type="submit">Login</button>
        </form>

        <p class="modal-switch" id="modal-switch">
          New to JiranBantu? <button type="button" id="switch-auth">Register</button>
        </p>

        <p class="prototype-note">Your account type determines which dashboard you can access.</p>
      </section>
    </div>
  `;
}
