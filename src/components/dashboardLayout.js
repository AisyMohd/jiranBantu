export function dashboardLayout() {
  return `
    <section id="dashboard" class="jb-dashboard" hidden>

      <!-- Shared header for Resident and Community -->
      <header class="jb-header">
        <a class="jb-brand" href="#" id="dashboard-brand">
          <span class="jb-logo">♡</span>
          <span class="jb-brand-text">
            <strong>JiranBantu</strong>
            <small>Jiran Bantu Jiran</small>
          </span>
        </a>

        <div class="jb-header-actions">
          <span id="dashboard-user" class="jb-user-name"></span>
          <button type="button" class="jb-header-btn" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <!-- Dashboard content rendered according to the user's role -->
      <div id="dashboard-content">
          <div id="resident-dashboard-mount" hidden></div>
          <div id="community-dashboard-mount" hidden></div>
          <div id="request-form-container" class="request-modal-backdrop"hidden></div>
      </div>

      

      <!-- Shared bottom navigation -->
      <nav class="jb-bottom-nav" aria-label="Dashboard navigation">

        <!-- Resident navigation -->
        <button type="button"
          class="jb-bottom-link active"
          data-page="overview"
          data-resident-only>
          ⌂ Home
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="my-requests"
          data-resident-only>
          ☷ My Requests
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="browse"
          data-resident-only>
          ♡ Help Neighbours
        </button>

        <!-- Community navigation -->
        <button type="button"
          class="jb-bottom-link"
          data-page="overview"
          data-community-only
          hidden>
          ⌂ Home
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="requests"
          data-community-only
          hidden>
          ☷ All Requests
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="escalations"
          data-community-only
          hidden>
          ! Needs Attention
        </button>

      </nav>

    </section>

    <!-- Keep the existing working request form container -->
    <div id="request-form-container"
      class="request-modal-backdrop"
      hidden>
    </div>
  `;
}
