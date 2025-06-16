# Journey AI Translation Subscription with Automatic Cache Updates

This document explains how the `useJourneyAiTranslateSubscription` hook works with Server-Sent Events (SSE) and automatically updates the Apollo Client cache.

## Overview

The `useJourneyAiTranslateSubscription` hook provides real-time updates for AI-powered journey translations using Server-Sent Events (SSE) instead of WebSockets. It automatically updates the Apollo Client cache as translation data is received.

## Features

### 🔄 Automatic Cache Updates

- **Journey Updates**: Automatically updates journey title, description, and language
- **Block Updates**: Updates all translated blocks (Typography, Button, RadioOption, etc.)
- **Real-time UI**: UI components automatically re-render when cache is updated
- **Error Handling**: Graceful error handling with console logging

### 📡 SSE Subscription

- **Server-Sent Events**: Uses SSE for real-time communication
- **HTTP-based**: Works through firewalls and proxies
- **Automatic Reconnection**: Built-in browser reconnection logic

## Usage

### Basic Usage

```typescript
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'

function MyComponent() {
  const [translationVariables, setTranslationVariables] = useState(undefined)

  const { data, error, loading } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onData: ({ data }) => {
      // This callback is called when translation completes
      // The cache has already been updated automatically!
      console.log('Translation completed:', data)
    }
  })

  const startTranslation = () => {
    setTranslationVariables({
      journeyId: 'journey-id',
      name: 'Journey Name',
      journeyLanguageName: 'English',
      textLanguageId: '529',
      textLanguageName: 'Spanish'
    })
  }

  return (
    <button onClick={startTranslation}>
      Translate Journey
    </button>
  )
}
```

### Advanced Usage with Manual Cache Updates

```typescript
import { useJourneyAiTranslateSubscription, updateCacheWithTranslatedJourney } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useApolloClient } from '@apollo/client'

function AdvancedComponent() {
  const client = useApolloClient()

  const { data } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    onData: ({ data }) => {
      // Automatic cache update happens first

      // Then you can do additional custom cache operations
      if (data.data?.journeyAiTranslateCreate) {
        // Custom cache logic here
        console.log('Cache updated, doing additional work...')
      }
    }
  })

  // You can also manually update the cache if needed
  const manualCacheUpdate = (translatedJourney) => {
    updateCacheWithTranslatedJourney(client, translatedJourney)
  }
}
```

## Cache Update Details

### What Gets Updated

1. **Journey Object**:

   - `title` - Translated journey title
   - `description` - Translated journey description
   - `languageId` - New target language ID
   - `updatedAt` - Timestamp of translation
   - `blocks` - Array of all translated blocks

2. **Individual Blocks**:
   - `TypographyBlock.content` - Translated text content
   - `ButtonBlock.label` - Translated button text
   - `RadioOptionBlock.label` - Translated option text
   - `RadioQuestionBlock.label` - Translated question text
   - `TextResponseBlock.label` - Translated label
   - `TextResponseBlock.placeholder` - Translated placeholder

### Cache Update Process

1. **Fragment Updates**: Uses `writeFragment` to update specific objects
2. **Journey Fragment**: Updates the main journey object with new data
3. **Block Fragments**: Updates each individual block with translated content
4. **Cache Broadcast**: Triggers `broadcastWatches()` to notify all components
5. **UI Re-render**: Components automatically re-render with new data

### Error Handling

```typescript
// The hook includes built-in error handling
const { error } = useJourneyAiTranslateSubscription({
  variables: translationVariables,
  onError: (error) => {
    console.error('Translation error:', error)
    // Handle error in your UI
  }
})

// Cache update errors are logged but don't break the subscription
// Check console for: "Error updating cache with translated journey:"
```

## Integration Examples

### With Snackbar Notifications

```typescript
const { enqueueSnackbar } = useSnackbar()

const { data } = useJourneyAiTranslateSubscription({
  variables: translationVariables,
  onData: ({ data }) => {
    if (data.data?.journeyAiTranslateCreate) {
      enqueueSnackbar('Translation completed!', { variant: 'success' })
    }
  },
  onError: (error) => {
    enqueueSnackbar(error.message, { variant: 'error' })
  }
})
```

### With Loading States

```typescript
const [isTranslating, setIsTranslating] = useState(false)

const { loading } = useJourneyAiTranslateSubscription({
  variables: translationVariables,
  skip: !translationVariables,
  onData: () => {
    setIsTranslating(false)
    setTranslationVariables(undefined) // Stop subscription
  }
})

const startTranslation = () => {
  setIsTranslating(true)
  setTranslationVariables(/* ... */)
}
```

## GraphQL Subscription Query

The subscription includes all necessary fields for cache updates:

```graphql
subscription JourneyAiTranslateCreate($journeyId: ID!, $name: String!, $journeyLanguageName: String!, $textLanguageId: ID!, $textLanguageName: String!) {
  journeyAiTranslateCreate(input: { journeyId: $journeyId, name: $name, journeyLanguageName: $journeyLanguageName, textLanguageId: $textLanguageId, textLanguageName: $textLanguageName }) {
    id
    title
    description
    languageId
    createdAt
    updatedAt
    blocks {
      id
      __typename
      ... on TypographyBlock {
        content
      }
      ... on ButtonBlock {
        label
      }
      ... on RadioOptionBlock {
        label
      }
      ... on RadioQuestionBlock {
        label
      }
      ... on TextResponseBlock {
        label
        placeholder
      }
    }
  }
}
```

## Benefits

### 🚀 Performance

- **Automatic Updates**: No need to refetch queries after translation
- **Granular Updates**: Only updates changed data, not entire queries
- **Real-time**: UI updates immediately as translation completes

### 🔧 Developer Experience

- **Zero Configuration**: Cache updates work automatically
- **Type Safety**: Full TypeScript support with generated types
- **Error Resilience**: Graceful error handling and logging

### 🎯 User Experience

- **Real-time Feedback**: Users see updates as they happen
- **Consistent State**: All components stay in sync automatically
- **No Flickering**: Smooth updates without loading states

## Troubleshooting

### Cache Not Updating

1. Check console for cache update errors
2. Verify the journey ID exists in the cache
3. Ensure the subscription is receiving data

### UI Not Re-rendering

1. Verify components are using Apollo Client hooks (`useQuery`, etc.)
2. Check that the cache identifiers match
3. Ensure `broadcastWatches()` is being called

### Subscription Errors

1. Check network connectivity
2. Verify SSE endpoint is accessible
3. Check authentication headers
4. Review server-side subscription implementation

## Related Files

- `useJourneyAiTranslateSubscription.ts` - Main hook implementation
- `apolloClient.ts` - SSE link configuration
- `CopyToTeamMenuItem.tsx` - Example usage
- `TranslateJourneyDialog.tsx` - Example usage
