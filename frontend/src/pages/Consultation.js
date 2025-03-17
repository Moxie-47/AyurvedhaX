import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Consultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [doctorConsultations, setDoctorConsultations] = useState([]); 
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [userRole, setUserRole] = useState(''); 

  useEffect(() => {
    fetchConsultations();
    fetchDoctorConsultations(); 
    fetchDoctors();
    getUserRole();
  }, []);

  
  const getUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/user', {
        headers: { 'x-auth-token': token },
      });
      setUserRole(res.data.role); 
    } catch (err) {
      console.error("Error fetching user role", err);
    }
  };

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

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

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
      fetchConsultations(); 
      fetchDoctorConsultations();
    } catch (err) {
      console.error("Error booking consultation", err);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Book a Consultation</h2>

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
