# CLASP Deployment Setup

This document describes the one-time setup steps required to enable automatic deployment of this Google Apps Script project via GitHub Actions.

---

## Step 1: Retrieve the Script ID

1. Open the Apps Script project in your browser: go to [script.google.com](https://script.google.com) and open the **EPB Team Meeting** project.
2. In the editor, click the gear icon (**Project Settings**) in the left sidebar.
3. Under **IDs**, copy the **Script ID** (it looks like `1BxN...abc`, a long alphanumeric string).
4. Open `.clasp.json` in this repository and replace `YOUR_SCRIPT_ID_HERE` with the Script ID you copied:

```json
{
  "scriptId": "1BxN...abc",
  "rootDir": "."
}
```

5. Commit and push this change to the `main` branch.

---

## Step 2: Generate the CLASPRC_JSON Secret

The GitHub Actions workflow authenticates with Google using the credentials stored in `~/.clasprc.json` after you run `clasp login` locally.

1. Install CLASP on your local machine (requires Node.js):
   ```bash
   npm install -g @google/clasp
   ```

2. Log in to CLASP, which will open a browser window for Google OAuth:
   ```bash
   clasp login
   ```
   Complete the OAuth flow and grant the requested permissions.

3. Copy the full contents of `~/.clasprc.json`:
   - On macOS/Linux: `cat ~/.clasprc.json`
   - On Windows: `type %USERPROFILE%\.clasprc.json`

   The file contains JSON similar to:
   ```json
   {
     "token": {
       "access_token": "...",
       "refresh_token": "...",
       ...
     },
     "oauth2ClientSettings": { ... }
   }
   ```

4. Store this JSON as a GitHub repository secret named `CLASPRC_JSON`:
   - Go to your repository on GitHub.
   - Click **Settings** > **Secrets and variables** > **Actions**.
   - Click **New repository secret**.
   - Name: `CLASPRC_JSON`
   - Value: paste the full JSON content from `~/.clasprc.json`.
   - Click **Add secret**.

---

## Step 3: Verify the Deployment

1. Make a small change to any `.gs` or `.html` file (e.g., add a comment to `code.gs`).
2. Commit and push to the `main` branch.
3. Go to the **Actions** tab of the repository on GitHub.
4. You should see the **Deploy to Google Apps Script** workflow running.
5. Once it completes successfully, open the Apps Script editor and confirm your changes appear.

If the workflow fails, check the action logs for authentication errors. A common cause is an expired `refresh_token` — if that happens, re-run `clasp login` locally, copy the updated `~/.clasprc.json`, and update the `CLASPRC_JSON` repository secret.

---

## Files Pushed to Apps Script

The `.claspignore` file controls which files are excluded from the push. Currently excluded:
- `slides.html` — reference design file, not part of the app
- `desktop.ini` — Windows folder metadata
- `.marathon.json` — Marathon project configuration
- `README.md` / `SETUP.md` — documentation
- `.github/` — CI/CD configuration
- `node_modules/` — local npm packages

All `.gs`, `.html`, and `.js` files not in the ignore list are pushed to Apps Script.
