# InterPhyr.net: working rules

InterPhyr.net is a satirical Windows 98 / Internet Explorer-style website about a fictional federation (the Phyrrian Astral Federation, PAF), hosted on GitHub Pages at https://thesylvster.github.io/InterPhyr/. Each page is static HTML with inline CSS and JS. Shared files are `toolbar.js`, `maintenance.js` and `css/98.css`.

This file holds the owner's standing instructions. Follow them on every change. This repo is **public**, so never put secrets in this file or anywhere else in the repo.

## Every push

1. **Pull first** (`git pull --ff-only`). The site is edited from more than one PC.
2. **Bump the version** on the main page (`index.html`: `<p class="small">InterPhyr Version: ...</p>`) in the same commit.
   - Public versions use three parts: V1.0.0, then V1.0.1, V1.0.2, and so on.
   - IT-only previews have been labelled V1.x.DEV, with the owner choosing the label.
   - **Do not bump** for a push that only flips the maintenance switch.
3. **Add an entry to Update Logs** (`UpdateLogs/index.html`, newest first) describing the change. Public-facing changes can also go in the version history on `About/index.html`.
4. **Check the staged diff for secrets** before committing: no passwords, logins or unencrypted classified text (see below).
5. **Verify the deploy**: after pushing, poll the live site (add a `?cb=<random>` query to get past the CDN cache) until the change is confirmed live, then tell the owner.

## Maintenance mode

- `maintenance.js` holds `window.INTERPHYR_MAINTENANCE = 0;`. Set it to 1 for "This website is under maintenance" on every page after dial-up, and 0 for normal.
- The secret IT admin login on the registration screen still gets through.
- Switching it on or off is not an update, so the version doesn't change.
- GitHub Pages caches files for about 10 minutes.

## Emergency switch (public FEDCON)

- `emergency.js` holds `window.INTERPHYR_FEDCON = 5;`, the public FEDCON level for everyone on every page.
  - **0:** every page shows the ZapadTelecom Emergency Notice (Federation collapse) instead of the site. On the main page, visitors register and dial up first, then the connection fails and the notice appears. The ZapTel_IT admin gets a "Return to full site" button.
  - **1:** every visitor gets the full-screen Nuclear Alert once they have registered and connected, with the EAS sound. After Acknowledge it stays away until the browser is closed (session cookie `interphyr_fedcon1_ack`).
  - **2 to 5:** normal.
- The public level is separate from the Government page's FEDCON, which lives in the encrypted documents. When the level changes, set both.
- For quick switching, prebuilt vaults for every level are kept privately next to the private builder, with a `use-fedcon.pl <level>` script that sets both the vault and the public switch. Rebuild them all when the documents or logins change.
- The Nuclear Alert's markup, styles and EAS sound live in `emergency.js` (`window.interphyrEmergency.nuclear()`), and the Government page uses the same alert.
- A FEDCON 0 preview on the Government page (`SETFEDCON0`, then Enter on the blue screen) shows the Emergency Notice in that browser only, until "Return to full site" is pressed.

## Content and style rules

- Put **©** after every mention of ZapadTelecom and its products (ZapadTelecom©, Interweb Surfer©, ZapadMail©, ZapadTV©).
- ZapadTelecom© is the internet provider for all the member nations. InterPhyr is just a website hosted on it.
- **No hot-linked assets.** Every image, sound, font and stylesheet must be downloaded into the repo (`images/`, `sounds/`, `css/`). Download Discord CDN links straight away, because they expire.
- News stories (`News/index.html`) carry the byline "People's Information Ministry — Edited & Approved — dd.mm.yyyy" with in-world dates in 1996–1998. Show one lead sentence, with the rest behind "Read more". Newest stories go first.
- **Important News shows at most two stories.** When a new one is marked `news-important`, un-mark the oldest one.
- Assessments on the Outside Relations pages come from "the Ministry of Outside Relations".
- Swissland is blocked from the whole network. The block catches misspellings and variations.
- Fullscreen is requested only when the site is freshly opened, and is kept across pages through the soft-navigation page swaps.
- Every sub-page has a fail-closed login gate. Typed addresses, bookmarks and refreshes must go back through registration and dial-up.
- Keep the Windows 98 look: use 98.css components and the pixel font, and match the existing pages' fonts and styles.
- The ZapadTelecom© screensaver (in `toolbar.js`) starts after 3 minutes without input; `window.interphyrScreensaver.start()` shows it straight away.
- Do not publish accusations against real people (the leaders and members on the site are real players).

