# NOTE.md — TTS-package hardening checklist (next steps)

This note captures the **high-impact fixes** to make this repo reviewer-ready for a senior backend evaluation (AURENA / Christian).  
Goal: **security hygiene, reliability, and developer experience** without over-engineering.

---

## 0) Context / positioning (keep)
This repo is intentionally **backend-focused**. The optional React/Vite dashboard is a convenience UI and should not be required to understand the service.

---

## 1) Security & configuration hygiene (must-do)

### 1.1 Fail-fast env validation (startup)
**Problem:** Service starts even if `SPEECH_KEY` / `SPEECH_REGION` are missing → confusing runtime failures.  
**Fix:** Validate required env vars at startup and exit with a clear message.

**Required env vars (backend):**
- `SPEECH_KEY`
- `SPEECH_REGION`
- `PORT` (optional default, but document it)
- `TRIGGER_WORD` (optional default)

**Action:**
- Add a small `src/config/env.js` (or similar) that:
  - reads env vars
  - validates required ones
  - exports a typed config object

### 1.2 Do not dump secrets
- Keep `.env.example` in repo.
- Ensure `.env` is in `.gitignore` (verify).
- Never print `SPEECH_KEY` in logs.

---

## 2) Port & API base URL consistency (must-do)

### 2.1 Fix backend port defaults
**Problem:** Backend defaults to `3000`, `.env.example` uses `4753`, frontend uses `4040`.  
**Fix:** Choose one default and document it.

**Recommendation:**
- Backend default: `PORT=4753` (matches `.env.example`)
- Document: `http://localhost:4753`

### 2.2 Fix frontend API base URL
**Problem:** `frontend/src/components/Dashboard.jsx` hardcodes `API_Base = 'http://localhost:4040'`.  
**Fix:** Use `VITE_API_BASE_URL` and document it.

**Action:**
- Add `frontend/.env.example`:
  - `VITE_API_BASE_URL=http://localhost:4753`
- Update Dashboard to read `import.meta.env.VITE_API_BASE_URL || 'http://localhost:4753'`

---

## 3) Correctness fixes (must-do)

### 3.1 `ttsController.js` missing import
**Problem:** `getVoices()` calls `getAvailableVoices()` but it is not imported in `ttsController.js`.  
**Fix:** Import it from `ttsServiceAzureAI.js` or remove `getVoices()` if unused.

### 3.2 Ensure API endpoints match README
**Problem:** README documents `/tts` only; service also exposes `/pause`, `/resume`, `/stop-tts`, `/voices`, `/extract-text`.  
**Fix:** Update README to list all endpoints + example curl commands.

---

## 4) Queue robustness (high value, low effort)

### 4.1 Add max queue length
**Problem:** Unbounded in-memory queue can grow indefinitely.  
**Fix:** Add `MAX_QUEUE_LENGTH` (env or constant). Decide policy:
- reject new items when full, or
- drop oldest, or
- drop newest

**Recommendation:** Reject new items with a log entry (predictable).

### 4.2 Add per-item retry with backoff
**Problem:** A transient Azure error can drop
