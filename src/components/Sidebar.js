export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <h2>e-Rehab</h2>
      <p onClick={() => setPage("dashboard")}>Dashboard</p>
      <p onClick={() => setPage("patients")}>Patients</p>
      <p onClick={() => setPage("entry")}>Entry</p>
    </div>
  );
}
