
export function authModal() {
  return `
    <div class="modal-backdrop" id="auth-modal" hidden>
      <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" id="close-modal" type="button" aria-label="Close dialog">×</button>

        <div class="modal-brand">✳ CommunityAid</div>
        <span class="section-label" id="modal-eyebrow">WELCOME TO YOUR COMMUNITY</span>
        <h2 id="modal-title">Welcome back.</h2>
        <p id="modal-description">Sign in to connect with your neighbours.</p>

        <form id="auth-form">
          <label for="account-type">Account type</label>
          <select id="account-type" required>
            <option value="resident">Resident</option>
            <option value="community">Community Management</option>
          </select>

          <div id="resident-auth-fields">
            <label for="phone">Phone number</label>
            <input type="tel" id="phone" placeholder="0123456789" autocomplete="tel" />

            <div id="otp-section" hidden>
              <label for="otp">SMS verification code</label>
              <input type="text" id="otp" inputmode="numeric" autocomplete="one-time-code" placeholder="Enter 6-digit code" />
              <button type="button" id="verify-otp-btn">Verify Code</button>
            </div>

            <div id="recaptcha-container"></div>

            <div id="register-fields" hidden>
              <label for="full-name">Full name</label>
              <input id="full-name" name="fullName" type="text" placeholder="Your full name" autocomplete="name" />

              <label for="gender">Gender</label>
              <select id="gender" name="gender">
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>

              <label for="area">Neighbourhood / Fasa</label>
              <input id="area" name="area" type="text" placeholder="e.g. Fasa 6" />
              <label for="date-of-birth">Date of Birth</label>
                <input
                id="date-of-birth"
                name="dateOfBirth"
                type="date"
                autocomplete="bday"
                max="${new Date().toISOString().split('T')[0]}"
                />
                <p class="form-hint">
                Residents aged 60 and above will receive an Elderly label.
                </p>
            </div>
          </div>

          <div id="community-auth-fields" hidden>
            <div id="community-register-fields" hidden>
              <label for="community-name">Full name</label>
              <input id="community-name" name="communityName" type="text" placeholder="Your full name" autocomplete="name" />
            </div>

            <label for="email">Email address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" />

            <label for="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" minlength="6" />
          </div>

          <p class="form-notice" id="form-notice" aria-live="polite"></p>

          <button class="btn btn-primary modal-submit" id="submit-auth" type="submit">Login</button>
        </form>

        <p class="modal-switch" id="modal-switch">
          New to Community Aid? <button type="button" id="switch-auth">Register</button>
        </p>

        <p class="prototype-note">Your account type determines which dashboard you can access.</p>
      </section>
    </div>
  `;
}
