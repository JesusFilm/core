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

## WESS Languages Import Script

Imports language rows from the WESS Query API into the `Language` and
`LanguageName` tables.

### Usage

```bash
nx run api-languages:wess-languages-import
```

### Environment Variables

- `WESS_API_TOKEN` (required): API token sent as `token` header
- `WESS_API_BASE_URL` (optional): defaults to `https://www.mydigitalwork.space`
- `WESS_LANGUAGES_QUERY_ID` (optional): defaults to `154`
- `PG_DATABASE_URL_LANGUAGES` (required): languages database connection

### Notes

- Sends `GET /QueryRunner/rest/QueryAPI/GetData?QueryId=<id>`
- Expects an array JSON payload from WESS
- Upserts `Language` by `id` and updates `bcp47`, `iso3`, `slug`, `hasVideos`
- Upserts a self-name row in `LanguageName` when a row includes a name
