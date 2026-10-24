# Security and privacy audit

**Audit date:** 24 October 2026
**Scope:** repository tree, Git history available locally, Python API, Netlify Function, static GitHub Pages bundle, environment templates, and the canonical project PDF.

## Result

The current implementation does not contain a detected API key, private key, local filesystem path, or production contact record. Browser-facing responses now use explicit allowlists and no longer expose participant names, email addresses, raw source messages, or model evidence copied from an incoming notice.

The repository contains demo fixtures labelled `synthetic`; participant and source-message fixtures use stable IDs and operational metadata only. Contact-like values appear only in redaction tests and use the reserved `example.test` domain. Production data must never be copied into these fixtures or committed to this repository.

## Controls applied

- `.env` is ignored and is not tracked. API keys are read only by the local server or Netlify Function; they are never imported by the React bundle.
- `frontend/src/publicDemoData.js` is a curated public projection. It excludes direct contact fields, raw message text, sender addresses, and source URLs that are not needed by the browser demo.
- Python and Netlify dataset endpoints use field allowlists. Unknown datasets return no rows instead of falling back to the raw object.
- Participant communication previews return anonymous recipient records and counts, not names or addresses.
- Administrator source records expose an identifier, hash prefix, and character count; original notice text is withheld.
- Workflow responses expose only the validated change fields. Verbatim model evidence is used internally for validation and is not echoed to the client.
- Email addresses and phone numbers are minimized before an optional model call. The model cannot approve a booking or send a notification.
- Actions remain mock actions and are role-gated; the role selector is not production authentication.

## Verification performed

The following checks pass locally:

```text
python3 -m unittest discover -s tests -q       29 tests, OK
node --check netlify/functions/api.mjs          OK
npm run build:pages                             Vite production build, OK
git diff --check                                OK
```

The generated Pages bundle was scanned for Google/Backboard/GitHub token prefixes, private-key markers, local paths, synthetic contact addresses, and demo participant names. No matches were found. The locally available Git history was scanned with the same secret patterns; no matches were found.

The PDF was inspected for metadata, embedded scripts, form fields, local paths, email addresses, and key material. No sensitive value was detected.

## Residual limits

- This is a repository audit, not an audit of Netlify account settings, GitHub Actions secrets, browser storage, or third-party provider logs.
- A key that was exposed outside this repository must be rotated in its provider console even if it is absent from Git.
- The local server keeps the submitted notice in process memory so the demo can produce an audit hash and privacy report. Use a production retention policy before handling real messages.
- Free-text names, organizations, and other indirect identifiers are not generically redacted by the demo minimizer. Add a tested DLP layer before sending real operational notices to an external model.
- The static GitHub Pages build is deliberately deterministic and cannot call a secret-bearing model directly. Model calls belong in a server-side function.

Re-run the checks above after every data or deployment change. Treat any new real name, address, phone number, credential, internal URL, or source message as a release blocker.
