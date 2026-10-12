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
- Do not publish accusations against real people (the leaders and members on the site are real players).

## Government Access (encrypted)

- The documents are AES-GCM encrypted per clearance level (1–5 and OMNI), with each login wrapped by PBKDF2.
- Usernames and passwords are **case sensitive**.
- **The logins and the unencrypted documents are kept privately, outside this repo.** Only the encrypted vault, between `/*VAULT-START*/` and `/*VAULT-END*/` in `Government/index.html`, is published.
- Never commit passwords, credential lists or document text.
- To change a document or login, edit the private source and rebuild the vault with the private builder. Let browsers save the government login if the user wants that.
- Three failed logons lock that browser out of the site.

## Testing

- Test changes in a real browser (headless Chrome against a local server works) before pushing.
- Check for script errors, broken images and links, and both the desktop and phone layouts.
