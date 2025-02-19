import React, { useEffect, useState } from "react";
import axios from "axios";
import './report.css'
import { useNavigate } from "react-router-dom";

const Report = () => {
  const [report, setReport] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user ID from Chrome storage
    const uId = localStorage.getItem("userId");
    if (uId) {
      setUserId(uId);
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/tracking/report/${userId}`)
        .then((response) => setReport(response.data))
        .catch((error) => console.error(error));
    }
  }, [userId]);

  const handleDeleteRecord = async (websiteName) => {
    try {
      if (userId && websiteName) {
        const response = await axios.delete("http://localhost:5000/api/tracking/delete-record", {
          data: {
            userId: userId,
            website: websiteName
          }
        });
        setReport((prevReport) => prevReport.filter(report => report.website !== websiteName));
        if (response.status == 200) {
          alert("Record Deleted");
        }
        else {
          alert("Record not deleted");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="main-container">
    <div className="report-container">
      <h2 className="report-title">Productivity Report</h2>
      {report.length === 0 ? (
        <div className="empty-report">
          <p>No data recorded yet. Use our extension to track.</p>
          <img src="https://jpsr.in/assets/images/nodatafound.gif" alt="No records found" />
        </div>
      ) : (
        <table className="website-container" width="100%">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th width="70%">Website</th>
              <th>Time Spent</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              report.map((entry, index) => (
                <tr key={index} className="website-record">
                  <td>{index+1}</td>
                  <td >{entry.website}</td>
                  <td>{entry.timeSpent} secs</td>
                  <td><button className="delete-btn" onClick={() => handleDeleteRecord(entry.website)}>Delete</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default Report;
