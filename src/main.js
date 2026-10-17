import './style.css';
import { initAuth } from './js/auth.js';
import { initDashboard } from './js/dashboard.js';

document.querySelector('#app').innerHTML = `
  <header class="navbar">
    <a class="brand" href="#" aria-label="Community Aid home">
      <span class="brand-icon">✳</span>
      <span>Community<span class="brand-accent">Aid</span></span>
    </a>

    <nav class="nav-links" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#about">About Us</a>
      <a href="#how-it-works">How It Works</a>
    </nav>

    <div class="nav-actions">
      <button class="btn btn-outline" id="login-btn">Login</button>
      <button class="btn btn-primary" id="register-btn">Register</button>
    </div>
  </header>

  <main>
    <section class="hero" id="home">
      <div class="hero-content">
        <span class="eyebrow">
          <span class="status-dot"></span>
          A stronger community starts with us
        </span>

        <h1>Small acts.<br />Stronger <span>communities.</span></h1>

        <p class="hero-description">
          Need a helping hand, or have one to offer?
          Community Aid connects neighbours so we can support
          one another, right where we live.
        </p>

        <div class="hero-actions">
          <button class="btn btn-primary btn-large" id="get-started-btn">
            Get Started <span aria-hidden="true">→</span>
          </button>
          <a class="text-link" href="#how-it-works">
            Discover how it works <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="hero-note">
          <span class="note-icon">♡</span>
          <span>Every neighbour matters. Every act of kindness counts.</span>
        </div>
      </div>

      <div class="hero-visual" aria-label="Community support illustration">
        <div class="visual-orbit orbit-one"></div>
        <div class="visual-orbit orbit-two"></div>

        <div class="community-card">
          <div class="illustration">
            <div class="sun"></div>
            <div class="hill hill-back"></div>
            <div class="hill hill-front"></div>
            <div class="house house-left">
              <div class="roof"></div>
              <div class="house-body"><span></span></div>
            </div>
            <div class="house house-right">
              <div class="roof"></div>
              <div class="house-body"><span></span></div>
            </div>
            <div class="person person-one"><span></span></div>
            <div class="person person-two"><span></span></div>
            <div class="person person-three"><span></span></div>
            <div class="heart-float">♥</div>
          </div>

          <div class="visual-caption">
            <div class="caption-icon">✳</div>
            <div>
              <strong>Better together</strong>
              <p>Help is closer than you think.</p>
            </div>
          </div>
        </div>

        <div class="floating-badge badge-top">
          <span>♡</span>
          Kindness lives here
        </div>
        <div class="floating-badge badge-bottom">
          <span class="badge-check">✓</span>
          Neighbours helping neighbours
        </div>
      </div>
    </section>

    <section class="features" id="about">
      <div class="section-heading">
        <span class="section-label">THE POWER OF COMMUNITY</span>
        <h2>There is strength in <span>helping each other.</span></h2>
        <p>Everyone has something to give, and everyone deserves support.</p>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon icon-peach">♡</div>
          <h3>Ask for help</h3>
          <p>Request everyday support from neighbours when you need an extra hand.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon icon-green">↗</div>
          <h3>Lend a hand</h3>
          <p>Offer your time, skills, or resources to make someone's day easier.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon icon-yellow">⌂</div>
          <h3>Support your area</h3>
          <p>Connect with residents in your own neighbourhood and grow stronger together.</p>
        </article>
      </div>
    </section>

    <section class="how-section" id="how-it-works">
      <span class="section-label">SIMPLE BY DESIGN</span>
      <h2>Helping each other, made easier.</h2>
      <div class="steps-grid">
        <div class="step">
          <span class="step-number">01</span>
          <h3>Join your community</h3>
          <p>Register and connect with your residential area.</p>
        </div>
        <div class="step">
          <span class="step-number">02</span>
          <h3>Ask or offer help</h3>
          <p>Share what you need or how you can help others.</p>
        </div>
        <div class="step">
          <span class="step-number">03</span>
          <h3>Make a difference</h3>
          <p>Work together to make your neighbourhood more caring.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <a class="brand" href="#home">
      <span class="brand-icon">✳</span>
      <span>Community<span class="brand-accent">Aid</span></span>
    </a>
    <p>Built on kindness. Powered by community.</p>
    <span>© ${new Date().getFullYear()} Community Aid</span>
  </footer>

  <div class="modal-backdrop" id="auth-modal" hidden>
    <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal-close" id="close-modal" aria-label="Close dialog">×</button>
      <div class="modal-brand">✳ CommunityAid</div>
      <span class="section-label" id="modal-eyebrow">WELCOME TO YOUR COMMUNITY</span>
      <h2 id="modal-title">Welcome back.</h2>
      <p id="modal-description">Sign in to connect with your neighbours.</p>

      <form id="auth-form">
        <label for="phone">Phone number</label>
        <input type="tel" id="phone" placeholder="+60123456789" autocomplete="tel" required />
        <div id="otp-section" hidden>
          <label for="otp">Verification Code</label>
          <input
            type="text"
            id="otp"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="Enter 6-digit code"
          />

          <button type="button" id="verify-otp-btn">
            Verify Code
          </button>
        </div>

        <div id="recaptcha-container"></div>
          

        <div id="register-fields" hidden>
          <label for="full-name">Full name</label>
          <input id="full-name" name="fullName" type="text" placeholder="Your name" autocomplete="name" />
          <label for="area">Residential area</label>
          <input id="area" name="area" type="text" placeholder="e.g. Fasa 6" />
        </div>

        <p class="form-notice" id="form-notice" aria-live="polite"></p>
        <button class="btn btn-primary modal-submit" id="submit-auth" type="submit">Login</button>
      </form>

      <p class="modal-switch" id="modal-switch">
        New to Community Aid? <button type="button" id="switch-auth">Register</button>
      </p>
      <p class="prototype-note">Verify your phone number securely to access JiranBantu.</p>
    </section>
  </div>


  <section id="dashboard" hidden>
    <header class="navbar">
      <a class="brand" href="#" id="dashboard-brand">
        <span>Jiran<span class="brand-accent">Bantu</span></span>
      </a>
      <div class="nav-actions">
        <span id="dashboard-user"></span>
        <button class="btn btn-outline" id="logout-btn">Logout</button>
      </div>
    </header>

    <main class="dashboard-main">
      <p class="section-label" id="dashboard-role">YOUR COMMUNITY</p>
      <h1 id="dashboard-title">Dashboard</h1>
      <p id="dashboard-description"></p>

      <div id="dashboard-nav" class="dashboard-grid"></div>

      <section class="dashboard-placeholder">
        <h2 id="dashboard-panel-title">Welcome!</h2>
        <p id="dashboard-panel-description">
          Your dashboard is ready. Detailed pages will be added by the team.
        </p>
      </section>
    </main>
  </section>

`
initDashboard();
initAuth();