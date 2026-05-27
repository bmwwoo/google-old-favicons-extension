# Classic Workspace Favicons

A small Manifest V3 Chrome extension written in TypeScript. It restores older, easier-to-scan favicons on Google Workspace pages, including Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Meet, Chat, Keep, Tasks, Contacts, and Voice.

The extension does not need network access or Chrome permissions. Icon sources are listed in `SOURCES.md`.

This is an unofficial browser extension and is not affiliated with, endorsed by, or sponsored by Google. Google product names and icons are trademarks of Google LLC.

## Preview

![Older Google favicons restored in Chrome tabs](docs/old-google-favicons-preview.png)

## Build

```sh
npm install
npm run build
```

## Package

```sh
npm run package
```

The upload ZIP is written to `classic-workspace-favicons.zip`.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/Users/brandon/workspace/google-old-favicons-extension/unpacked/classic-workspace-favicons`.

Reload any open Google app tabs after loading the extension.

The `unpacked/classic-workspace-favicons` folder is prebuilt and contains only the files Chrome needs.

## Chrome Web Store Notes

Use the neutral extension icon in `icons/` for the listing and toolbar icon. Do not use Google product icons as the extension logo or promotional tile.

Privacy policy: `PRIVACY.md`

Suggested short description:

> Restores older, easier-to-scan favicons on Google Workspace pages.

Suggested disclosure:

> This is an unofficial browser extension and is not affiliated with, endorsed by, or sponsored by Google. Google product names and icons are trademarks of Google LLC.
