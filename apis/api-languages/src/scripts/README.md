# Scripts

This directory contains standalone scripts that can be executed to perform various tasks.

## Data Import Script

The data import script allows you to load database data from a SQL backup file. It supports both local files and remote URLs.

### Usage

```bash
nx run api-languages:data-import
```

### Environment Variables

The script requires the following environment variables:

- `PG_DATABASE_URL_LANGUAGES`: The connection string to the PostgreSQL database (required)
- `DB_SEED_PATH`: The path or URL to the SQL backup file's location (required)
  - Local file: Provide the directory path where the backup is located
  - Remote URL: Provide a base URL where the backup can be downloaded from

### Example

```bash
# For a local file
DB_SEED_PATH="/path/to/backup/directory" nx run api-languages:data-import

# For a remote URL
DB_SEED_PATH="https://example.com/backups" nx run api-languages:data-import
```

The script will:

1. Check if the required environment variables are set
2. Look for or download a SQL backup file named `languages-backup.sql.gz`
3. Decompress the file if needed
4. Execute the SQL commands using `psql`
5. Clean up temporary files

### Error Handling

The script includes error handling for various scenarios:

- Missing environment variables
- Failed download attempts
- File system operation failures
- Database connection issues

If any error occurs, the script will exit with a non-zero code and display an appropriate error message.

## WESS Import Scripts

Each WESS import maps one WESS QueryRunner query id (`QueryId=…`) to a Prisma upsert pass. They all share the same shape: fetch the WESS payload, normalize it, and upsert per row.

### Common environment variables (all WESS imports)

- `WESS_API_TOKEN` (required): WESS API token — **only** supplied via this env var. Sent as the HTTP `token` header.
- `PG_DATABASE_URL_LANGUAGES` (required): PostgreSQL URL for the languages database.

### Common notes

- Base URL and query ids are constants at the top of each script — edit there instead of adding env vars.
- After a successful run with at least one row, the script updates `ImportTimes` with its own `modelName` (see each script's section).
- Run order matters: import **languages** and **countries** before **country-languages**, since `CountryLanguage` rows have FKs to both.

### WESS Languages Import (QueryId 154)

Imports language rows into `Language` and `LanguageName` (English label, `languageId=529`).

```bash
nx run api-languages:wess-languages-import
```

- **Slug:** derived from WESS `slug` if set, otherwise display name, otherwise `id` — lowercased, spaces/commas/underscores and other non-alphanumeric runs become `-`, collisions get `-2`, `-3`, … . Set on **create**, and on **update** only when `slug` is currently null or empty (existing non-empty slugs are not overwritten).
- `ImportTimes.modelName`: `wessLanguageImport`.

### WESS Countries Import (QueryId 156)

Imports country rows into `Country` and (when a name is present) `CountryName` (English label, `languageId=529`).

```bash
nx run api-languages:wess-countries-import
```

- **Country id** is read from `COUNTRY_CODE`/`id` and uppercased.
- **Fields populated:** `name` (English `CountryName`, `languageId=529`) from `COUNTRY_NAME`; `population` from `COUNTRY_POPULATION`.
- WESS QueryId 156 does **not** return `latitude`, `longitude`, or `continentId`; those are populated by other pipelines and the import leaves them untouched.
- `AOA_NAME` is returned by WESS (e.g. `Namestan`, `Europe`) and is the country→region mapping, but is not currently imported — the schema has no region field yet.
- `ImportTimes.modelName`: `wessCountryImport`.

### WESS Country Languages Import (QueryId 155)

Imports country-language rows into `CountryLanguage` (composite unique on `languageId, countryId, suggested`).

```bash
nx run api-languages:wess-country-languages-import
```

- **Inputs from QueryId 155:** `LAN_NO` → `languageId`, `GEO_NO` → numeric country id, `SPEAKERS` → `speakers` (defaults to `0`). The query does **not** return `COUNTRY_CODE`/`PRIMARY`/`SUGGESTED`/`DISP_ORDER`/`DISPLAY_SPEAKERS`.
- **Country resolution:** the script first fetches QueryId 156 to build a `GEO_NO → COUNTRY_CODE` map, then translates each 155 row. Rows whose `GEO_NO` doesn't match any country in 156 are logged and skipped.
- **Deduplication:** WESS QueryId 155 returns ~439 duplicate `(LAN_NO, GEO_NO)` keys with differing `SPEAKERS` (competing population estimates). The import collapses them with **MAX speakers** before the upsert pass, making each run deterministic.
- **Write semantics:** writes only into the `suggested=false` slot of `(languageId, countryId, suggested)`. On **create**, sets `primary=false`, `suggested=false`, `speakers=…`. On **update**, sets only `speakers` — `primary`, `displaySpeakers`, and `order` are owned by other pipelines and never overwritten.
- **Sentinel preservation:** `speakers` values `>= 400_000_000` are sort-priority sentinels (`999_999_999`, `888_888_888`, `777_777_777`, etc.) that rank "official" languages above real populations in `getTopSpokenLanguages` and the arclight `_media-country-links` endpoint. The import will **never overwrite** an existing sentinel.
- **Zero-wipe protection:** WESS often returns `0` to mean "unknown". The import will **never replace** an existing positive value with `0`.
- Final-line summary breaks results down: `created`, `updated`, `unchanged`, `sentinel-preserved`, `nonzero-preserved`, `FK-skipped`, `GEO_NO-skipped`.
- Rows whose FKs are missing (unknown language id) are logged and skipped — they don't fail the run.
- `ImportTimes.modelName`: `wessCountryLanguageImport`.
