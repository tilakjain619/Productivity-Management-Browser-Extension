let currentTab;
let startTime;

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    // removing from if condition: && tab.url.startsWith("http" || "https")
    if (tab.url) {
      currentTab = new URL(tab.url).hostname;
      startTime = new Date().getTime();
    } else {
      currentTab = null;
      startTime = null;
    }
  } catch (error) {
    console.error("Error fetching tab URL:", error);
  }
});

// Track tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    // removing from if condition: && tab.url.startsWith("http" || "https")
    if (changeInfo.status === "complete" && tab.url) {
      const newSite = new URL(tab.url).hostname;
      if (newSite !== currentTab) {
        trackTime();
        currentTab = newSite;
        startTime = new Date().getTime();
      }
    }
  } catch (error) {
    console.error("Error updating tab:", error);
  }
});

// Function to track time
const trackTime = () => {
  if (currentTab && startTime) {
    const endTime = new Date().getTime();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    // Use chrome.storage.local instead of localStorage
    chrome.storage.local.get(["userId"], (result) => {
      const userId = result.userId;  // Get the user ID from chrome.storage.local

      if (userId) {
        fetch("http://localhost:5000/api/tracking/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, website: currentTab, timeSpent }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Time data sent successfully for:", currentTab);
          })
          .catch((error) => {
            console.error("Error sending tracking data:", error);
          });
      } else {
        console.log("User not logged in. Skipping tracking.");
      }
    });
  }
};

// Clear tracking data on browser restart
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ trackingData: {} });
});
