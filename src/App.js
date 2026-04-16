import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Patients from "./components/Patients";
import PatientDetail from "./components/PatientDetail";
import Entry from "./components/Entry";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState("");

  return (
    <div className="flex">

      <Sidebar setPage={setPage} />

      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <Header />

        {page === "dashboard" && <Dashboard />}
        {page === "patients" && (
          <Patients setPage={setPage} setSelectedPatient={setSelectedPatient} />
        )}
        {page === "detail" && (
          <PatientDetail name={selectedPatient} setPage={setPage} />
        )}
        {page === "entry" && <Entry />}
      </div>

    </div>
  );
}
