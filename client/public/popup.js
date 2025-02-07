document.getElementById("login").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.user || !data.user._id) {
      throw new Error("Invalid response from server");
    }

    localStorage.setItem("userId", data.user._id);
    alert("Login successful!");
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
});

document.addEventListener("DOMContentLoaded", () =>{
  if(localStorage.getItem("userId") != ""){
    document.getElementById("login-form").style.display = "none";
  }
  else{
    document.getElementById("login-form").style.display = "block";
  }
})


// document.getElementById("viewReport").addEventListener("click", async () => {
//   console.log("View button clicked");
  
//   const userId = localStorage.getItem("userId");
//   const trackingData = JSON.parse(localStorage.getItem("trackingData")) || {}; 

//   if (!userId) {
//     alert("User not logged in");
//     return;
//   }

//   let reportHTML = "<h3>Today's Report</h3>";
//   for (let site in trackingData) {
//     reportHTML += `<p>${site}: ${trackingData[site]} seconds</p>`;

//     await fetch("http://localhost:5000/api/tracking/track", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId, website: site, timeSpent: trackingData[site] })
//     });
//   }

//   document.getElementById("report").innerHTML = reportHTML;
// });



document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userId");
  alert("Logged out successfully!");
});
const fetchDailyReport = async (userId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tracking/report/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const report = await response.json();
    if (report.msg) {
      alert(report.msg); // Alert if there's no data
    } else {
      displayReport(report); // Display the report if data exists
    }
  } catch (error) {
    console.error('Error fetching daily report:', error);
    alert('There was an error fetching the daily report.');
  }
};
const displayReport = (report) => {
  const reportContainer = document.getElementById('reportContainer');
  reportContainer.innerHTML = ''; // Clear any previous report

  if (report.length === 0) {
    reportContainer.innerHTML = '<p>No data available for today.</p>';
    return;
  }

  const table = document.createElement('table');
  const tableHeader = document.createElement('thead');
  tableHeader.innerHTML = `
    <tr>
      <th>Website</th>
      <th>Time Spent (in seconds)</th>
    </tr>
  `;
  table.appendChild(tableHeader);

  const tableBody = document.createElement('tbody');
  report.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.website}</td>
      <td>${entry.timeSpent}</td>
    `;
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  reportContainer.appendChild(table);
};

document.getElementById('viewReportButton').addEventListener('click', () => {
  const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage
  if (userId) {
    fetchDailyReport(userId);
  } else {
    alert('User not logged in!');
  }
});
