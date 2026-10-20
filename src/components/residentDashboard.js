export function residentDashboard() {
  return `
    <section id="dashboard" class="jb-dashboard" hidden>

      <!-- Top Header -->
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

          <button type="button" class="jb-header-btn" id="switch-role-btn">
            Switch role
          </button>

          <button type="button" class="jb-header-btn" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div class="jb-layout">

        <!-- Left Sidebar -->
        <aside class="jb-sidebar">
          <p class="jb-sidebar-role" id="dashboard-role">
            RESIDENT · FASA 6
          </p>
          <p class="jb-eyebrow">RESIDENT · FASA 6</p>
          <nav class="jb-sidebar-nav" id="dashboard-sidebar-nav">
            <button class="jb-side-link active" data-page="overview">
              ⌂ Home
            </button>

            <button class="jb-side-link" data-page="my-requests">
              ☷ My Requests
            </button>

            <button class="jb-side-link" data-page="browse">
              ♡ Help Neighbours
            </button>

          </nav>

          <div class="jb-sidebar-tip">
            <strong>Try the demo</strong>
            <p>
              Request help, find it in My Requests, then explore
              available requests and accept one.
            </p>
          </div>
        </aside>

        <!-- Main Dashboard -->
        <main class="jb-content">

           <div class="jb-welcome">
            <h1 id="dashboard-title"></h1>
            <p id="dashboard-description">
              Your neighbourhood: Fasa 6
            </p>
          </div>
          
        <!-- I Need Help button -->
        <div class="jb-home-actions">
          <button
            type="button"
            class="jb-primary-btn jb-need-help-btn"
            id="need-help-btn"
          >
            <span class="jb-need-help-icon"></span>
            + I Need Help 
          </button>
        </div>

        <!-- Navigation retained for dashboard.js -->
        <div id="dashboard-nav" class="jb-hidden-navigation" hidden></div>

        <!-- All Requests list -->
        <section class="jb-requests-section" id="dashboard-placeholder">
          <div class="jb-requests-heading">
            <h2 id="dashboard-panel-title">All Requests</h2>
            <p id="dashboard-panel-description">
              See how you can support your neighbours.
            </p>
          </div>

          <div id="request-list" class="jb-request-list"></div>
        </section>

        <!-- Existing request form placeholder -->
        <section
          class="jb-summary-card jb-request-form"
          id="request-form-container"
          hidden
        >
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
            <input type="date" id="request-date" required>

            <label for="request-details">Additional details</label>
            <textarea
              id="request-details"
              placeholder="Provide more information (optional)"
              rows="4"
            ></textarea>

            <div class="jb-form-actions">
              <button type="submit" class="jb-primary-btn">
                Submit Request
              </button>

              <button
                type="button"
                class="jb-secondary-btn"
                id="cancel-request-btn"
              >
                Cancel
              </button>
            </div>
          </form>

          <p id="temporary-request-message" role="status"></p>
        </section>


          <!-- Existing request form -->
          <section
            class="jb-summary-card jb-request-form"
            id="request-form-container"
            hidden
          >
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
              <input type="date" id="request-date" required>

              <label for="request-details">Additional details</label>
              <textarea
                id="request-details"
                placeholder="Provide more information (optional)"
                rows="4"
              ></textarea>

              <div class="jb-form-actions">
                <button type="submit" class="jb-primary-btn">
                  Submit Request
                </button>

                <button
                  type="button"
                  class="jb-secondary-btn"
                  id="cancel-request-btn"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p id="temporary-request-message" role="status"></p>
          </section>

          <!-- Existing button retained for dashboard.js -->
          <button
            type="button"
            class="jb-primary-btn"
            id="need-help-btn"
            hidden
          >
            + I Need Help
          </button>

        </main>
      </div>

      <!-- Bottom Navigation -->
      <nav class="jb-bottom-nav">
        <button class="jb-bottom-link active" data-page="overview">
          ⌂ Home
        </button>
        <button class="jb-bottom-link" data-page="my-requests">
          ☷ My Requests
        </button>
        <button class="jb-bottom-link" data-page="browse">
          ♡ Help Neighbours
        </button>
      </nav>

    </section>
  `;
}