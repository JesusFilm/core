# E2E Cleanup Worker

This worker is responsible for cleaning up test data generated during end-to-end (e2e) testing in the journeys admin application.

## Overview

The e2e cleanup service automatically identifies and removes test data based on actual naming patterns used in the journeys-admin-e2e tests. It helps maintain a clean database by removing test journeys, teams, invitations, and related data that accumulate during automated testing.

## Features

- **Pattern-based Detection**: Identifies test data by actual patterns from journeys-admin-e2e tests
- **Time-based Filtering**: Only removes data older than a specified time threshold (default: 24 hours)
- **Dry Run Mode**: Preview what would be deleted without actually removing data
- **Comprehensive Cleanup**: Removes journeys, teams, invitations, and all related data (blocks, events, user associations, etc.)
- **Foreign Key Aware**: Deletes data in the correct order to respect database constraints

## Detection Patterns

The service identifies test data by looking for these actual patterns used in e2e tests:

### Journey Patterns (case-insensitive):

- `First journey` (+ random numbers)
- `Second journey` (+ random numbers)
- `Renamed journey` (+ random numbers)
- `Test Journey` (generic fallback)
- `E2E`
- `Automation`
- `Playwright`

### Team Patterns (case-insensitive):

- `Automation TeamName` (+ timestamp patterns)
- `Renamed Team` (+ random numbers)
- `Playwright Test Team` (generic fallback)
- `Test Team` (generic fallback)
- `E2E`
- `Automation`

### Email Patterns:

- `playwright*@example.com` (any email containing "playwright")
- `*@example.com` (any email from example.com domain)

## Usage

### Manual Execution

You can manually trigger the cleanup job using the CLI:

```bash
# Basic cleanup (removes test data older than 24 hours)
nx run api-journeys-modern:worker e2e-cleanup

# Dry run to see what would be deleted
nx run api-journeys-modern:worker e2e-cleanup --dry-run

# Cleanup data older than 48 hours
nx run api-journeys-modern:worker e2e-cleanup --hours 48

# Dry run for data older than 12 hours
nx run api-journeys-modern:worker e2e-cleanup --dry-run --hours 12
```

### CLI Options

- `--dry-run`: Preview mode - shows what would be deleted without actually removing data
- `--hours <number>`: Specify the age threshold in hours (default: 24)

## Data Cleanup Order

The service deletes data in this order to respect foreign key constraints:

### For Journeys:

1. UserJourney associations
2. JourneyVisitor records
3. Event records
4. Block records
5. UserInvite records (journey invitations)
6. Journey records

### For Teams:

1. UserTeam associations
2. UserTeamInvite records
3. Team-owned journeys (following the journey cleanup order)
4. Team records

### For Invitations:

1. UserTeamInvite records (team invitations with test email patterns)
2. UserInvite records (journey invitations with test email patterns)

## Safety Features

- **Time Threshold**: Only removes data older than the specified threshold
- **Pattern Matching**: Only targets data that matches actual e2e test patterns
- **Dry Run**: Allows preview before actual deletion
- **Logging**: Comprehensive logging of all operations
- **Error Handling**: Graceful error handling with detailed logging

## Example Output

### Dry Run Mode

```
Running in DRY RUN mode - no data will be deleted
Will clean up test data older than 24 hours
Found test data to clean up: journeysFound=3, teamsFound=1, teamInvitesFound=2, journeyInvitesFound=1
DRY RUN: Would delete the following test data:
Journey: First journey123 (journey-123) - Created: 2024-01-01T10:00:00.000Z
Journey: Second journey456 (journey-456) - Created: 2024-01-01T11:00:00.000Z
Journey: Renamed journey789 (journey-789) - Created: 2024-01-01T12:00:00.000Z
Team: Automation TeamName240124-143022123 (team-123) - Created: 2024-01-01T09:00:00.000Z
Team Invite: playwright123@example.com (invite-123) - Created: 2024-01-01T10:30:00.000Z
Team Invite: playwright456@example.com (invite-456) - Created: 2024-01-01T11:30:00.000Z
Journey Invite: playwright789@example.com (jinvite-789) - Updated: 2024-01-01T12:30:00.000Z
```

### Actual Cleanup

```
Will clean up test data older than 24 hours
Found test data to clean up: journeysFound=3, teamsFound=1, teamInvitesFound=2, journeyInvitesFound=1
Deleted test journeys: deletedJourneys=3
Deleted test teams: deletedTeams=1
Deleted test team invitations: deletedTeamInvites=2
Deleted test journey invitations: deletedJourneyInvites=1
E2E cleanup completed successfully
```

## Integration with Testing

This cleanup job is designed to work seamlessly with your e2e testing pipeline. Consider running it:

- After each test suite completion
- As part of nightly maintenance
- Before starting fresh test runs
- When database storage is getting full

The patterns are specifically based on the actual test data created by:

- `apps/journeys-admin-e2e/src/utils/testData.json`
- `apps/journeys-admin-e2e/src/pages/journey-page.ts`
- `apps/journeys-admin-e2e/src/pages/teams-page.ts`
- `apps/journeys-admin-e2e/src/pages/register-Page.ts`

## Error Handling

The service includes comprehensive error handling:

- Database connection issues are caught and logged
- Foreign key constraint violations are prevented by proper deletion order
- Partial failures are logged with detailed error information
- Failed jobs are retained for debugging (24 hours by default)

## Monitoring

The service provides detailed logging for monitoring:

- Start/completion timestamps
- Count of items found and deleted by category
- Dry run previews
- Error details and stack traces
- Job execution metrics
