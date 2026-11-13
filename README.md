# Flynn Home Page

A fast, customizable browser start page with a live clock, day-progress card, weather for Cambodia, a multi-engine search bar and pinned shortcuts. It installs as an app and opens offline.

Built with plain HTML, CSS and JavaScript: no build step, no framework, no API keys.

## Contents

- [Features](#features)
- [Theme in use](#theme-in-use)
- [Particle network](#particle-network)
- [Settings reference](#settings-reference)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Install as an app and offline use](#install-as-an-app-and-offline-use)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Customization](#customization)
- [External services](#external-services)
- [Data and privacy](#data-and-privacy)
- [Browser support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

**Home page**

- **Live clock and greeting** with 12/24-hour format, optional seconds and a time-aware welcome message.
- **Day-progress card** showing how much of the day has passed, with a face that changes through the day.
- **Weather** from [Open-Meteo](https://open-meteo.com/) for 25 locations: Phnom Penh and all 24 provinces of Cambodia, searchable in English and Khmer, in °C or °F.
- **Shortcuts** with automatic site icons. Add, preview and remove them from a validated dialog.

**Google bar** (top right, like the Google home page)

- **Gmail** and **Images** links, a **Google apps** menu with 18 services (Account, Search, Maps, YouTube, Gmail, Drive, Calendar, Meet, Photos, Docs, Sheets, Slides, Translate, News, Keep, Contacts, Gemini, Play) and a **profile** button.
- The profile card shows your name, photo and optional email, with links to **Manage your Google Account** and **Switch account**.
- A web page cannot read your Google photo automatically, so you upload it once in **Edit profile**. It is resized and stored on your device only.

**Search**

- Google, YouTube, GitHub, Maps and DuckDuckGo, plus voice search, Google Lens and AI Mode.
- **Suggestions** appear as you type (Google, with DuckDuckGo as backup), and **search history** appears when you click the empty search bar. Use the arrow keys to move through the list and press Enter to search. Remove a single history item with its ✕ button.
- Typing a URL opens it directly.
- Choose the default engine, hide the engine chips, and open results in the same tab or a new tab.

**Settings**

- A drawer with its own search box, seven sections, short descriptions and keyboard-accessible controls.
- Options that depend on a switch (for example particle amount) dim when it is off.
- Every section has a **Reset this section** button, and reset actions ask for confirmation.
- Backup and restore of all settings as a JSON file.

**App**

- Installable on desktop and phone, and opens without internet after the first visit.
- Light and dark mode (auto, light or dark), six themes and a custom four-color background.
- Everything is stored in your browser. There is no server, account or tracking.

## Theme in use

**Aurora** (the default theme). A deep indigo, teal and violet gradient with soft animated glow and a particle network.

| Setting | Value |
| --- | --- |
| Color theme | **Aurora** |
| Appearance | Auto (follows your device light or dark setting) |
| Day-bar color | Aqua |
| Glow, particles, glass blur | On, On, 16 px (see [Particle network](#particle-network)) |

Aurora colors:

| Mode | Color 1 | Color 2 | Color 3 | Base |
| --- | --- | --- | --- | --- |
| Dark | `#1b1464` | `#0f766e` | `#7c3aed` | `#0b1020` |
| Light | `#c7d2fe` | `#a7f3d0` | `#e9d5ff` | `#fdf2f8` |

To switch back to it at any time: **Settings → Theme → Color theme → Aurora**.

### All themes

| Theme | Dark colors | Light colors |
| --- | --- | --- |
| **Aurora** (default) | `#1b1464` `#0f766e` `#7c3aed` `#0b1020` | `#c7d2fe` `#a7f3d0` `#e9d5ff` `#fdf2f8` |
| Sunset | `#7c1d3a` `#c2410c` `#6d28d9` `#1a0b1f` | `#fecaca` `#fed7aa` `#fbcfe8` `#fff7ed` |
| Ocean | `#0c4a6e` `#0e7490` `#1e3a8a` `#04101f` | `#bae6fd` `#a5f3fc` `#bfdbfe` `#f0f9ff` |
| Forest | `#14532d` `#3f6212` `#115e59` `#07140d` | `#bbf7d0` `#d9f99d` `#99f6e4` `#f7fee7` |
| Candy | `#831843` `#6b21a8` `#1e40af` `#140a1f` | `#fbcfe8` `#ddd6fe` `#bfdbfe` `#fdf4ff` |
| Graphite | `#3f3f46` `#52525b` `#27272a` `#09090b` | `#e4e4e7` `#f4f4f5` `#d4d4d8` `#fafafa` |
| Custom | your own four colors | your own four colors |

### Day-bar gradients

| Name | Colors |
| --- | --- |
| **Aqua** (default) | `#34e0c0` `#4cc9d0` `#7b7fd6` `#9a6fdc` |
| Sunset | `#ffb347` `#ff7e5f` `#e8508f` `#a64bd6` |
| Ocean | `#38bdf8` `#3b82f6` `#4f46e5` `#7c3aed` |
| Forest | `#a3e635` `#4ade80` `#14b8a6` `#0e7490` |
| Candy | `#f9a8d4` `#f472b6` `#c084fc` `#818cf8` |
| Mono | `#9ca3af` `#6b7280` `#4b5563` `#374151` |

## Particle network

An animated background layer of drifting dots. Nearby dots are joined by thin lines, and dots move away from your cursor. It is drawn on a canvas behind the page, uses the colors of the active theme, and can be switched off completely.

Open **Settings → Particles** to change it.

| Setting | What it does | Range | Default | In use |
| --- | --- | --- | --- | --- |
| Enable particles | Turns the whole effect on or off | On / Off | On | On |
| Amount | Number of dots | 10 to 250 | 80 | **110** |
| Dot size | Size of each dot | 40% to 400% | 100% | **120%** |
| Speed | How fast the dots drift (0% freezes them) | 0% to 400% | 100% | **120%** |
| Connecting lines | Draw lines between nearby dots | On / Off | On | On |
| Line distance | How close two dots must be to join | 40 to 250 px | 100 px | **120 px** |
| Dots move away from cursor | Dots avoid the mouse pointer | On / Off | On | On |

The "In use" column records the values currently chosen for this page. Every option except **Enable particles** dims when the effect is off, and **Reset this section** returns all of them to the defaults.

Tips:

- For a calm, minimal look, lower **Amount** and **Speed**, or turn off **Connecting lines**.
- On older phones and laptops, a smaller **Amount** or turning particles off reduces CPU and battery use.
- The defaults live in `DEF` in `script.js` (`particles`, `pCount`, `pSize`, `pSpeed`, `pLines`, `pLink`, `pMouse`).

## Settings reference

Open Settings with the gear button or the `,` key.

| Section | Options |
| --- | --- |
| **Theme** | Color theme, appearance (auto, light, dark), custom background colors, animated glow, glass blur |
| **Search** | Show engine chips, show Voice / Lens / AI Mode buttons, search suggestions on or off, save history, searches to keep, clear history, default search engine, open results in same tab or new tab |
| **Display** | 24-hour clock, show seconds, weather card, temperature unit, open shortcuts and Google bar links in a new tab, show Google bar |
| **Particles** | Enable, amount, dot size, speed, connecting lines, line distance, dots move away from cursor |
| **Size** | Interface size, clock size |
| **Day bar** | Show bar, color, height, width, corner roundness, percentage size, dim passed time, percentage, text, face, clouds, bubbles |
| **Data** | Edit profile and photo, change location, install app, export and import backup, reset all settings |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus the search bar |
| `,` | Open or close Settings |
| `Esc` | Close a dialog or the Settings drawer |

## Install as an app and offline use

The page is a Progressive Web App. It needs https, which Vercel and GitHub Pages provide.

- **Install:** Chrome and Edge show an install icon in the address bar, or use **Settings → Data → Install app**. On iPhone use Share, then Add to Home Screen.
- **Offline:** after the first visit the page, fonts and icons are saved and open without internet. Weather and web searches still need a connection.
- **Updates:** your own files load from the network first, so a new deploy shows on the next visit. If you change the caching rules in `sw.js`, raise `VERSION` at the top of that file.
- Deploy to the **root** of a domain or project, not a sub-path, so the service worker controls the whole page.

## Project structure

```
.
├── index.html             # Page markup
├── style.css              # Themes, layout, settings drawer, dialogs, responsive rules
├── script.js              # Clock, weather, search, shortcuts, settings, dialogs, install
├── sw.js                  # Service worker (offline cache)
├── manifest.webmanifest   # App name, colors and icons
├── vercel.json            # Vercel headers for sw.js and the manifest
├── favicon.svg            # Site icon
├── icons/                 # App icons (192, 512, maskable, Apple touch)
└── README.md
```

## Run locally

No installation is required.

```bash
# Option 1: open the file directly (offline mode is not available this way)
open index.html            # macOS
start index.html           # Windows
xdg-open index.html        # Linux

# Option 2: serve it locally (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

### Vercel (recommended)

1. Push the project to a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel select **Add New → Project** and import the repository.
3. Set **Framework Preset** to **Other**. Leave the build command and output directory empty.
4. Select **Deploy**. Every push to the main branch redeploys automatically.

You can also deploy without Git by running `npx vercel --prod` inside the project folder.

`vercel.json` is already included. It makes sure `sw.js` is never cached by the host, so updates always arrive.

### GitHub Pages

1. Create a public repository and push the project with `index.html` at the repository root.
2. Open **Settings → Pages**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
3. The site is served at `https://<username>.github.io/<repository>/`.

Because this URL has a sub-path, installing and offline use are more reliable on Vercel or a custom domain.

### Custom domain

Add the domain in your host's dashboard (**Vercel: Settings → Domains**, **GitHub: Settings → Pages**), then create the DNS records it shows. HTTPS is enabled automatically once the certificate is issued.

### Use it as your new-tab page

Chrome does not allow a web page as the new tab by default. Use a "custom new tab" extension and set it to your site URL, or set the URL as your browser's home page.

## Customization

| What | Where |
| --- | --- |
| Default shortcuts | `DEFAULT_LINKS` in `script.js` |
| Search engines | `ENGINES` in `script.js` |
| Color themes | `THEMES` in `script.js` |
| Day-bar gradients | `DPG` in `script.js` |
| Weather locations | `LOCS` in `script.js` (id, English name, Khmer name, type, latitude, longitude) |
| Default settings | `DEF` in `script.js` |
| Settings sections and options | `SCHEMA` in `script.js` |
| App name, colors, icons | `manifest.webmanifest` and `icons/` |
| Dialog styling | the "professional dialogs" section of `style.css` |
| Settings drawer styling | the "professional settings drawer" sections at the end of `style.css` |

To add a weather location, append an entry to `LOCS`:

```js
{ id: 'example', n: 'Example Town', km: 'ឈ្មោះ', t: 'province', lat: 12.34, lon: 104.56 }
```

To add a theme, add an entry to `THEMES` with four dark (`d`) and four light (`l`) colors, then list it in this README.

## External services

The page makes requests to these services from the visitor's browser:

| Service | Purpose |
| --- | --- |
| [Open-Meteo](https://open-meteo.com/) | Current temperature and conditions (no API key) |
| Google Fonts | Inter typeface |
| cdnjs (Font Awesome 6.5.2) | Icons |
| Google favicon service | Shortcut, search-engine and Google app icons |
| Google suggest (`suggestqueries.google.com`) | Search suggestions while you type (can be turned off) |
| DuckDuckGo (`duckduckgo.com/ac`) | Backup source for search suggestions |

Fonts, icons and shortcut icons are saved by the service worker after the first visit, so they also show offline. If weather is unreachable, it shows "Weather unavailable". If a shortcut icon is unreachable, a generic globe is used.

## Data and privacy

Settings, name, profile photo and email, shortcuts, location, search engine and search history are saved only in the browser's `localStorage`. Clearing site data resets the page.

**Search suggestions send what you type** to Google (or DuckDuckGo) so they can suggest completions. Turn this off in **Settings → Search → Show search suggestions**. Search history is never sent anywhere. Clear it in the same section. Use **Settings → Data → Export backup** to save a copy and **Import backup** to restore it on another browser or device.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. Voice search needs a browser that supports the Web Speech API (Chrome and Edge). The install button appears in Chrome and Edge; Safari uses Add to Home Screen.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Deployed site shows a 404 | Confirm `index.html` is at the project root and the host serves that folder. |
| Changes do not appear | Wait a minute for deployment, then hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`). Close and reopen an installed app once. |
| No install button | The page must be on https and not already installed. Use the browser menu or address-bar icon instead. |
| Offline does not work | Visit the site once while online and reload, then check **DevTools → Application → Service Workers**. |
| No search suggestions | They need internet and can be blocked by ad blockers or privacy extensions. History still works. Check **Settings → Search → Show search suggestions**. |
| Weather shows "unavailable" | Check your connection or any ad blocker that may block `api.open-meteo.com`. |
| Settings disappeared | Site data was cleared or you are in a private window. Restore from a backup file. |

## License

Add a license of your choice (for example [MIT](https://choosealicense.com/licenses/mit/)) as a `LICENSE` file in the repository root.
