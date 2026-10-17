
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
            Your dashboard is ready. Detailed pages will be added by the team.
        </p>
        </section>

        <!-- Temporary request form .  SO MIRA START CODING SINI -->
        <section class="dashboard-placeholder" id="request-form-container" hidden>
        <h2>Request Help</h2>
        <p>Tell your neighbours what help you need.</p>

        <form id="temporary-request-form">
            <label for="request-task">What do you need help with?</label>
            <input
            type="text"
            id="request-task"
            placeholder="e.g. Buy groceries"
            required
            >

            <label for="request-date">Date needed</label>
            <input
            type="date"
            id="request-date"
            required
            >

            <label for="request-details">Additional details</label>
            <textarea
            id="request-details"
            placeholder="Provide more information (optional)"
            rows="4"
            ></textarea>

            <button type="submit" class="btn btn-primary">
            Submit Request
            </button>

            <button type="button" class="btn btn-outline" id="cancel-request-btn">
            Cancel
            </button>
        </form>

        <p id="temporary-request-message" role="status"></p>
        </section>

      </main>
    </section>
  `;
}
