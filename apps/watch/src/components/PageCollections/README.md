# PageCollections Configuration Guide

This directory contains configuration files and components for managing video collections and their display logic.

## Collection Configuration Arrays

The `collectionShowcaseConfig.ts` file contains arrays of video/collection sources that define how content is displayed across the application.

### Source Object Structure

Each source in the configuration arrays follows this TypeScript interface:

```typescript
interface SectionVideoCollectionCarouselSource {
  id: string                    // Database ID of the video or collection
  idType?: 'databaseId' | 'slug' // Optional: how to query the ID (default: databaseId)
  limitChildren?: number        // Optional: max children to extract from collections
}
```

### Display Logic

The system automatically determines how to render each source based on:

1. **GraphQL Response Analysis**: Each ID is queried to determine if it's a video or collection
2. **Configuration Rules**: The `limitChildren` property controls flattening behavior

#### Rendering Rules

- **Single Video/Collection Block**: If `limitChildren` is NOT specified
  - Collections with children → Displayed as single collection video block
  - Individual videos → Displayed as single video block
  - No flattening occurs

- **Collection as Single Item**: If `limitChildren` is `0`
  - Collections are displayed as a single item using collection metadata (title, image, etc.)
  - No children are extracted or displayed
  - Useful for representing collections as navigational items

- **Flattened Collection**: If `limitChildren` is greater than `0`
  - Collection children are extracted and displayed as individual video blocks
  - Limited to `limitChildren` number of videos
  - Useful for showcasing highlights from large collections

### Configuration Arrays

#### `collectionShowcaseSources`
Used on the main collections page and homepage rails.

```typescript
export const collectionShowcaseSources: SectionVideoCollectionCarouselSource[] = [
  { id: '1_jf-0-0' },                    // Single collection block
  { id: '2_GOJ-0-0' },                   // Single collection block
  { id: 'LUMOCollection' },              // Single collection block
  { id: 'GOMarkCollection', limitChildren: 0 },  // Collection as single item
  { id: 'GOLukeCollection', limitChildren: 1 },  // Flattened: 1 video from collection
  { id: 'GOJohnCollection', limitChildren: 1 }   // Flattened: 1 video from collection
]
```

#### `collectionLumo`
Used for vertical grid layouts focusing on Gospel collections.

```typescript
export const collectionLumo: SectionVideoCollectionCarouselSource[] = [
  { id: 'LUMOCollection', limitChildren: 1 },    // Flattened: 1 video from collection
  { id: 'GOMarkCollection', limitChildren: 1 },  // Flattened: 1 video from collection
  { id: 'GOLukeCollection', limitChildren: 1 },  // Flattened: 1 video from collection
  { id: 'GOJohnCollection', limitChildren: 1 }   // Flattened: 1 video from collection
]
```

#### `christmasAdventShowcaseSources`
Individual videos for Christmas Advent content.

```typescript
export const christmasAdventShowcaseSources: SectionVideoCollectionCarouselSource[] = [
  { id: '2_0-ConsideringChristmas' },    // Single video block
  { id: '2_0-SupremeChristmas' },        // Single video block
  // ... more individual videos
]
```

#### `nuaChristmasSources`
Large Christmas collection with limited extraction.

```typescript
export const nuaChristmasSources: SectionVideoCollectionCarouselSource[] = [
  { id: '7_0-ncs', limitChildren: 12 }   // Flattened: up to 12 videos from collection
]
```

## Usage in Components

These configuration arrays are used by:

- `SectionVideoCarousel`: Displays items in a horizontal carousel
- `SectionVideoGrid`: Displays items in a grid layout (horizontal/vertical)

### Example Usage

```typescript
// In CollectionsRail.tsx
<SectionVideoCarousel
  id="home-video-gospels"
  sources={collectionShowcaseSources}
  subtitleOverride="Video Bible Collection"
  titleOverride="Discover the full story"
/>

<SectionVideoGrid
  id="home-collection-showcase-grid-vertical"
  sources={collectionLumo}
  orientation="vertical"
  subtitleOverride="Every Gospel, Told on Video"
/>
```

## GraphQL Query Behavior

All IDs from the configuration arrays are queried together in a single GraphQL request:

```graphql
query GetCollectionShowcaseContent($ids: [ID!], $languageId: ID!) {
  videos(where: { ids: $ids }) {
    # Returns both individual videos and collections with their children
  }
}
```

The system then processes the results based on the display rules above.

## Best Practices

1. **Use `limitChildren` sparingly**: Only when you want to flatten a collection into individual videos
2. **Test configurations**: Each change should be tested to ensure expected rendering behavior
3. **Consider performance**: Large collections with `limitChildren` may impact loading performance
4. **Maintain consistency**: Similar content types should follow similar configuration patterns

## Recent Changes

- Removed explicit `type` field from source objects
- Type determination now based on GraphQL response data
- Flattening controlled by `limitChildren` presence rather than explicit type
