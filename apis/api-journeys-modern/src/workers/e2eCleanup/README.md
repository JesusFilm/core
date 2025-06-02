# E2E Cleanup Worker

This worker is responsible for cleaning up test data generated during end-to-end (e2e) testing in the journeys admin application.

## Overview

The e2e cleanup service automatically identifies and removes test data based on actual naming patterns used in the journeys-admin-e2e tests AND journeys created by users with playwright email addresses. It helps maintain a clean database by removing test journeys, teams, invitations, and related data that accumulate during automated testing.

## Features

- **Pattern-based Detection**: Identifies test data by actual patterns from journeys-admin-e2e tests
- **User Email Filtering**: Identifies journeys owned by users with playwright email addresses
- **Performance Optimized**: Caches user email lookups to minimize API calls
- **Time-based Filtering**: Only removes data older than a specified time threshold (default: 24 hours)
- **Dry Run Mode**: Preview what would be deleted without actually removing data
- **Conditional Logging**: Detailed logs during dry runs, quiet operation during actual cleanup
- **Comprehensive Cleanup**: Removes journeys, teams, invitations, and all related data (blocks, events, user associations, etc.)
- **Foreign Key Aware**: Deletes data in the correct order to respect database constraints
- **Atomic Operations**: All cleanup operations are wrapped in a single database transaction for consistency

## Detection Patterns

The service identifies test data by looking for these actual patterns used in e2e tests AND by checking journey ownership:

### Journey Detection (OR logic):

1. **Title Patterns** (case-insensitive):

   - `First journey` (+ random numbers)
   - `Second journey` (+ random numbers)
   - `Renamed journey` (+ random numbers)

2. **Owner Email Patterns**:
   - Journeys owned by users with emails containing `playwright` AND `@example.com`
   - Example: `playwright123@example.com`, `playwrightuser@example.com`

### Team Patterns (case-insensitive):

- `Automation TeamName` (+ timestamp patterns)
- `Renamed Team` (+ random numbers)

### Email Patterns (invitations):

- `playwright*@example.com` (any email containing "playwright")
- `*@example.com` (any email from example.com domain)

## Performance Optimizations

### User Email Caching

The service implements intelligent caching for user email lookups:

- **Single API Call Per User**: Each unique user ID is only queried once
- **Cache All Results**: Both positive (playwright user) and negative (regular user) results are cached
- **Error Caching**: Failed lookups are cached to prevent repeated failed requests
- **Memory Efficient**: Only stores boolean results, not full user objects

**Example**: If a playwright user owns 10 journeys, only 1 API call is made instead of 10.

### Conditional Logging

- **Dry Run Mode**: Detailed logging including filtering statistics, cache metrics, and item lists
- **Production Mode**: Quiet operation with only essential logs (start, completion, deletion counts, errors)

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

The service deletes data within a single database transaction to ensure atomicity. All operations either succeed completely or are rolled back entirely. The deletion order respects foreign key constraints:

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

**Transaction Benefits:**

- **Atomicity**: All cleanup operations succeed or fail together
- **Consistency**: Database remains in a consistent state even if errors occur
- **Rollback Safety**: Partial cleanup is prevented - if any operation fails, all changes are rolled back

## Safety Features

- **Time Threshold**: Only removes data older than the specified threshold
- **Dual Pattern Matching**: Targets data matching test patterns OR owned by playwright users
- **User Service Integration**: Safely queries user emails via GraphQL with error handling
- **Dry Run**: Allows preview before actual deletion
- **Comprehensive Logging**: Detailed logging in dry run mode, essential logging in production
- **Error Handling**: Graceful error handling with detailed logging
- **Performance Monitoring**: Cache effectiveness metrics in dry run mode
- **Transaction Safety**: All cleanup operations are atomic - either all succeed or all are rolled back

## Example Output

### Dry Run Mode (Verbose)

```
Running in DRY RUN mode - no data will be deleted
Will clean up test data older than 24 hours

Journey filtering completed:
  totalCandidates=5,
  journeysByTitle=2,
  journeysByPlaywrightUser=1,
  totalSelected=3,
  uniqueUsersChecked=3,
  playwrightUsersFound=1

Found test data to clean up: journeysFound=3, teamsFound=1, teamInvitesFound=2, journeyInvitesFound=1

DRY RUN: Would delete the following test data:
Journey: First journey123 (journey-123) - Created: 2024-01-01T10:00:00.000Z
Journey: Second journey456 (journey-456) - Created: 2024-01-01T11:00:00.000Z
Journey: My personal journey (journey-789) - Created: 2024-01-01T12:00:00.000Z [Owned by playwright user]
Team: Automation TeamName240124-143022123 (team-123) - Created: 2024-01-01T09:00:00.000Z
Team Invite: playwright123@example.com (invite-123) - Created: 2024-01-01T10:30:00.000Z
Team Invite: playwright456@example.com (invite-456) - Created: 2024-01-01T11:30:00.000Z
Journey Invite: playwright789@example.com (jinvite-789) - Updated: 2024-01-01T12:30:00.000Z
```

### Actual Cleanup (Quiet)

```
Starting e2e cleanup: olderThanHours=24, dryRun=false
Deleted test journeys: deletedJourneys=3
Deleted test teams: deletedTeams=1
Deleted test team invitations: deletedTeamInvites=2
Deleted test journey invitations: deletedJourneyInvites=1
E2E cleanup completed successfully
```

## Architecture

### Dependencies

- **Apollo Client**: For GraphQL queries to user service
- **Prisma**: For database operations
- **BullMQ**: For job queue management
- **Pino**: For structured logging

### External Integrations

- **User Service**: Queries user email addresses via GraphQL
- **Gateway**: Routes user queries through the API gateway
- **Database**: Direct Prisma queries for data manipulation

### Error Handling

The service includes comprehensive error handling:

- **User Service Failures**: Failed user email lookups are cached and logged as warnings
- **Database Issues**: Connection and query errors are caught and logged
- **Foreign Key Constraints**: Prevented by proper deletion order
- **Transaction Failures**: Any database error during cleanup causes complete rollback
- **Partial Failures**: Individual user lookup failures don't stop the cleanup process

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

And now also cleans up journeys created by playwright test users, regardless of their titles.

## Monitoring

The service provides detailed logging for monitoring:

### Dry Run Mode:

- Journey filtering statistics (title matches vs playwright user matches)
- Cache effectiveness metrics (API calls saved)
- Complete preview of items to be deleted with reasons
- User lookup success/failure rates

### Production Mode:

- Start/completion timestamps
- Count of items deleted by category
- Error details and stack traces
- Job execution metrics

## Configuration

The service requires these environment variables:

- `GATEWAY_URL`: URL for the GraphQL gateway
- `INTEROP_TOKEN`: Authentication token for service-to-service communication
- `SERVICE_VERSION`: Service version for request headers

## Testing

The service includes comprehensive test coverage:

- **Title Pattern Matching**: Validates journeys are selected by title patterns
- **User Email Filtering**: Tests journey selection by playwright user ownership
- **Caching Logic**: Ensures user email lookups are cached effectively
- **Error Handling**: Tests graceful degradation when user service is unavailable
- **Conditional Logging**: Validates different logging behavior in dry run vs production
- **Mock Integrations**: Full Apollo Client and Prisma mocking
