# Fix: Google Sync Dropdown Shows Another Manager's Gmail Account (NES-1492)

## Context
The Google Account dropdown in the Google Sheets Sync Dialog shows ALL Google integrations for a team, including other managers' Gmail accounts. A user should only see their own connected Google account(s) in the dropdown, not accounts connected by other team members.

## Root Cause
`useIntegrationQuery` fetches all integrations for a `teamId`, and the dropdown only filters by `__typename === 'IntegrationGoogle'` — it does not filter by the current user's ID.

## Approach: Frontend filter using `useAuth()`
Filter the integrations in the dropdown to only show those where `integration.user.id` matches the current user's ID. Using `useAuth()` (Firebase context) is the simplest approach — it's synchronous, already available, and avoids an extra GraphQL query.

This is consistent with existing patterns (e.g., `GoogleIntegrationDetails` compares user IDs).

## Files to Modify

### 1. `apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.tsx`
- Import `useAuth` from `../../../../libs/auth`
- Add `const { user } = useAuth()` in the component
- Create a filtered list of Google integrations belonging to the current user:
  ```ts
  const myGoogleIntegrations = integrationsData?.integrations?.filter(
    (integration) =>
      integration.__typename === 'IntegrationGoogle' &&
      integration.user?.id === user?.id
  )
  ```
- Use `myGoogleIntegrations` in both the dropdown `renderValue` (line ~1192) and the `MenuItem` map (line ~1204)

### 2. `apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.spec.tsx`
- Add mock for `useAuth` from `../../../../libs/auth` (pattern: `jest.mock('../../../../libs/auth', () => ({ useAuth: jest.fn() }))`)
- Configure `mockUseAuth.mockReturnValue({ user: { id: 'user1' } })` in `beforeEach`
- Update `defaultIntegrationsData` to include `user` field on the integration:
  ```ts
  {
    __typename: 'IntegrationGoogle',
    id: 'integration1',
    accountEmail: 'test@example.com',
    user: { __typename: 'AuthenticatedUser', id: 'user1' }
  }
  ```
- Update existing tests that reference the integration data to include the `user` field
- **New test: "only shows current user's Google integrations in dropdown"**
  - Mock integrations with two entries: one with `user.id: 'user1'` (current user) and one with `user.id: 'otherUser'`
  - Open the dropdown and assert only the current user's email appears
  - Assert the other user's email does NOT appear
- **New test: "shows no integrations when none belong to current user"**
  - Mock integrations with only other users' accounts
  - Assert the dropdown shows no account options

## Verification
1. Run existing tests:
   ```bash
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.spec.tsx'
   ```
2. Verify the dropdown only shows the current user's accounts
3. Verify the "Add New Google Account" button still works
4. Verify `renderValue` still displays the correct email for selected integration
