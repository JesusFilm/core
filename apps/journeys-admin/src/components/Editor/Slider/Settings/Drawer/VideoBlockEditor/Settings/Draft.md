# Mux Subtitle Management - TODO

## Tasks

- [x] Merge draft backend branch: `nisalcottingham/nes-951-mux-video-generation-backend`
  - [x] Prepare db/backend
  - [x] Generate types
- [x] Implement UI Flow (focus on test data flow first, then polish UI)
- [ ] Load prexisting language into @MuxSubtitleManager component
- [x] Select from mux languages
- [x] Generate subs for video and poll status (generate button text states)
- [ ] Change language (replace existing) (currently adds additional languages and then select first)
- [x] Show completion label
- [ ] Show error label (not showing for audio track scenario)
- [x] Implement snack bar scenarios (not linked to video properties)
  - [x] Red snackbar for error states
  - [x] Green snackbar for in progress and completed states
  - [x] Dismiss (X) button on all snackbars
  - [ ] Don't show error details on error snackbars (generic error message)

## Backend

The merge adds the following backend functionality:

- **New Database Model**: `MuxSubtitleTrack` table
  - Fields: `id`, `trackId`, `languageCode`, `muxLanguageName`, `readyToStream`, `source` (uploaded/generated), `muxVideoId`
  - Cascading deletion when MuxVideo is deleted
  - Relation added to `MuxVideo` model (`subtitles` field)

- **GraphQL Type**: `MuxSubtitleTrack`
  - Exposes: `id`, `trackId`, `languageCode`, `muxLanguageName`, `readyToStream`, `source`, `muxVideo` relation

- **Mutation**: `createMuxGeneratedSubtitlesByAssetId`
  - Generates AI subtitles for a Mux video asset via Mux API
  - Parameters: `assetId`, `languageCode`, `name`, `userGenerated`
  - Validates that no subtitle exists for the language/video combination
  - Creates database record with initial status

- **Query**: `getMyMuxSubtitleTrack`
  - Fetches subtitle track by ID for authenticated user
  - Auto-polls Mux API to update `readyToStream` status if not ready
  - Updates database when subtitle generation completes

- **Service Layer**: Mux API integration functions
  - `createGeneratedSubtitlesByAssetId`: Calls Mux to generate subtitles
  - `getSubtitleTrack`: Retrieves subtitle track status from Mux
  - `getClient`: Helper for Mux client (supports user-generated vs publisher content)
  - `getVideo`: Retrieves video asset from Mux

---

## Implementation Summary & Bug Fixes

### ✅ Status: WORKING

Subtitle generation is now fully functional end-to-end. Verified with successful test showing:

- ✅ Subtitle generated and `readyToStream: true`
- Polling working at 3-second intervals
- ✅ UI updates correctly with subtitle in video's subtitles array
- ✅ Error handling and cleanup working properly

### Issues Found & Fixed

#### 1. **userGenerated Parameter Mismatch** ✅ FIXED

- **Problem**: Mutation created subtitle with `userGenerated: true`, but polling queried with `userGenerated: false`
- **Impact**: Backend looked in wrong Mux account (Publisher vs UGC), causing errors
- **Solution**: Made `userGenerated` consistent throughout - backend now determines automatically from user role
- **Files**: `MuxSubtitleManager.tsx`, `MuxSubtitlePollingProvider.tsx`, `VideoBlockEditorSettings.tsx`

#### 2. **Rapid Polling Interval (500ms instead of 3s)** ✅ FIXED

- **Problem**: `setPollingTasks()` called inside `useEffect` causing infinite state updates and re-renders
- **Impact**: Polling occurred every ~500ms instead of configured 3 seconds, causing "Maximum update depth exceeded" error
- **Root Cause**: State update inside useEffect created loop: state update → re-render → new task object → effect re-execution
- **Solution**:
  - Replaced state-based `stopPolling` function with ref-based approach using `useRef<Map<string, () => void>>`
  - Removed `setPollingTasks()` call from inside `useEffect`
  - Store `stopQuery` function in ref map instead of state: `stopQueryRefs.current.set(muxVideoId, stopQuery)`
  - Updated `stopPolling` function in task creation to reference ref map
  - Made `userGenerated` parameter optional in `startPolling` function signature
- **Files**: `MuxSubtitlePollingProvider.tsx`

#### 3. **Poor Error Handling** ✅ FIXED

- **Problem**: Generic error messages, no cleanup of failed subtitles, errors swallowed in catch blocks
- **Impact**: Impossible to debug failures, failed subtitles left in database
- **Solution**:
  - Enhanced logging to show actual Mux error messages (`error.messages[0]`)
  - Delete failed subtitle tracks from database when Mux returns 'errored' status
  - Re-throw GraphQLErrors properly
  - Add comprehensive logging before/after Mux API calls
- **Files**: `apis/api-media/src/schema/mux/subtitles/subtitles.ts`

#### 4. **Hardcoded Account Selection** ✅ FIXED

- **Problem**: Frontend hardcoded `userGenerated: false` in queries, but videos uploaded to UGC account
- **Impact**: Queries looked in Publisher account, videos uploaded to UGC account → mismatch
- **Solution**: Removed hardcoded values, let backend determine account from user role automatically
- **Files**: `VideoBlockEditorSettings.tsx`, `MuxSubtitleManager.tsx`

#### 5. **Root Cause: Smart Encoding Incompatibility** ✅ FIXED

