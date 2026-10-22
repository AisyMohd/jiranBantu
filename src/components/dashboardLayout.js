
export function dashboardLayout() {
  return `
    <section id="dashboard" class="jb-dashboard" hidden>

      <!-- Shared header for Resident and Community -->
      <header class="navbar dashboard-navbar">
        <a class="brand" href="#" id="dashboard-brand" aria-label="JiranBantu home">
          <span class="brand-icon">✳</span>
          <span>Jiran<span class="brand-accent">Bantu</span></span>
        </a>

        <div class="jb-header-actions">
          <button
            type="button"
            id="dashboard-user"
            class="jb-user-name"
            data-page="profile"
            data-resident-only
            aria-label="Open your profile"
            title="Open your profile"
          >
            <svg class="jb-user-avatar" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5"></circle>
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>
            </svg>
            <span id="dashboard-user-name"></span>
          </button>

          <span
            id="dashboard-user-community"
            class="jb-user-community"
            data-community-only
            hidden
          ></span>

          <button type="button" class="jb-header-btn" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <!-- Dashboard content rendered according to the user's role -->
      <div id="dashboard-content">
        <div id="resident-dashboard-mount" hidden></div>
        <div id="community-dashboard-mount" hidden></div>
        <div
          id="request-form-container"
          class="request-modal-backdrop"
          hidden
        ></div>
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
          data-page="browse"
          data-resident-only>
          ♡ Help Neighbours
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="my-requests"
          data-resident-only>
          ☷ My Requests
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="accepted-requests"
          data-resident-only>
          ☆ My Accepted Requests
        </button>

        <button type="button"
          class="jb-bottom-link"
          data-page="profile"
          data-resident-only>
          ♙ My Profile
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
  `;
}
