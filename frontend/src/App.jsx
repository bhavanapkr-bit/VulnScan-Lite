
import { useEffect, useState } from 'react';

const DISCLAIMER =
  'Only scan websites you own. This tool performs passive analysis only.';

const checks = [
  { name: 'Security headers', detail: 'HTTP response protection', icon: '◈' },
  { name: 'SSL / TLS', detail: 'Certificate and connection checks', icon: '⌑' },
  { name: 'Technology detection', detail: 'CMS and software clues', icon: '⌘' },
];


function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  
const [reportError, setReportError] = useState('');

const openReport = async (scanId) => {
  setSelectedReport(null);
  setReportError('');

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/scan/${scanId}/status`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Could not load this report.');
    }

    setSelectedReport(data);
  } catch (error) {
    setReportError(error.message || 'Could not load this report.');
  }
};


  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/scans/history')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load scan history.');
        }
        return response.json();
      })
      .then((data) => setScans(data.scans || []))
      .catch(() => setError('Could not load scan history. Check that the backend is running.'));
  }, []);

  return (
    <section>
      <h1>Scan History</h1>
      <p>Previously completed website scans</p>

      {error && <p>{error}</p>}

      {!error && scans.length === 0 && <p>No scans found yet.</p>}

      {scans.length > 0 && (
        <div className="history-list">
          {scans.map((scan) => (
  <article
    key={scan.id}
    className="history-item"
    onClick={() =>
      window.location.hash = `scan-${scan.id}`
    }
  >
              <h3>{scan.target_url}</h3>
              <p>Scan ID: {scan.id}</p>
              <p>Status: {scan.status}</p>
              <p>Started: {scan.created_at}</p>
              <p>Completed: {scan.completed_at || 'Not completed'}</p>
              <button
  type="button"
  className="primary-button"
  onClick={() => openReport(scan.id)}
>
  View Report
</button>
            </article>
          ))}
        </div>                                           
      )}
{reportError && <p role="alert">{reportError}</p>}

{selectedReport && (
  <div className="report-view">
    <h2>Scan Report #{selectedReport.id}</h2>

    <p>
      <strong>Website:</strong> {selectedReport.target_url}
    </p>

    <p>
      <strong>Status:</strong> {selectedReport.status}
    </p>

    <h3>Scan Results</h3>

    {selectedReport.results ? (
      <pre>
        {JSON.stringify(selectedReport.results, null, 2)}
      </pre>
    ) : (
      <p>No results are available for this scan yet.</p>
    )}

    <button
      type="button"
      className="primary-button"
      onClick={() => setSelectedReport(null)}
    >
      Close Report
    </button>
  </div>
)}      
    </section>
  );
}


function Sidebar({ page, navigate }) {
  const links = [
    ['Dashboard', '▦'],
    ['New Scan', '⌕'],
    ['Scan History', '◷'],
    ['Reports', '▤'],
    ['Settings', '⚙'],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">⬡</div>
        <div>
          <strong>VulnScan <span>Lite</span></strong>
          <small>SECURITY INTELLIGENCE</small>
        </div>
      </div>

      <p className="nav-label">WORKSPACE</p>

      <nav>
        {links.map(([label, icon]) => (
          <button
            key={label}
            className={`nav-link ${page === label ? 'active' : ''}`}
            onClick={() => navigate(label)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <span className="status-dot" />
        <div>
          <strong>Scanner workspace</strong>
          <small>Backend connection pending</small>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ label, value, note, icon, accent }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${accent}`}>{icon}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function Dashboard({ navigate }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW / DASHBOARD</p>
          <h1>Security Dashboard</h1>
          <p className="subtitle">
            Monitor your website security from one workspace.
          </p>
        </div>
        <button className="primary-button" onClick={() => navigate('New Scan')}>
          + Start new scan
        </button>
      </div>

      <section className="welcome-banner">
        <div>
          <p className="eyebrow cyan-text">YOUR SECURITY WORKSPACE</p>
          <h2>Stay ahead of security risks.</h2>
          <p>Run passive checks, review findings, and learn what needs attention.</p>
        </div>
        <div className="banner-symbol">⬡</div>
      </section>

      <div className="section-heading">
        <h2>Security overview</h2>
        <span className="subtle-tag">AWAITING FIRST SCAN</span>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Websites scanned" value="—" note="No scans recorded yet" icon="◎" accent="cyan" />
        <MetricCard label="Security score" value="—" note="Available after your first scan" icon="◈" accent="purple" />
        <MetricCard label="Checks passed" value="—" note="Waiting for scan results" icon="✓" accent="green" />
        <MetricCard label="Findings to review" value="—" note="No report generated yet" icon="!" accent="orange" />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Security checks</h2>
              <p>What VulnScan Lite examines</p>
            </div>
            <span className="outline-tag">PASSIVE</span>
          </div>

          <div className="check-list">
            {checks.map((item, index) => (
              <div className="check-row" key={item.name}>
                <div className={`check-icon icon-${index}`}>{item.icon}</div>
                <div className="check-copy">
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </div>
                <span className="pending-tag">Not run</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Your latest scan history</p>
            </div>
            <span className="activity-symbol">◷</span>
          </div>

          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <strong>No scans yet</strong>
            <p>Your scan history will appear here after your first scan.</p>
            <button className="secondary-button" onClick={() => navigate('New Scan')}>
              Start your first scan
            </button>
          </div>
        </section>
      </div>

      <section className="disclaimer">
        <span>ⓘ</span>
        <div>
          <strong>Responsible scanning</strong>
          <p>{DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}

function NewScan() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  const [scanResults, setScanResults] = useState(null);
  useEffect(() => {
  if (!scanId) return;

  let cancelled = false;

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/scan/${scanId}/status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Could not check scan status.');
      }

      if (cancelled) return;

      setScanStatus(data.status);
      setScanResults(data.results || null);

      if (data.status === 'completed') {
        setMessage(`Scan #${scanId} completed successfully!`);
      } else if (data.status === 'failed') {
        setMessage(`Scan #${scanId} failed.`);
      }
    } catch (error) {
      if (!cancelled) {
        setMessage(error.message || 'Could not check scan status.');
      }
    }
  };

  checkStatus();

  const timer = setInterval(() => {
    if (!cancelled) checkStatus();
  }, 2000);

  return () => {
    cancelled = true;
    clearInterval(timer);
  };
}, [scanId]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / NEW SCAN</p>
          <h1>Scan a website</h1>
          <p className="subtitle">
            Check security headers, TLS configuration, and technology clues.
          </p>
        </div>
      </div>

      <section className="panel scan-form-panel">
        <div className="panel-heading">
          <div>
            <h2>Target configuration</h2>
            <p>Enter a website you own or are authorized to assess.</p>
          </div>
          <span className="outline-tag">PASSIVE CHECKS</span>
        </div>

       <form onSubmit={async (event) => {
  event.preventDefault();
  setLoading(true);
  setMessage('');
  setScanId(null);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Could not start the scan.');
    }

    setScanId(data.scan_id);
    setMessage(`Scan #${data.scan_id} has been queued!`);
    setScanStatus('queued');
  } catch (error) {
    setMessage(error.message || 'Could not connect to the API.');
  } finally {
    setLoading(false);
  }
}}>
  
          <label htmlFor="target-url">Website URL</label>
          <input
            id="target-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
          <p className="input-hint">
            Enter the complete URL, including https:// where applicable.
          </p>
          {message && (
  <p role="status" className="input-hint">
    {message}
  </p>
)}
{scanId && (
  <p className="input-hint">
    Scan ID: {scanId}
  </p>
)}
{scanStatus && (
  <p className="input-hint">
    Status: {scanStatus}
  </p>
)}


