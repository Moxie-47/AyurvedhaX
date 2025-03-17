import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Consultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [doctorConsultations, setDoctorConsultations] = useState([]); // ✅ Doctor's scheduled consultations
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [userRole, setUserRole] = useState(''); // ✅ Check if user is a doctor or patient

  useEffect(() => {
    fetchConsultations();
    fetchDoctorConsultations(); // ✅ Fetch doctor's meetings
    fetchDoctors();
    getUserRole();
  }, []);

  // ✅ Fetch current user's role
  const getUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/user', {
        headers: { 'x-auth-token': token },
      });
      setUserRole(res.data.role); // Assuming "role" is stored in user schema
    } catch (err) {
      console.error("Error fetching user role", err);
    }
  };

  // ✅ Fetch patient's consultations
  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/consultation/my-consultations', {
        headers: { 'x-auth-token': token },
      });
      setConsultations(res.data);
    } catch (err) {
      console.error("Error fetching consultations", err);
    }
  };

  // ✅ Fetch doctor's scheduled consultations
  const fetchDoctorConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/consultation/doctor-consultations', {
        headers: { 'x-auth-token': token },
      });
      setDoctorConsultations(res.data);
    } catch (err) {
      console.error("Error fetching doctor consultations", err);
    }
  };

  // ✅ Fetch available doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  // ✅ Book a new consultation
  const bookConsultation = async () => {
    if (!doctorId || !date) {
      alert("Please select a doctor and choose a date.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/consultation/book', 
        { doctor: doctorId, date }, 
        { headers: { 'x-auth-token': token } }
      );

      alert('Consultation booked successfully!');
      setDoctorId('');
      setDate('');
      fetchConsultations(); // Refresh patient's consultations
      fetchDoctorConsultations(); // Refresh doctor's consultations
    } catch (err) {
      console.error("Error booking consultation", err);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Book a Consultation</h2>

      {/* ✅ Doctor Selection Dropdown */}
      <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="border p-2 mr-2">
        <option value="">Select a Doctor</option>
        {doctors.map((doc) => (
          <option key={doc._id} value={doc._id}>{doc.name}</option>
        ))}
      </select>

      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
             className="border p-2 mr-2"/>
      <button onClick={bookConsultation} className="bg-blue-500 text-white px-4 py-2 cursor-pointer">Book</button>

      <h2 className="text-xl font-bold mt-6 mb-4">Your Consultations</h2>
      <ul>
        {consultations.map((c) => (
          <li key={c._id} className="border p-2 mb-2">
            <p>Doctor: {c.doctor?.name || "Unknown"}</p>
            <p>Date: {new Date(c.date).toLocaleString()}</p>
            <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">Join Call</a>
          </li>
        ))}
      </ul>

      {/* ✅ Show Scheduled Consultations for Doctors */}
      {userRole === "doctor" && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-4">Scheduled Consultations</h2>
          <ul>
            {doctorConsultations.map((c) => (
              <li key={c._id} className="border p-2 mb-2">
                <p>Patient: {c.patient?.name || "Unknown"}</p>
                <p>Date: {new Date(c.date).toLocaleString()}</p>
                <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">Join Call</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Consultation;
