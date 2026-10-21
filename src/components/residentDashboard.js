export function residentDashboard() {
  return `

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
  `;
}