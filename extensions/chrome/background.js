// Right-click any selected text: "Find a meme sound for ..." opens the popup with that text (Chrome 127+ can open
// the popup from here); older browsers get the site's search in a new tab instead.
const MENU_ID = 'dm-find-sound';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: 'Find a meme sound for "%s"', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  const q = info.selectionText.trim().slice(0, 200);
  await chrome.storage.session.set({ pending: q });
  try {
    await chrome.action.openPopup();
  } catch {
    chrome.tabs.create({ url: `https://dankmachine.com/search/?q=${encodeURIComponent(q.slice(0, 80))}&ref=extension` });
  }
});
