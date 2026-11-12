# Flynn Home Page

A fast, customizable browser start page with a live clock, day-progress card, weather for Cambodia, a multi-engine search bar and pinned shortcuts. Built with plain HTML, CSS and JavaScript: no build step, no framework, no API keys.

## Features

- **Live clock and greeting** with 12/24-hour format, optional seconds and a time-aware welcome message.
- **Day-progress card** showing how much of the day has passed, with a face that changes through the day.
- **Weather** from [Open-Meteo](https://open-meteo.com/). Choose from **25 locations**: the capital city (Phnom Penh) and all 24 provinces of Cambodia, with English and Khmer search. Switch between °C and °F.
- **Search bar** with Google, YouTube, GitHub, Maps and DuckDuckGo, plus voice search, Google Lens and AI Mode shortcuts. Typing a URL opens it directly.
- **Shortcuts** with automatic site icons. Add, preview and remove from a validated dialog.
- **Professional dialogs** for every input: keyboard accessible, focus-trapped, light/dark aware and mobile friendly.
- **Settings drawer** for themes, light/dark/auto mode, custom colors, particle background, glass blur, interface size, clock size and day-bar styling.
- **Backup and restore** of all settings as a JSON file.
- **Privacy friendly**: everything is stored in your browser's `localStorage`. There is no server, account or tracking.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus the search bar |
| `,` | Open or close Settings |
| `Esc` | Close a dialog or the Settings drawer |

## Project structure

```
.
├── index.html     # Page markup
├── style.css      # Themes, layout, dialogs, responsive rules
├── script.js      # Clock, weather, search, shortcuts, settings, dialogs
├── favicon.svg    # Site icon
└── README.md
```

## Run locally

No installation is required. Pick either option:

```bash
# Option 1: open the file directly
open index.html            # macOS
start index.html           # Windows
xdg-open index.html        # Linux

# Option 2: serve it locally (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

GitHub Pages hosts the site for free at `https://<username>.github.io/<repository>/`.

### 1. Create the repository

1. Sign in to GitHub and select **New repository**.
2. Name it (for example `flynn-home-page`), choose **Public**, and create it without a README, because this project already includes one.

### 2. Push the project

Run these commands from inside the project folder (the one containing `index.html`):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

### 3. Enable Pages

1. Open the repository on GitHub, then **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the **main** branch and the **/ (root)** folder, then select **Save**.
4. Wait about a minute. The live URL appears at the top of the Pages settings.

`index.html` must sit at the root of the repository, not inside a subfolder.

### 4. Updating the site

```bash
git add .
git commit -m "Describe your change"
git push
```

Pages redeploys automatically after each push.

### Optional: custom domain

1. In **Settings → Pages → Custom domain**, enter your domain and save.
2. At your DNS provider, add a `CNAME` record pointing `www` to `<username>.github.io`. For an apex domain, add the A records listed in the [GitHub Pages documentation](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. Enable **Enforce HTTPS** once the certificate is issued.

### Use it as your new-tab page

Chrome does not allow a web page as the new tab by default. Use a "custom new tab" extension and set it to your Pages URL, or set the URL as your browser's home page.

## Customization

| What | Where |
| --- | --- |
| Default shortcuts | `DEFAULT_LINKS` in `script.js` |
| Search engines | `ENGINES` in `script.js` |
| Color themes | `THEMES` in `script.js` |
| Day-bar gradients | `DPG` in `script.js` |
| Weather locations | `LOCS` in `script.js` (id, English name, Khmer name, type, latitude, longitude) |
| Default settings | `DEF` in `script.js` |
| Dialog styling | the "professional dialogs" section at the end of `style.css` |

To add a weather location, append an entry to `LOCS`:

```js
{ id: 'example', n: 'Example Town', km: 'ឈ្មោះ', t: 'province', lat: 12.34, lon: 104.56 }
```

## External services

The page makes requests to these services from the visitor's browser:

| Service | Purpose |
| --- | --- |
| [Open-Meteo](https://open-meteo.com/) | Current temperature and conditions (no API key) |
| Google Fonts | Inter typeface |
| cdnjs (Font Awesome 6.5.2) | Icons |
| Google favicon service | Shortcut and search-engine icons |

If a service is unreachable, the page still loads. Weather shows "Weather unavailable" and shortcut icons fall back to a generic globe.

## Data and privacy

Settings, name, shortcuts, location and search engine are saved only in the browser's `localStorage`. Clearing site data resets the page. Use **Settings → Data → Export backup** to save a copy, and **Import backup** to restore it on another browser or device.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. Voice search needs a browser that supports the Web Speech API (Chrome and Edge).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Pages shows a 404 | Confirm `index.html` is at the repository root and Pages is set to the `main` branch, `/ (root)`. |
| Changes do not appear | Wait a minute for deployment, then hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`). |
| Weather shows "unavailable" | Check your connection or any ad blocker that may block `api.open-meteo.com`. |
| Settings disappeared | Site data was cleared or you are in a private window. Restore from a backup file. |

## License

Add a license of your choice (for example [MIT](https://choosealicense.com/licenses/mit/)) as a `LICENSE` file in the repository root.
