
export function navbar() {
  return `
    <header class="navbar">
      <a class="brand" href="#" aria-label="JiranBantu home">
        <span class="brand-icon">✳</span>
        <span>Jiran<span class="brand-accent">Bantu</span></span>
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
  `;
}
