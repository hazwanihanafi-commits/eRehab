import React, { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Entry() {
  const [patient, setPatient] = useState("");
  const [patientID, setPatientID] = useState("");
  const [therapist, setTherapist] = useState("");
  const [role, setRole] = useState("Physio");
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [verified, setVerified] = useState(false);

  const sigPad = useRef();

  const addSession = () => {
    setSessions([...sessions, { type: "Robotik", start: "", end: "" }]);
  };

  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  const calc = (s, e) => {
    if (!s || !e) return "";
    return (new Date(`1970-01-01T${e}`) - new Date(`1970-01-01T${s}`)) / (1000 * 60) + " min";
  };

  const submit = async () => {
    if (!patient || !therapist) return alert("Fill all fields");

    const signature = sigPad.current.toDataURL("image/png");

    await axios.post(API, {
      patient,
      patient_id: patientID,
      therapist,
      role,
      sessions: JSON.stringify(sessions),
      notes,
      signature,
      consent: consent ? "YES" : "NO",
      verified: verified ? "YES" : "NO",
      status: "Completed",
      date: new Date().toLocaleString()
    });

    alert("Saved ✅");
  };

  return (
    <div className="card">

      <input className="input" placeholder="Patient Name" onChange={e=>setPatient(e.target.value)}/>
      <input className="input" placeholder="Patient ID" onChange={e=>setPatientID(e.target.value)}/>
      <input className="input" placeholder="Therapist Name" onChange={e=>setTherapist(e.target.value)}/>

      <select className="input" onChange={e=>setRole(e.target.value)}>
        <option>Physio</option>
        <option>OT</option>
        <option>Rehab</option>
      </select>

      {sessions.map((s,i)=>(
        <div key={i} className="card">

          <select onChange={e=>updateSession(i,"type",e.target.value)}>
            <option>Robotik</option>
            <option>Physio</option>
            <option>OT</option>
          </select>

          <input type="time" onChange={e=>updateSession(i,"start",e.target.value)}/>
          <input type="time" onChange={e=>updateSession(i,"end",e.target.value)}/>

          <p>Duration: {calc(s.start,s.end)}</p>
        </div>
      ))}

      <button className="btn-blue" onClick={addSession}>+ Add Session</button>

      <textarea className="input" placeholder="Notes" onChange={e=>setNotes(e.target.value)}/>

      <label>
        <input type="checkbox" onChange={()=>setConsent(!consent)} /> Consent
      </label>

      <label>
        <input type="checkbox" onChange={()=>setVerified(!verified)} /> Verified
      </label>

      <SignatureCanvas ref={sigPad} canvasProps={{className:"sig"}}/>

      <button className="btn-green" onClick={submit}>Submit</button>

    </div>
  );
}
