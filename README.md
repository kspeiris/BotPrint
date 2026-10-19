# BotPrint — shared human and Selenium bot collection

This is a React/Vite research prototype for collecting anonymised behavioural event metadata from the same demo form in human and controlled Selenium sessions.

## Local app

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal. In the app, open **Settings & integrations**, paste the deployed Google Apps Script Web App URL (optional during UI-only local testing), and save it. For a shared dataset across independent browser profiles, use the Google Apps Script collector; browser localStorage is isolated per browser.

## Human data

Open **Human collection**, click **Start human collection**, then interact with the **Sample interaction form**. Use only fictional sample values and collect participant data only with approved consent.

## Generate coordinated Selenium sessions

1. Open **Bot generator**.
2. Set **Target test URL** to the local Vite URL (for example `http://localhost:5173`) or your deployed Netlify URL.
3. Keep **Bot count** at 5 and leave headless mode unchecked to watch the browsers live.
4. If remote shared collection is configured, generate the ZIP after saving the Apps Script URL in Settings.
5. Extract the ZIP and run `bash run.sh`. The first run creates a Python virtual environment and installs Selenium; later runs reuse it. Python 3 and Google Chrome are required.

The bot script opens five independent Chrome sessions concurrently, opens Human collection, starts tracking, and fills the same demo form using synthetic values, scrolls, selects a topic, toggles a demo checkbox, and submits the non-persistent demo form. The tracker stores event types and timing/interaction metadata, not typed field contents. The shared Apps Script URL is passed to each browser through a query parameter when configured, so browser-local storage isolation does not prevent events reaching the shared Sheet.

## Data and limitations

- Browser-local CSV/dashboard data is per browser profile. For one shared dataset across humans and bot browsers, configure Apps Script and verify rows in the Google Sheet.
- The Apps Script Web App URL is visible to clients; restrict the collector and sheet appropriately for the approved research setup. Do not put secrets in the URL.
- The bot workflow is designed for this BotPrint demo form, not arbitrary third-party websites. It does not bypass logins or security controls.
- Use a fresh Google Sheet with an empty `Events` tab when installing the included `google-apps-script/Code.gs`, because its header row follows the expanded schema.
- Run a small test first and verify event labels (`Human`/`Bot`), `botId`, `coordinationGroupId`, timestamps, and event counts before collecting study data.
