
import './style.css'

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
        <input id="phone" name="phone" type="tel" placeholder="e.g. 0123456789" autocomplete="tel" required />

        <div id="password-field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" minlength="8" required />
        </div>

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
      <p class="prototype-note">Prototype preview — account access will be connected later.</p>
    </section>
  </div>
`

const modal = document.querySelector('#auth-modal')
const form = document.querySelector('#auth-form')
const registerFields = document.querySelector('#register-fields')
const passwordInput = document.querySelector('#password')
const phoneInput = document.querySelector('#phone')
const fullNameInput = document.querySelector('#full-name')
const areaInput = document.querySelector('#area')
const notice = document.querySelector('#form-notice')

let authMode = 'login'

function openAuth(mode) {
  authMode = mode
  modal.hidden = false
  document.body.classList.add('modal-open')
  notice.textContent = ''

  const isRegister = mode === 'register'

  document.querySelector('#modal-eyebrow').textContent =
    isRegister ? 'BECOME PART OF YOUR COMMUNITY' : 'WELCOME TO YOUR COMMUNITY'
  document.querySelector('#modal-title').textContent =
    isRegister ? 'Join your neighbours.' : 'Welcome back.'
  document.querySelector('#modal-description').textContent =
    isRegister
      ? 'Create an account to start giving and receiving help.'
      : 'Sign in to connect with your neighbours.'
  document.querySelector('#submit-auth').textContent =
    isRegister ? 'Create Account' : 'Login'
  document.querySelector('#switch-auth').textContent =
    isRegister ? 'Login' : 'Register'
  document.querySelector('#modal-switch').firstChild.textContent =
    isRegister ? 'Already have an account? ' : 'New to Community Aid? '

  registerFields.hidden = !isRegister
  fullNameInput.required = isRegister
  areaInput.required = isRegister
  passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password'

  modal.querySelector('.auth-modal').scrollTop = 0
  phoneInput.focus()
}

function closeAuth() {
  modal.hidden = true
  document.body.classList.remove('modal-open')
}

document.querySelector('#login-btn').addEventListener('click', () => openAuth('login'))
document.querySelector('#register-btn').addEventListener('click', () => openAuth('register'))
document.querySelector('#get-started-btn').addEventListener('click', () => openAuth('register'))
document.querySelector('#close-modal').addEventListener('click', closeAuth)

document.querySelector('#switch-auth').addEventListener('click', () => {
  openAuth(authMode === 'login' ? 'register' : 'login')
})

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeAuth()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeAuth()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()

  notice.textContent = authMode === 'register'
    ? 'Registration screen is working! Real account creation will be connected when authentication is implemented.'
    : 'Login screen is working! Real sign-in will be connected when authentication is implemented.'
})