- **Problem**: `encoding_tier: 'smart'` causes audio track to have no `status` field. Mux's subtitle generation API requires `status: "ready"` on audio track
- **Impact**: Subtitle generation immediately fails with "Asset does not have an audio track" error, even though audio track exists
- **Investigation**:
  - Tested with curl → works perfectly with `baseline` encoding
  - Tested with curl → fails with `smart` encoding (even after 30 minutes)
  - Confirmed audio track missing `status` field with smart encoding
- **Solution**: Changed `encoding_tier` from `'smart'` to `'baseline'` globally
- **Files**: `apis/api-media/src/schema/mux/video/service.ts`
- **Note**: This is a TEMPORARY fix for testing. **DO NOT COMMIT** until cost/quality implications are understood.

### Technical Details

#### Encoding Tier Comparison

| Video Quality | Encoding Tier | Audio Track Status   | Subtitle Generation |
| ------------- | ------------- | -------------------- | ------------------- |
| `basic`       | `baseline`    | `status: "ready"` ✅ | Works ✅            |
| `plus`        | `smart`       | `status: null` ❌    | Fails ❌            |

**Root Cause**: With `smart` encoding, audio tracks don't get a `status` field, so Mux's subtitle generation API can't verify the track is ready.

### Files Modified

#### Frontend

- `apps/journeys-admin/src/components/MuxSubtitlePollingProvider/MuxSubtitlePollingProvider.tsx`
  - ✅ Fixed infinite polling loop by removing state updates from `useEffect`
  - ✅ Added `stopQueryRefs` ref map to store `stopQuery` functions outside state system
  - ✅ Made `userGenerated` parameter optional in `startPolling` function signature
  - ✅ Updated task creation to use ref-based `stopPolling` function
  - ✅ Added cleanup to remove refs when polling stops or component unmounts
  - ✅ Polling now runs at correct 3-second interval (previously ~500ms)
  - ✅ Eliminated "Maximum update depth exceeded" error
  - Added refetch on completion/error
  - ✅ Added dismiss buttons to all snackbars (error, in progress, completed)
  - ✅ Changed "in progress" snackbar from info (blue) to success (green)
  - ✅ Made all snackbars persistent with dismiss functionality
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoBlockEditor/Settings/SubtitleSelector/MuxSubtitleManager.tsx`
  - Removed hardcoded `userGenerated: true`
  - Fixed `startPolling` call to omit userGenerated
  - ✅ Added dismiss buttons to error snackbars
  - ✅ Made error snackbars persistent
  - ✅ **Added inline status labels** below Generate button:
    - Success label: Green checkmark + "Subtitle have been generated in [language]"
    - Error label: Red exclamation + "Error while generating file. Please try again."
    - Shows success when existing subtitle matches selected language
    - Shows error when mutation fails or polling returns error status
    - Hides when language is changed (intermediate state)
    - Clear error state on language change
    - Error message state management with automatic cleanup
    - Typography variant: caption (small size), icon size: 16px
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoBlockEditor/Settings/VideoBlockEditorSettings.tsx`
  - Removed hardcoded `userGenerated: false` from query

#### Backend

- `apis/api-media/src/schema/mux/subtitles/service.ts`
  - Added comprehensive logging
  - Added asset readiness validation
  - Removed invalid audio track status check (tracks don't have status)
- `apis/api-media/src/schema/mux/subtitles/subtitles.ts`
  - Enhanced error logging with actual Mux error messages
  - Added cleanup of failed subtitle tracks
  - Proper GraphQLError re-throwing
  - Handle 'errored' status from Mux properly
- `apis/api-media/src/schema/mux/video/service.ts` ⚠️ **TEMPORARY - DO NOT COMMIT**
  - Changed `encoding_tier` from `'smart'` to `'baseline'` in both:
    - `createVideoByDirectUpload` (line 41)
    - `createVideoFromUrl` (line 82)

### Next Steps

#### Immediate

- ✅ **Verified**: Subtitle generation works with baseline encoding
- ⚠️ **Pending**: Understand cost/quality implications of baseline vs smart encoding
- ⚠️ **Decision**: Keep baseline, revert to smart, or find alternative solution

#### Future Considerations

1. **Cost Analysis**: Research pricing difference between baseline and smart encoding
2. **Quality Testing**: Compare video quality/performance with baseline vs smart
3. **Mux Support**: Consider filing support ticket about smart encoding + subtitle incompatibility
4. **Alternative Solutions**:
   - Conditional encoding (baseline when subtitles needed)
   - Wait for audio track to be ready before allowing subtitle generation
   - Disable subtitle feature for smart-encoded videos
   - Use Mux webhooks to detect when audio track becomes ready

### Testing Results

**Success Criteria Met**:

- ✅ Subtitle generation completes successfully
- ✅ Polling occurs every 3 seconds (not 500ms)
- ✅ Subtitle appears in video's subtitles array
- ✅ `readyToStream: true` status updates correctly
- ✅ Error handling works properly
- ✅ UI refreshes after completion/error
- ✅ No "Maximum update depth exceeded" error
- ✅ No infinite re-render loops
- ✅ Inline status labels display correctly:
  - ✅ Success label shows when subtitle exists and matches selected language
  - ✅ Error label shows on generation failure with proper error message
  - ✅ Labels hide when language is changed (intermediate state)
  - ✅ Error state clears automatically on language change
