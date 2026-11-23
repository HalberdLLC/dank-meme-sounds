# DankMachine browser extension

A Manifest V3 toolbar soundboard for Chrome and Edge. It talks only to the public API at `https://dankmachine.com/api/v1`, which needs no key.

What it does:

- **Popup:** shows trending sounds, with instant search as you type. Four or more words are read as a moment ("my code finally compiled") and go to the reaction finder. Click a tile to play it. **1-9** play the first nine. **Shift+click** copies the sound page link.
- **Saved tab:** saved sounds sync between your browsers through `chrome.storage.sync`.
- **Right-click on selected text:** "Find a meme sound for ..." opens the popup with that text (Chrome 127 or later; older versions open the site search).
- **Shortcut:** **Alt+Shift+D** opens the popup.

It asks for only two permissions: `contextMenus` and `storage`. No host permissions are needed, because the API is CORS-open.

## Try it locally

1. Open `chrome://extensions` and turn on Developer mode.
2. Choose **Load unpacked** and select this folder.

## Publish

Publishing is done by a person. It needs a Chrome Web Store developer account, which has a one-time fee, and the Edge Add-ons account. Publish as Halberd LLC.

1. Zip the folder contents.
2. Upload the zip.
3. Use the store screenshots from the popup.
4. Set the privacy policy URL to https://dankmachine.com/privacy/. The extension stores only the saved list, in sync storage, and sends nothing but read-only API requests.

Links from the extension carry `?ref=extension`.
