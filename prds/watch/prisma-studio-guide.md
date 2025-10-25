# Prisma Studio Guide for Watch App

## Overview

Prisma Studio is a powerful visual database browser and editor that provides a graphical interface for exploring and modifying data in your databases. This guide covers how to use Prisma Studio with all databases used by the Watch app.

## Databases Used by Watch App

The Watch app interacts with four main databases through their respective APIs:

1. **Media Database** (`api-media`) - Video content, images, subtitles, translations
2. **Journeys Database** (`api-journeys`) - Journey content and user progress
3. **Languages Database** (`api-languages`) - Language definitions and translations
4. **Users Database** (`api-users`) - User accounts and authentication

## Prerequisites

### Development Environment
- Dev server must be running: `pnpm dlx nx run watch:serve`
- All database services must be available (started via dev server)
- Environment variables configured for database connections

### Environment Setup
Ensure your `.env` file or Doppler configuration includes:
```bash
PG_DATABASE_URL_MEDIA=postgresql://postgres:postgres@db:5432/media?schema=public
PG_DATABASE_URL_JOURNEYS=postgresql://postgres:postgres@db:5432/journeys?schema=public
PG_DATABASE_URL_LANGUAGES=postgresql://postgres:postgres@db:5432/languages?schema=public
PG_DATABASE_URL_USERS=postgresql://postgres:postgres@db:5432/users?schema=public
```

## Launching Prisma Studio

### Media Database (Primary for Watch)
```bash
pnpm dlx nx run prisma-media:prisma-studio
```
**Contains:**
- Videos, video variants, and editions
- Cloudflare images and R2 assets
- Subtitles and translations
- Bible citations and keywords
- Playlists and user roles

### Journeys Database
```bash
pnpm dlx nx run prisma-journeys:prisma-studio
```
**Contains:**
- Journey definitions and steps
- User journey progress
- Journey analytics and events
- Block configurations and content

### Languages Database
```bash
pnpm dlx nx run prisma-languages:prisma-studio
```
**Contains:**
- Language definitions and metadata
- Language names in multiple languages
- Country-language relationships
- Language slugs and routing

### Users Database
```bash
pnpm dlx nx run prisma-users:prisma-studio
```
**Contains:**
- User accounts and profiles
- Authentication data
- User roles and permissions

## Using Prisma Studio

### Interface Overview
1. **Tables Panel** (left): Lists all database tables
2. **Data View** (center): Shows table records with pagination
3. **Record Details** (right): Individual record editor
4. **Query Interface** (top): Direct SQL query execution

### Key Features

#### Data Exploration
- **Browse Tables**: Click any table to view its records
- **Search & Filter**: Use search boxes and filters to find specific data
- **Pagination**: Navigate through large datasets efficiently
- **Column Sorting**: Click column headers to sort data

#### Data Modification
- **Create Records**: Use "Add record" button
- **Edit Records**: Click on any cell to edit inline
- **Delete Records**: Select records and use delete option
- **Bulk Operations**: Select multiple records for batch operations

#### Relationships
- **Foreign Keys**: Click on foreign key values to navigate to related records
- **Reverse Relations**: View records that reference the current record

### Watch-Specific Use Cases

#### Finding Video Content
```sql
-- In Media Database
SELECT * FROM "Video" WHERE "slug" LIKE '%jesus%' LIMIT 10;
```

#### Checking User Data
```sql
-- In Users Database
SELECT id, email, "firstName", "lastName" FROM "User" LIMIT 20;
```

#### Language Content
```sql
-- In Languages Database
SELECT l.id, l.slug, ln.value as name
FROM "Language" l
JOIN "LanguageName" ln ON l.id = ln."languageId"
WHERE ln.primary = true;
```

#### Journey Analytics
```sql
-- In Journeys Database
SELECT j.title, COUNT(up.*) as user_count
FROM "Journey" j
LEFT JOIN "UserJourney" up ON j.id = up."journeyId"
GROUP BY j.id, j.title;
```

## Safety Considerations

### ⚠️ Critical Warnings

1. **Never Modify Production Data**
   - Prisma Studio connects to development databases only
   - Production access is restricted for safety

2. **Backup Before Changes**
   ```bash
   # Create database backup before making changes
   pg_dump -h db -U postgres media > media_backup.sql
   ```

3. **Test Data Only**
   - Use for development and testing purposes
   - Avoid using real user data for testing

4. **Cascade Effects**
   - Deleting records may affect related data
   - Always check foreign key relationships first

### Development Best Practices

1. **Use Test Data**: Populate databases with test data before exploration
2. **Document Changes**: Note any manual data changes for team awareness
3. **Version Control**: Database schema changes go through proper migration process
4. **Collaboration**: Coordinate with team when making structural changes

## Troubleshooting

### Connection Issues
```bash
# Check if dev server is running
ps aux | grep "nx run watch:serve"

# Verify database connectivity
pnpm dlx nx run prisma-media:prisma-generate

# Check environment variables
echo $PG_DATABASE_URL_MEDIA
```

### Common Errors
- **"Database connection failed"**: Ensure dev server is running
- **"Table not found"**: Run database migrations
- **"Permission denied"**: Check environment configuration

## Alternative Tools

### Database ERDs
Pre-generated Entity Relationship Diagrams are available:
- `libs/prisma/media/db/ERD.svg`
- `libs/prisma/journeys/db/ERD.svg`
- `libs/prisma/languages/db/ERD.svg`
- `libs/prisma/users/db/ERD.svg`

### Direct SQL Access
```bash
# Connect directly to PostgreSQL
psql -h db -U postgres -d media
```

## Related Documentation

- [Database Schema Documentation](https://docs.core.jesusfilm.org/docs/basics/backend/databases)
- [Watch App Architecture](prds/watch/extending-image-formats-for-watch.md)
- [Development Environment Setup](https://docs.core.jesusfilm.org/docs/getting-started/development-environment)

---

**Remember**: Prisma Studio is a development tool. Use it for exploration, debugging, and testing, but always follow proper data management practices for production systems.
