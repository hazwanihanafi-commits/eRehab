import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Entry from "./pages/Entry";
import "./styles.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="app">
      <Sidebar setPage={setPage} />

      <div className="main">
        <Header />

        {page === "dashboard" && <Dashboard />}
        {page === "patients" && (
          <Patients setPage={setPage} setSelectedPatient={setSelectedPatient} />
        )}
        {page === "detail" && (
          <PatientDetail patient={selectedPatient} setPage={setPage} />
        )}
        {page === "entry" && <Entry />}
      </div>
    </div>
  );
}
