import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const API = "https://api.sheetbest.com/sheets/371834a9-c99d-47fb-a236-0a5332e6f47c";

export default function App() {
  const [patient, setPatient] = useState("");
  const [patientID, setPatientID] = useState("");
  const [therapist, setTherapist] = useState("");
  const [role, setRole] = useState("Physio");
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState("");
  const [verified, setVerified] = useState(false);
  const [data, setData] = useState([]);

  const sigPad = useRef(null);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  // Add session
  const addSession = () => {
    setSessions([
      ...sessions,
      { type: "Robotik", start: "", end: "", device: "Cyberdyne" }
    ]);
  };

  // Update session
  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  // Calculate duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    const diff = (e - s) / (1000 * 60);
    return diff + " min";
  };

  // Submit
  const submit = async () => {
    if (!patient || !therapist || sessions.length === 0) {
      alert("Please complete all required fields");
      return;
    }

    if (!verified) {
      alert("Therapist verification required");
      return;
    }

    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert("Patient signature required");
      return;
    }

    try {
      const signature = sigPad.current.toDataURL();

      const enrichedSessions = sessions.map(s => ({
        ...s,
        duration: calculateDuration(s.start, s.end)
      }));

      await axios.post(API, {
        patient,
        patient_id: patientID,
        therapist,
        role,
        sessions: JSON.stringify(enrichedSessions),
        notes,
        signature,
        verified: "YES",
        status: "Completed",
        date: new Date().toLocaleString()
      });

      alert("✅ Saved successfully!");

      // reset
      setPatient("");
      setPatientID("");
      setTherapist("");
      setSessions([]);
      setNotes("");
      setVerified(false);
      sigPad.current.clear();

      axios.get(API).then(res => setData(res.data));

    } catch (err) {
      console.error(err);
      alert("❌ Error saving data");
    }
  };

  // Dashboard
  let robotik = 0, physio = 0, ot = 0;

  data.forEach(row => {
    if (!row.sessions) return;
    try {
      const s = JSON.parse(row.sessions);
      s.forEach(x => {
        if (x.type === "Robotik") robotik++;
        if (x.type === "Physio") physio++;
        if (x.type === "OT") ot++;
      });
    } catch {}
  });

  const chartData = {
    labels: ["Robotik", "Physio", "OT"],
    datasets: [
      {
        data: [robotik, physio, ot],
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"]
      }
    ]
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        e-Rehab Clinical System
      </h1>

      {/* DASHBOARD */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Patients</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Sessions</p>
          <h2 className="text-2xl font-bold">
            {robotik + physio + ot}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <Pie data={chartData} />
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded shadow max-w-2xl">

        <h2 className="text-xl font-semibold mb-4">Treatment Entry</h2>

        {/* Patient */}
        <input
          value={patient}
          placeholder="Patient Name"
          className="border p-2 w-full mb-2"
          onChange={e => setPatient(e.target.value)}
        />

        <input
          value={patientID}
          placeholder="Patient ID / IC"
          className="border p-2 w-full mb-4"
          onChange={e => setPatientID(e.target.value)}
        />

        {/* Therapist */}
        <input
          value={therapist}
          placeholder="Therapist Name"
          className="border p-2 w-full mb-2"
          onChange={e => setTherapist(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-4"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option>Physio</option>
          <option>OT</option>
          <option>Rehab</option>
        </select>

        {/* Sessions */}
        {sessions.map((s, i) => (
          <div key={i} className="border p-3 mb-3 rounded">

            <select
              className="border p-2 w-full mb-2"
              onChange={e => updateSession(i, "type", e.target.value)}
            >
              <option>Robotik</option>
              <option>Physio</option>
              <option>OT</option>
            </select>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="time"
                onChange={e => updateSession(i, "start", e.target.value)}
                className="border p-2"
              />
              <input
                type="time"
                onChange={e => updateSession(i, "end", e.target.value)}
                className="border p-2"
              />
            </div>

            <select
              className="border p-2 w-full"
              onChange={e => updateSession(i, "device", e.target.value)}
            >
              <option>Cyberdyne</option>
              <option>Manual</option>
            </select>

            <p className="text-sm mt-2 text-gray-500">
              Duration: {calculateDuration(s.start, s.end)}
            </p>

          </div>
        ))}

        <button
          onClick={addSession}
          className="bg-blue-600 text-white px-4 py-2 mb-4"
        >
          + Add Session
        </button>

        {/* Notes */}
        <textarea
          placeholder="Session Notes"
          className="border p-2 w-full mb-4"
          onChange={e => setNotes(e.target.value)}
        />

        {/* Verification */}
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={verified}
            onChange={() => setVerified(!verified)}
            className="mr-2"
          />
          Therapist confirms session is accurate
        </label>

        {/* Signature */}
        <p className="font-semibold mb-2">Patient Signature</p>
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{ className: "border w-full h-40 bg-white mb-4" }}
        />

        <button
          onClick={submit}
          className="bg-green-600 text-white px-4 py-2 w-full"
        >
          Submit Treatment
        </button>

      </div>

    </div>
  );
}
