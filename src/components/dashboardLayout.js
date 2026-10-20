
export function dashboardLayout() {
  return `
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
        <div class="dashboard-heading">
        <p id="dashboard-description"></p>

        <button
            type="button"
            class="btn btn-primary"
            id="need-help-btn"
            hidden
        >
            + I Need Help
        </button>
        </div>

        <div id="dashboard-nav" class="dashboard-grid"></div>

        
        <section class="dashboard-placeholder" id="dashboard-placeholder">
        <h2 id="dashboard-panel-title">Welcome!</h2>
        <p id="dashboard-panel-description">
            Your dashboard is ready. Choose a page to get started.
        </p>
        <div id="dashboard-request-list" class="request-list" hidden></div>
        </section>

      </main>
    </section>
    <div id="request-form-container" class="request-modal-backdrop" hidden></div>
  `;
}