## Government Access (encrypted)

- The documents are AES-GCM encrypted per clearance level (1–5 and OMNI), with each login wrapped by PBKDF2.
- Usernames and passwords are **case sensitive**.
- **The logins and the unencrypted documents are kept privately, outside this repo.** Only the encrypted vault, between `/*VAULT-START*/` and `/*VAULT-END*/` in `Government/index.html`, is published.
- Never commit passwords, credential lists or document text.
- To change a document or login, edit the private source and rebuild the vault with the private builder. Let browsers save the government login if the user wants that.
- Three failed logons lock that browser out of the site.
- **FEDCON** (the alert level) is stored in the encrypted content. After logging on, `window.FEDCON` drives the bar, the alert window and the emergency popups (FEDCON 2, 1 and 0 each have their own). To preview a level, type `SETFEDCON0` to `SETFEDCON5` (or `FEDCON = 1`) in the browser console, or type the code anywhere on the Government page. `SETFEDCONREAL` (or `FEDCON = null`) goes back. This works after a Government logon, and for the ZapTel_IT admin even without one (then only the popups show). A preview only changes what that browser shows.
- **FEDCON history** is also in the encrypted content: `fedcon-past` lines (level, date, reason) under the `fedcon-data` line, newest first, shown under History... in the FEDCON window. When the level changes, the old current level moves down into the history.

## Testing

- Test changes in a real browser (headless Chrome against a local server works) before pushing.
- **Government logon tests:** the owner permits Claude to use **only the IT login** (the "IT" entry of the private credentials file) for automated Government logons, and only against a local test server, to check a rebuilt vault. Never use any other login. Never print, log, save or commit the IT login; feed it straight from the private file into the test, and delete the test file afterwards.
- Check for script errors, broken images and links, and both the desktop and phone layouts.

## InterPhyr Modern (/Modern/)

- A modern "liquid glass" version of the site at `/Modern/`. It is open to anyone, but **nothing on the classic site may link to it**, and its pages carry `<meta name="robots" content="noindex, nofollow">`.
- It has no content of its own: `Modern/modern.js` reads the classic pages (`index.html`, `News/index.html`, ...) and restyles them. Edit content on the classic pages only.
- Pages so far: Home and News. To add one, create `Modern/<Page>/index.html` like the existing ones, add the path to `MODERN_PAGES` and `NAV` in `modern.js`, and write its renderer.
- Styles live in `Modern/modern.css`, scoped to `body.modern`.
- Moving between Modern pages happens in place (no page load): `navigate()` in `modern.js` slides the menu lens and animates the panels. New pages need a title in `TITLES` and a branch in `render()`. Use the system font (no downloads) and keep a non-blur fallback for browsers without `backdrop-filter`.
- Maintenance mode, the lockout and the emergency switch apply here too. Modern pages set `window.INTERPHYR_NO_DIALUP=true` before `emergency.js`, so the FEDCON 1 alert shows without a dial-up.
- **Motion rule (owner's request): everything must feel smooth, natural and modern. Nothing may jump or "teleport".**
  - Buttons and links that go to a place on the same page (like "Member nations") glide there smoothly (`glideTo()` in `modern.js`) and stop just below the top bar. Every new travel button must use this.
  - Changing page animates (`navigate()`): the menu lens slides and the panels fade out and rise in.
  - Anything that opens, closes or moves should animate too. Visitors who turn on "reduce motion" get instant changes instead.
- **Slider rule (owner's request): every slider or selection highlight (menu bars, the phone menu, tabs, toggles, segmented controls) must be a CLEAR liquid-glass lens, built with `makeLens()` in `modern.js`.** Clear means no frosted or white fill. It has a bright rim, a faint rainbow fringe, a soft shadow, and the content under it is refracted (bent at the rim, magnified while moving). It always slides to the new item like liquid and never snaps.