{scanResults && (() => {
  const headerChecks = Object.entries(
    scanResults.security_headers || {}
  ).map(([name, result]) => ({ name, ...result }));

  const ssl = scanResults.ssl_tls;
  const allChecks = [
    ...headerChecks,
    ...(ssl?.status === "PASS" || ssl?.status === "FAIL"
      ? [{ name: "SSL / TLS", ...ssl }]
      : [])
  ];

  const passed = allChecks.filter(
    check => check.status === "PASS"
  ).length;

  const failed = allChecks.filter(
    check => check.status === "FAIL"
  ).length;

  const score = allChecks.length
    ? Math.round((passed / allChecks.length) * 100)
    : 0;

  return (
    <section className="panel scan-report">
      <h2>Scan Report</h2>

      <p>
        <strong>Target:</strong> {scanResults.target}
      </p>

      <p>
        <strong>HTTP Status:</strong>{" "}
        {scanResults.status_code}
      </p>

      <div className="score-card">
        <p>Security Check Score</p>
        <h1>{score}/100</h1>
        <p>
          Based on {allChecks.length} completed checks.
          This score does not guarantee overall website security.
        </p>
      </div>

      <div className="report-stats">
        <p>✅ Passed: {passed}</p>
        <p>❌ Failed: {failed}</p>
      </div>

      <h3>Security Checks</h3>

      {allChecks.map((check, index) => (
        <div className="check-item" key={`${check.name}-${index}`}>
          <strong>{check.name}</strong>
          <span>{check.status}</span>

          {check.description && <p>{check.description}</p>}

          {check.value && (
            <p>Current value: {check.value}</p>
          )}

          {check.recommendation && check.status === "FAIL" && (
            <p>
              <strong>Fix:</strong> {check.recommendation}
            </p>
          )}

          {check.recommendations?.length > 0 && (
            <ul>
              {check.recommendations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <h3>SSL / TLS Details</h3>
      {ssl && (
        <div className="check-item">
          <p>Status: {ssl.status}</p>

          {ssl.days_until_expiry != null && (
            <p>
              Certificate expires in approximately{" "}
              {ssl.days_until_expiry} days.
            </p>
          )}

          {ssl.cipher && (
            <p>
              Protocol: {ssl.cipher.protocol} · Cipher:{" "}
              {ssl.cipher.name} · {ssl.cipher.bits}-bit
            </p>
          )}

          {ssl.reason && <p>{ssl.reason}</p>}
        </div>
      )}

      <h3>Detected Technologies</h3>
      {scanResults.technology?.technologies?.length ? (
        <ul>
          {scanResults.technology.technologies.map((tech, index) => (
            <li key={index}>
              {tech.name}: {tech.value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No technology clues detected.</p>
      )}

      <p className="input-hint">
        Technology detection is passive and does not prove a vulnerability.
      </p>
    </section>
  );
})()}

         <button className="primary-button" type="submit" disabled={loading}>
  {loading ? 'Starting scan…' : 'Start passive scan →'}
</button>
        </form>

        <p className="disclaimer-inline">{DISCLAIMER}</p>
      </section>
    </>
  );
}
function PlaceholderPage({ name }) {
  if (name === 'Reports') {
    return (
      <section className="panel">
        <h2>Reports</h2>
        <p>View your saved website scan reports.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => window.location.reload()}
        >
          Refresh Reports
        </button>
        <p className="subtitle">
          To view a report, open Scan History and click View Report.
        </p>
      </section>
    );
  }

  return (
    <section className="panel placeholder-page">
      <div className="empty-icon">◇</div>
      <h2>{name}</h2>
      <p>This section is prepared for the next development stage.</p>
      <p className="subtitle">
        We will connect it to scan history, reports, and settings as we build the backend.
      </p>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('Dashboard');

  return (
    <div className="app-shell">
      <Sidebar page={page} navigate={setPage} />

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">VulnScan Lite <span>/</span> {page}</div>
          <div className="profile">
            <span className="online-indicator" />
            <span>Local workspace</span>
            <div className="profile-avatar">V</div>
          </div>
        </header>

       
<div className="page-content">
  {page === 'Dashboard' && <Dashboard navigate={setPage} />}
  {page === 'New Scan' && <NewScan />}
  {page === 'Scan History' && <ScanHistory />}
  {!['Dashboard', 'New Scan', 'Scan History'].includes(page) && (
    <PlaceholderPage name={page} />
  )}
</div>


        <footer className="footer">
          <span>VulnScan Lite</span>
          <span>Passive website security assessment</span>
        </footer>
      </main>
    </div>
  );
}

