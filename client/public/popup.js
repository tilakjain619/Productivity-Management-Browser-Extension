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

    chrome.storage.local.set({ userId: data.user._id });

    updateForm();

  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateForm();
})

function updateForm() {
  chrome.storage.local.get(["userId"], (result) => {
    const userId = result.userId;
    if (userId) {
      document.getElementById("login-form").style.display = "none";
      document.getElementById("user-container").style.display = "block";
    } else {
      document.getElementById("login-form").style.display = "block";
      document.getElementById("user-container").style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const siteInput = document.getElementById("siteInput");
  const blockBtn = document.getElementById("blockBtn");
  const blockedList = document.getElementById("blockedList");

  let userId = null;

  // Get user ID from local storage
  chrome.storage.local.get(["userId"], (result) => {
    userId = result.userId || null;
    if (userId) fetchBlockedSites();
  });

  // Fetch blocked sites from backend
  const fetchBlockedSites = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/get-user-preferences/${userId}`);
      const data = await response.json();
      updateBlockedList(data.blockedSites || []);
    } catch (error) {
      console.error("Error fetching blocked sites:", error);
    }
  };

  // Block site
  blockBtn.addEventListener("click", () => {
    const site = siteInput.value.trim();
    if (site) {
      chrome.runtime.sendMessage({ action: "blockSite", site }, () => {
        siteInput.value = "";
        fetchBlockedSites();
      });
    }
  });

  // Unblock site
  blockedList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const site = e.target.dataset.site;
      chrome.runtime.sendMessage({ action: "unblockSite", site }, () => {
        fetchBlockedSites();
      });
    }
  });

  // Update blocked sites list in UI
  function updateBlockedList(sites) {
    blockedList.innerHTML = "";
    sites.forEach((site) => {
      const li = document.createElement("li");
      li.classList.add("blocked-site");
      li.innerHTML = `${site} <button class="remove-btn" data-site="${site}">Unblock</button>`;
      blockedList.appendChild(li);
    });
  }
});


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
  chrome.storage.local.remove(["userId"]);
  updateForm();
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
      <th>Time Spent</th>
    </tr>
  `;
  table.appendChild(tableHeader);

  const tableBody = document.createElement('tbody');
  report.forEach((entry) => {
    const timeSpent = entry.timeSpent;
    let displayTime = timeSpent < 60 
      ? `${timeSpent} sec` 
      : `${(timeSpent / 60).toFixed(0)} min`;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.website}</td>
      <td>${displayTime}</td>
    `;
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  reportContainer.appendChild(table);
};

document.getElementById('viewReportButton').addEventListener('click', () => {
  // const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage
  chrome.storage.local.get(["userId"], (result) => {
    const userId = result.userId;
    if (userId) {
      fetchDailyReport(userId);
    } else {
      alert('User not logged in!');
    }
  });
  // Retrieve the user ID from localStorage

});
