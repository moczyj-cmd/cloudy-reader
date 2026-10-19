/**
 * ==========================================================================
 * Cloudy Reader ☁️ Background Service Worker (Context Menus)
 * ==========================================================================
 */

// Force-clear and rebuild the menu to bypass Chrome's installation cache
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "cloudy-tts-read",
    title: "Read Text Aloud",
    contexts: ["selection"],
  });
});

// Broadcast the TTS signal to the live tab
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cloudy-tts-read") {
    chrome.tabs.sendMessage(tab.id, {
      action: "execute-tts",
      text: info.selectionText,
    });
  }
});