# Old Google Favicons

A small Manifest V3 Chrome extension written in TypeScript. It replaces Google Workspace tab favicons with local copies of older Google app icons for Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Meet, Chat, Keep, Tasks, Contacts, and Voice.

The extension does not need network access or Chrome permissions. Icon sources are listed in `SOURCES.md`.

This is an unofficial personal browser extension and is not affiliated with, endorsed by, or sponsored by Google. Google product names and icons are trademarks of Google LLC.

## Build

```sh
npm install
npm run build
```

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/Users/brandon/workspace/google-old-favicons-extension`.

Reload any open Google app tabs after loading the extension.
