// Right-click selected text -> "Find a meme sound for this": opens the reaction finder with that text.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'dm-find', title: 'Find a meme sound for “%s”', contexts: ['selection'] });
});
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'dm-find' || !info.selectionText) return;
  const text = info.selectionText.slice(0, 200);
  await chrome.storage.session.set({ pending: text });
  // openPopup needs Chrome 127+; fall back to the site's search otherwise.
  try { await chrome.action.openPopup(); }
  catch { chrome.tabs.create({ url: `https://dankmachine.com/search/?q=${encodeURIComponent(text)}` }); }
});
