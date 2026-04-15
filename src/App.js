import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const API = "https://api.sheetbest.com/sheets/b94defad-293c-4cd2-87b2-6cea25008f44";

export default function App() {
  const [patient, setPatient] = useState("");
  const [sessions, setSessions] = useState([]);
  const [data, setData] = useState([]);

  const sigPad = useRef(null);

  // LOAD DATA
  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  // ADD SESSION
  const addSession = () => {
    setSessions([...sessions, { type: "Robotik", time: "", duration: "" }]);
  };

  // UPDATE SESSION
  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  // SUBMIT (FIXED VERSION)
  const submit = async () => {
    console.log("Submit clicked");

    if (!patient || sessions.length === 0) {
      alert("Please fill patient & session");
      return;
    }

    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert("Please sign first!");
      return;
    }

    try {
      const signature = sigPad.current.toDataURL();

      await axios.post(API, {
        patient,
        sessions: JSON.stringify(sessions),
        signature,
        status: "Completed",
        date: new Date().toLocaleString()
      });

      alert("✅ Data saved!");

      // RESET FORM (better UX)
      setPatient("");
      setSessions([]);
      sigPad.current.clear();

      // reload dashboard
      axios.get(API).then(res => setData(res.data));

    } catch (err) {
      console.error(err);
      alert("❌ Error saving data");
    }
  };

  // DASHBOARD COUNT
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
        backgroundColor: ["#2F6FED", "#27AE60", "#F39C12"]
      }
    ]
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        e-Rehab Digital System
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
      <div className="bg-white p-6 rounded shadow max-w-xl">

        <h2 className="text-xl font-semibold mb-4">
          Treatment Entry
        </h2>

        <input
          value={patient}
          placeholder="Patient Name"
          className="border p-2 w-full mb-3"
          onChange={e => setPatient(e.target.value)}
        />

        {sessions.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">

            <select
              className="border p-2"
              value={s.type}
              onChange={e => updateSession(i, "type", e.target.value)}
            >
              <option>Robotik</option>
              <option>Physio</option>
              <option>OT</option>
            </select>

            <input
              type="time"
              className="border p-2"
              onChange={e => updateSession(i, "time", e.target.value)}
            />

            <input
              placeholder="Duration (1h)"
              className="border p-2"
              onChange={e => updateSession(i, "duration", e.target.value)}
            />

          </div>
        ))}

        <button
          onClick={addSession}
          className="bg-blue-600 text-white px-4 py-2 mb-4"
        >
          + Add Session
        </button>

        {/* SIGNATURE */}
        <p className="font-semibold mb-2">Patient Signature</p>

        <SignatureCanvas
          ref={sigPad}
          canvasProps={{
            className: "border w-full h-40 bg-white"
          }}
        />

        <button
          onClick={submit}
          className="bg-green-600 text-white px-4 py-2 w-full mt-3"
        >
          Submit Treatment
        </button>

      </div>

    </div>
  );
}
