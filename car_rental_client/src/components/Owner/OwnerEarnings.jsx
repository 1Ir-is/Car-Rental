import "./modern-card.css";
const OwnerEarnings = () => {
  // Demo data
  const totalRevenue = 12500;
  const totalBookings = 87;
  const monthRevenue = 2100;
  return (
    <div
      className="owner-earnings modern-card"
      style={{ maxWidth: "1400px", margin: "0 auto" }}
    >
      <div className="modern-card-header">
        <div className="modern-card-icon earnings">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <path
              d="M8 11h8M8 15h5"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="modern-card-title">Earnings & Financial Reports</h2>
          <p className="modern-card-desc">
            View your earnings, revenue analytics, and financial reports.
          </p>
        </div>
      </div>
      <div className="modern-card-body">
        <div className="earnings-grid" style={{ justifyContent: "center" }}>
          <div
            className="earnings-stat-card"
            style={{ minWidth: 220, flex: 1 }}
          >
            <div className="stat-icon total">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M12 3v18M5 12h14" stroke="#2563eb" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{ fontSize: "1.5rem" }}>
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div
            className="earnings-stat-card"
            style={{ minWidth: 220, flex: 1 }}
          >
            <div className="stat-icon booking">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <rect
                  x="3"
                  y="7"
                  width="18"
                  height="13"
                  rx="2"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path d="M16 3v4M8 3v4" stroke="#2563eb" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value" style={{ fontSize: "1.5rem" }}>
              {totalBookings}
            </div>
          </div>
          <div
            className="earnings-stat-card"
            style={{ minWidth: 220, flex: 1 }}
          >
            <div className="stat-icon month">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M8 11h8M8 15h5"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-label">This Month</div>
            <div className="stat-value" style={{ fontSize: "1.5rem" }}>
              ${monthRevenue.toLocaleString()}
            </div>
          </div>
        </div>
        <div
          className="earnings-chart-section"
          style={{
            marginTop: 32,
            borderRadius: 18,
            boxShadow: "0 2px 8px rgba(30,42,73,0.08)",
            background: "#f8fafc",
          }}
        >
          <div
            className="chart-title"
            style={{ fontSize: "1.15rem", fontWeight: 700 }}
          >
            Revenue Trend
          </div>
          <div className="chart-placeholder" style={{ minHeight: 120 }}>
            {/* Placeholder for chart, can use chart.js or recharts later */}
            <svg width="100%" height="80" viewBox="0 0 300 80">
              <polyline
                points="0,60 40,50 80,55 120,40 160,30 200,35 240,25 280,20"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
              />
              <circle cx="280" cy="20" r="5" fill="#2563eb" />
            </svg>
            <div style={{ color: "#64748b", fontSize: "1rem", marginTop: 12 }}>
              Chart demo. Connect data for real analytics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
