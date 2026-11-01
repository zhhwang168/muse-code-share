# Muse Code Share

**Live site: [Muse Code Share](https://muse-code-share.zhhwang168-cb4.workers.dev/)**

A free community invite-code sharing site for Muse, with English, Simplified Chinese, and Japanese interfaces. Share a code, find one in submission order, and click to copy.

## Features

- **Three languages:** English, Chinese, and Japanese, with browser-language detection and a saved language preference.
- **First shared, first listed:** Codes appear in submission order.
- **Individual 24-hour listings:** Each code has its own submission timestamp, countdown, and expiration time. Newer codes remain listed when older ones expire.
- **Click to copy:** Copying does not redeem a code or consume an invitation.
- **Owner removal:** Contributors can remove their codes early using the same browser they used to submit them.
- **Shared storage:** Cloudflare D1 stores codes for all visitors.
- **Related project:** [AI Style Guide](https://ai-style-guild.pages.dev/), an AI-powered personal style guide covering hair, eyewear, outfits, and colors.
- **Tutorial section:** Ready for a Muse signup and usage video.

This is an independent community project, not affiliated with, endorsed by, or partnered with Meta or Muse. Code availability, eligibility, and rewards depend on official Muse rules. This site cannot verify remaining invitation uses.

## Listing time versus redemption time

The site's **24-hour listing period** starts when a code is submitted here. The **48-hour redemption window** shown on the Muse invitation screen starts when a new user joins Muse. These are separate timers. Please redeem promptly and check the current rules inside Muse.

## Deploy to Cloudflare

This repository is designed for **Cloudflare Workers with static assets and a D1 database**. It needs a backend; uploading only the HTML files to a static site will not enable code sharing.

1. Create a D1 database named `muse-codes` in the Cloudflare dashboard.
2. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.jsonc` with your database ID and commit the change. The database ID is a resource identifier, not an API secret.
3. Open the database's SQL console and run the contents of `migrations/0001_init.sql` once to create the tables. Alternatively, after authenticating Wrangler locally, run `npm run db:remote`.
4. Create a Worker connected to this GitHub repository. Use `muse-code-share` as the Worker name to match `wrangler.jsonc`.
5. Use the repository root as the project root. Leave the build command empty and set the deploy command to `npm run deploy`. Cloudflare installs the package dependencies automatically.
6. Open the `workers.dev` address returned after deployment. You can also connect a custom domain.

After connecting the production branch, future pushes automatically deploy updates. If you move this project into a subdirectory of another repository, adjust the Cloudflare project root accordingly. AI Style Guide is a separate site and does not need changes.

Cloudflare documentation:

- [Workers Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Build and deployment configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Getting started with D1](https://developers.cloudflare.com/d1/get-started/)

## Local preview

Install Node.js 22 or later.

On Windows, double-click **`start-preview.bat`**. It installs missing dependencies, prepares the local database, starts the preview, and opens your browser at `http://127.0.0.1:8787/`. If the preview is already running, it opens the existing instance. Keep the terminal open while testing; close it or press Ctrl+C to stop the server. The companion `start-preview.ps1` must stay beside the BAT file.

To start manually:

```sh
npm install
npm run db:local
npm run dev
```

Local and production databases are separate. Preview data is not automatically uploaded to Cloudflare.

Run the backend tests:

```sh
npm test
```

## Customize content

- **Tutorial video:** Set `tutorialUrl` in `public/config.js` to the video's full HTTPS URL. An empty URL displays the coming-soon state.
- **Video descriptions:** Edit the `en`, `zh`, and `ja` entries in `tutorialDescription` in the same file.
- **Translations:** Edit `public/i18n.js`. Page text, dates, countdowns, copy feedback, submission results, error messages, and validation prompts follow the selected language.
- **Page layout and styles:** Edit `public/index.html` and `public/style.css`.

## Timing, privacy, and limits

The server determines submission and expiration timestamps. The API returns only unexpired codes, ordered by submission time. The browser refreshes the list every 30 seconds and updates countdowns and removes expired entries every 15 seconds. An hourly scheduled task deletes expired database records without affecting newer codes. Expired codes are excluded by the API even before physical cleanup runs.

Submitting an already active code does not extend its listing. A code submitted again after expiration becomes a new listing. Copying a code does not remove it or indicate successful redemption.

Each IP address can submit at most one code per minute. The rate-limit identifier changes at the UTC day boundary. The app stores a daily IP digest for rate limiting rather than the raw IP address and periodically cleans up those records.

After submission, the browser stores a private removal token locally. The server stores only its hash and never includes it in the public code list. Clearing browser storage or switching devices loses early-removal access; automatic expiration still applies.

The app includes basic rate limiting. It does not include an administrator moderation dashboard, Turnstile integration, or official Muse code verification. Additional abuse protection can be added if needed.

## License

[MIT License](LICENSE) — Copyright (c) 2026 **zhhwang168**.

You may use, modify, distribute, and use the code commercially, provided the copyright and license notices are retained. The license does not grant rights to third-party trademarks or services or replace official Muse terms. Dependencies remain subject to their own licenses.
