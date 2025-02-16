let currentTab = null;
let startTime = null;
let intervalId = null;
let blockedSites = [];
let userId = null;

// Fetch blocked sites from the backend
const fetchBlockedSites = async () => {
  if (!userId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/users/get-user-preferences/${userId}`);
    const data = await response.json();
    blockedSites = data.blockedSites || [];
    console.log("Blocked sites updated:", blockedSites);
  } catch (error) {
    console.error("Error fetching blocked sites:", error);
  }
};

// Sync user ID and fetch blocked sites on startup
chrome.storage.local.get(["userId"], (result) => {
  userId = result.userId || null;
  fetchBlockedSites();
});

// **Automatically refresh blocked sites list every 30 minutes**
setInterval(fetchBlockedSites, 1800000); // 30 minutes

// Track time spent on websites
const startTracking = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    trackTime(false); // Log time periodically without resetting
  }, 10000); // Every 10 seconds
};

const trackTime = (resetStart) => {
  if (currentTab && startTime) {
    const endTime = new Date().getTime();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    if (timeSpent > 0) {
      chrome.storage.local.get(["userId"], async (result) => {
        const userId = result.userId;
        if (!userId) return;

        try {
          await fetch("http://localhost:5000/api/tracking/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, website: currentTab, timeSpent }),
          });

          console.log(`Time tracked: ${timeSpent} sec on ${currentTab}`);
        } catch (error) {
          console.error("Error sending tracking data:", error);
        }
      });
    }
    if (resetStart) startTime = new Date().getTime(); // Reset timer on switch
  }
};

// Handle tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
      const newSite = new URL(tab.url).hostname;

      if (newSite !== currentTab) {
        trackTime(true); // Save time before switching
        currentTab = newSite;
        startTime = new Date().getTime();
        startTracking();
      }
    } else {
      stopTracking(); // Stop tracking if it's not a website
    }
  } catch (error) {
    console.error("Error fetching tab URL:", error);
  }
});

// Handle page refresh or URL change
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (changeInfo.status === "complete" && tab.url) {
      const newSite = new URL(tab.url).hostname;

      if (newSite !== currentTab) {
        trackTime(true); // Log previous time
        currentTab = newSite;
        startTime = new Date().getTime();
        startTracking();
      }
    }
  } catch (error) {
    console.error("Error updating tab:", error);
  }
});

// Stop tracking when switching to non-websites
const stopTracking = () => {
  if (currentTab) trackTime(true);
  currentTab = null;
  startTime = null;
  clearInterval(intervalId);
};

// Handle browser close & tab removal
chrome.windows.onRemoved.addListener(() => trackTime(true));
chrome.runtime.onSuspend.addListener(() => trackTime(true));
chrome.runtime.onStartup.addListener(() => chrome.storage.local.set({ trackingData: {} }));

// **Block Sites Feature**
// Check if the site should be blocked when updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    const site = new URL(tab.url).hostname;
    if (blockedSites.includes(site)) {
      chrome.tabs.update(tabId, { url: "chrome-extension://bijdfjfcbolmciflllmjkjcmliecgdhk/blocked.html" });
    }
  }
});

// Add a site to the blocklist
const blockSite = async (site) => {
  if (!userId || blockedSites.includes(site)) return; // Prevent duplicates

  blockedSites.push(site);
  try {
    await fetch(`http://localhost:5000/api/users/update-user-preferences/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedSites }),
    });
    console.log(`Blocked: ${site}`);
  } catch (error) {
    console.error("Error updating blocked sites:", error);
  }
};

// Remove a site from the blocklist
const unblockSite = async (site) => {
  if (!userId || !blockedSites.includes(site)) return; // Only remove if exists

  blockedSites = blockedSites.filter((s) => s !== site);
  try {
    await fetch(`http://localhost:5000/api/users/update-user-preferences/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedSites }),
    });
    console.log(`Unblocked: ${site}`);
  } catch (error) {
    console.error("Error updating blocked sites:", error);
  }
};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "blockSite") {
    blockSite(message.site);
    sendResponse({ success: true });
  } else if (message.action === "unblockSite") {
    unblockSite(message.site);
    sendResponse({ success: true });
  }
});
