import React, { useEffect, useState } from "react";
import axios from "axios";
import './report.css'

const Report = () => {
  const [report, setReport] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Retrieve user ID from Chrome storage
    const uId = localStorage.getItem("userId");
    if (uId) {
      setUserId(uId);
    } else {
      alert("User not logged in");
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
    <div className="report-container">
      <h2>Productivity Report</h2>
      {report.length === 0 ? (
        <p>No data available</p>
      ) : (
        <table className="website-container" width="100%">
          <thead>
            <tr>
              <th width="70%">Website</th>
              <th>Time Spent</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              report.map((entry, index) => (
                <tr key={index} className="website-record">
                  <td>{entry.website}</td>
                  <td>{entry.timeSpent} secs</td>
                  <td><button onClick={() => handleDeleteRecord(entry.website)}>Delete</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Report;
