export default function Sidebar({ setPage }) {
  return (
    <div className="bg-blue-900 text-white w-48 min-h-screen p-4">
      <h2 className="font-bold mb-6">e-Rehab</h2>

      <p className="mb-3 cursor-pointer" onClick={() => setPage("dashboard")}>
        Dashboard
      </p>

      <p className="mb-3 cursor-pointer" onClick={() => setPage("patients")}>
        Patients
      </p>

      <p className="cursor-pointer" onClick={() => setPage("entry")}>
        Entry
      </p>
    </div>
  );
}
