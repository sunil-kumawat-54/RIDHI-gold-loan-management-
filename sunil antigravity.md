# Project Knowledge Base & Deployment Architecture
**Project Name:** Riddhi Gold Loan Management System (Vinsup GMS / SR Bank & Loan)  
**Author / Maintainer:** Sunil Kumawat & Rakesh  
**GitHub Repository:** [RIDHI-gold-loan-management-](https://github.com/sunil-kumawat-54/RIDHI-gold-loan-management-) (`main` branch)  

---

## 1. System Overview & Live URL Sitemap

| Component | Technology | Hosting Platform | Live URL / Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, MUI v5, Redux, SCSS | **Netlify** | `https://rakesh-project.netlify.app` |
| **Backend API** | Node.js, Express.js, MySQL2 | **Render** | `https://rakesh-riddhi.onrender.com` |
| **Database** | MySQL 8.4.8 | **Aiven Cloud** | `mysql-787893-rakesh-riddhi.h.aivencloud.com:16078` |

---

## 2. Component Configurations & Credentials

### A. Database (Aiven Cloud MySQL)
- **Service Name:** `mysql-787893`
- **Host:** `mysql-787893-rakesh-riddhi.h.aivencloud.com`
- **Port:** `16078`
- **Username:** `avnadmin`
- **Password:** Configured in Render Env Vars & Aiven Dashboard
- **Primary Database:** `vinsupgms`
- **Fallback Database:** `defaultdb`
- **SSL Requirement:** `REQUIRED` (`DB_SSL=true`)
- **IP Allowlist:** `0.0.0.0/0` (Open to all cloud providers including Render)
- **Database Schema Dump File:** `vinsupgms.sql` in workspace root.

### B. Backend Web Service (Render)
- **Service Name:** `Rakesh-riddhi`
- **Service ID:** `srv-db2is3ad0e5s73b81v80`
- **URL:** `https://rakesh-riddhi.onrender.com`
- **Root Directory:** `serverbackend`
- **Start Command:** `node server.js`
- **Render Environment Variables Configured:**
  - `PORT`: `8000`
  - `HOST`: `mysql-787893-rakesh-riddhi.h.aivencloud.com`
  - `DB_PORT`: `16078`
  - `USER`: `avnadmin`
  - `PASSWORD`: `<AIVEN_DB_PASSWORD>`
  - `DATABASE`: `vinsupgms`
  - `DB_SSL`: `true`

### C. Frontend Web Application (Netlify)
- **Site Name:** `rakesh-project`
- **Site ID:** `f58139e8-861e-4d8d-808a-62d248d06b3f`
- **URL:** `https://rakesh-project.netlify.app`
- **Root Directory:** `GMSfrontend`
- **Build Settings:**
  - Base directory: `GMSfrontend`
  - Build command: `npm run build`
  - Publish directory: `build` (relative to `GMSfrontend`)

---

## 3. Configuration Files Reference

### Root `netlify.toml`
```toml
[build]
  base = "GMSfrontend"
  publish = "build"
  command = "npm run build"

[build.environment]
  CI = "false"
  GENERATE_SOURCEMAP = "false"
  DISABLE_ESLINT_PLUGIN = "true"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### `GMSfrontend/public/_redirects`
```
/*    /index.html   200
```

### `GMSfrontend/package.json`
- `"name": "sr-bank-and-loan"`
- `"homepage": "/"`

### `GMSfrontend/src/config.js`
```javascript
const config = {
  basename: '',
  defaultPath: '/dashboard/default',
  fontFamily: `'Poppins', sans-serif`,
  borderRadius: 12,
  font: 'bold'
};

export default config;
```

### `serverbackend/server.js` Network Binding
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

## 4. Comprehensive Bug & Resolution Knowledge Base

### Bug 1: Netlify Build Name Error (`npm ERR! Invalid name: "SR Bank and Loan"`)
- **Symptom:** Netlify CI build failed instantly during `npm install`.
- **Root Cause:** `GMSfrontend/package.json` contained spaces and capital letters in `"name": "SR Bank and Loan"`.
- **Fix:** Changed package name to `"name": "sr-bank-and-loan"` in `GMSfrontend/package.json`.

### Bug 2: MySQL 8 Authentication Error (`ER_NOT_SUPPORTED_AUTH_MODE`)
- **Symptom:** Backend threw authentication error when connecting to Aiven MySQL 8.
- **Root Cause:** Legacy `mysql` package in Node does not support `caching_sha2_password` used in MySQL 8.
- **Fix:** Updated `serverbackend/package.json` and model imports to use `mysql2`.

### Bug 3: Connection Limit Exhaustion (`ER_CON_COUNT_ERROR: Too many connections`)
- **Symptom:** Backend crashed after 5-10 requests with database connection exhaustion.
- **Root Cause:** Over 70 model files in `serverbackend/app/models/` called `mysql.createConnection()` individually on every query.
- **Fix:** Refactored all model files to use a single shared connection pool exported from `serverbackend/db.js` with `connectionLimit: 5`.

### Bug 4: Aiven SQL Import Error (`sql_require_primary_key`)
- **Symptom:** SQL dump import into Aiven cloud failed on tables without primary keys.
- **Root Cause:** Aiven MySQL 8 enforces primary key requirement by default.
- **Fix:** Added `SET SESSION sql_require_primary_key = OFF;` at the beginning of `vinsupgms.sql`.

### Bug 5: Render 502 Bad Gateway Error
- **Symptom:** Navigating to Render URL returned `502 Bad Gateway`.
- **Root Cause:** `serverbackend/server.js` called `app.listen(PORT, HOSTNAME)` where `HOSTNAME` resolved to `localhost` (`127.0.0.1`), preventing Render's external reverse proxy from reaching the Node process.
- **Fix:** Changed `app.listen(PORT, HOSTNAME)` to `app.listen(PORT, '0.0.0.0')`.

### Bug 6: Netlify SPA Redirect Loop & 404 Site Not Found
- **Symptom:** Visiting `https://rakesh-project.netlify.app` showed Netlify 404 "Site not found".
- **Root Cause:** `GMSfrontend/public/index.html` contained a script `if (window.location.pathname === '/') window.location.replace('/vinsupgms');` which forced a redirect to unmapped `/vinsupgms`.
- **Fix:** Removed the redirect script from `public/index.html` and added `[[redirects]]` wildcard rules to `netlify.toml` and `_redirects`.

### Bug 7: React Router Dynamic Chunk Loading Error (`ChunkLoadError`)
- **Symptom:** Browser screen rendered blank white page on Netlify routes (`/pages/login/login3`). Console showed `https://rakesh-project.netlify.app/pages/login/static/js/... 404`.
- **Root Cause:** `package.json` had `"homepage": "."`, causing webpack publicPath to resolve dynamically loaded chunk JS files relative to the current sub-route.
- **Fix:** Changed `"homepage": "."` to `"homepage": "/"` in `GMSfrontend/package.json` and set `basename: ''` in `GMSfrontend/src/config.js`.

---

## 5. How to Run Locally & Test

### Run Local Backend (Port 8000)
```powershell
cd serverbackend
node server.js
```

### Run Local Frontend Development Server (Port 3000)
```powershell
cd GMSfrontend
npm start
```

### Run Fast Local Built Bundle Server (Port 3000)
```powershell
node serve_local.js
```

---

## 6. How to Verify Live Production Deployment

### Test Live Backend API from PowerShell:
```powershell
$body = '{"phone_no":"9999999999","password":"123"}'
try {
    Invoke-RestMethod -Uri "https://rakesh-riddhi.onrender.com/auth/login" -Method Post -ContentType "application/json" -Body $body
} catch {
    $_.ErrorDetails.Message
}
```
**Expected Live Response:** `{"message":"Invalid phone_no "}` (Confirms live Render backend is querying Aiven cloud DB).

### Test Live Frontend:
Open `https://rakesh-project.netlify.app` in any web browser.
