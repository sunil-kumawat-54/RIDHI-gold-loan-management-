# Backend Development Data

## Demo seed

The demo seed inserts fictional, deterministic data into the existing `vinsupgms` schema. It never drops tables, truncates data, or overwrites non-demo rows.

Run it only against the approved local development database:

```powershell
cd serverbackend
$env:DEMO_SEED = 'true'
$env:DEMO_DATABASE = 'vinsupgms'
npm run seed:demo
npm run seed:demo:verify
```

Demo login password: `Demo@12345`

Demo phone numbers:

- `9999000001` - `superadmin`
- `9999000002` - `admin`
- `9999000003` - `operator`
- `9999000004` - `viewer`

The frontend currently treats only `admin` as the elevated route role; `superadmin` is retained as a distinct database value for role-testing and currently follows the non-admin route branch.

The seed uses reserved IDs beginning at `900000`, fictional `demo.invalid` emails, and placeholder file paths under `demo/`. It is safe to rerun. The legacy `salarydetails` table has no declared unique key, so the seed removes only rows matching its reserved demo employee IDs/names before recreating those demo salary rows.

## Runtime note

Authentication and customer reads use the project's `mysql2` connection. Several older models still use the legacy `mysql` package and may fail against MySQL 8 accounts configured with `caching_sha2_password` (`ER_NOT_SUPPORTED_AUTH_MODE`). That is an existing backend driver compatibility issue outside the demo-data seed scope; it affects loan, gold-rate, balance-sheet, and related legacy endpoints until those models are migrated to `mysql2` or the local database authentication is configured compatibly.