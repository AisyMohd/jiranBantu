
export function renderCommunityDashboard() {
  return `
    <div class="community-dashboard">
      <header class="community-header">
        <p class="community-eyebrow">COMMUNITY MANAGEMENT</p>
        <h2>Neighbourhood Overview</h2>
        <p>Keep an eye on requests and help neighbours connect.</p>
      </header>

      <!-- Summary Statistics -->
      <div class="community-stats">
        <div class="community-stat-card">
          <h3>Open Requests</h3>
          <p id="stat-open">—</p>
        </div>
        <div class="community-stat-card">
          <h3>Accepted Requests</h3>
          <p id="stat-accepted">—</p>
        </div>
        <div class="community-stat-card">
          <h3>Unclaimed Requests</h3>
          <p id="stat-unclaimed">—</p>
        </div>
        <div class="community-stat-card">
          <h3>Completed Requests</h3>
          <p id="stat-completed">—</p>
        </div>
      </div>

      <!-- Dashboard Main Content -->
      <div class="community-content">

        <main class="community-main-column">

          <!-- Featured Alert -->
          <section class="community-alert">
            <span class="community-alert-label">
              ◷ Needs Attention
            </span>
            <h3>Requests Needing Follow-up</h3>
            <p>
              Some residents may require additional
              community support.
            </p>
            <p class="community-alert-note">
              Review flagged requests and coordinate assistance.
            </p>
            <a href="#community-attention-panel"
               class="community-alert-action">
              View Flagged Requests →
            </a>
          </section>

          <!-- All Requests -->
          <section class="community-requests">
            <div class="community-section-heading">
              <div>
                <h2>All Requests</h2>
                <p>
                  Monitor requests within your authorised
                  community area.
                </p>
              </div>
            </div>

            <div id="community-request-list"
                 aria-live="polite">
              <p>Loading requests...</p>
            </div>
          </section>
          
          <!-- My Accepted Requests -->
          <section class="community-requests" id="community-accepted-section">
            <div class="community-section-heading">
              <div>
                <h2>My Accepted Requests</h2>
                <p>
                  View the requests you have accepted and contact the residents you are helping.
                </p>
              </div>
            </div>

            <div id="community-accepted-list" aria-live="polite">
              <p>Loading your accepted requests...</p>
            </div>
          </section>


        </main>

        <!-- Needs Attention Sidebar -->
        <aside class="community-attention"
               id="community-attention-panel">
          <div class="community-attention-heading">
            <span class="community-attention-icon">!</span>
            <h2>Needs Attention</h2>
          </div>

          <p>
            Requests flagged for additional support
            appear here.
          </p>

          <div id="community-attention-list"
               aria-live="polite">
            <p>Loading requests...</p>
          </div>

          <div class="community-attention-footer">
            Community managers can monitor requests
            and coordinate support within their
            authorised area.
          </div>
        </aside>

      </div>
    </div>
  `;
}

export function renderCommunityRequestCard(request) {
  const {
    task = 'Untitled Request',
    requesterName = 'Unknown Resident',
    fasa = 'Not specified',
    dateNeeded = '',
    status = 'open',
    details = '',
    id = '',
    attentionReason = ''
  } = request;

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  const safeStatus = String(status).toLowerCase();
  const statusClass =
    ['open', 'accepted', 'completed', 'unclaimed']
      .includes(safeStatus) ? safeStatus : 'other';

const reasonType =
  attentionReason === 'Urgent Request'
    ? 'urgent'
    : attentionReason === 'Overdue Request'
      ? 'overdue'
      : 'waiting';

  return `
    <article class="community-request-card">
      <div class="community-request-top">
        <h3>${escapeHTML(task)}</h3>
        <span class="community-status community-status-${statusClass}">
          ${escapeHTML(status)}
        </span>
      </div>

      
${attentionReason ? `
  <span
    class="community-attention-reason"
    data-reason="${reasonType}">
    ${escapeHTML(attentionReason)}
  </span>
` : ''}


      <p class="community-request-meta">
        ${escapeHTML(requesterName)} ·
        ${escapeHTML(fasa)} ·
        ${escapeHTML(
          dateNeeded && typeof dateNeeded.toDate === 'function'
            ? dateNeeded.toDate().toLocaleDateString('en-MY')
            : dateNeeded || 'Date not specified'
          )}${request.timeNeeded ? ` · ${escapeHTML(request.timeNeeded)}` : ''}
      </p>

      
      <p class="community-request-details">
        ${escapeHTML(details)}
      </p>

      <div class="community-request-actions">
        <button
          type="button"
          class="community-view-btn"
          data-request-id="${escapeHTML(id)}">
          View Details
        </button>

        ${['open', 'unclaimed'].includes(safeStatus) ? `
          <button
            type="button"
            class="community-help-btn"
            data-help-request-id="${escapeHTML(id)}">
            I Can Help
          </button>
        ` : ''}
      </div>

    </article>
  `;
}

