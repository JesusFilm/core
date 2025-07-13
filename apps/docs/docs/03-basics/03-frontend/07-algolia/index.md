# Frontend Algolia

## What Is Algolia?

[Algolia](https://www.algolia.com) is a powerful hosted search engine that enables developers to build fast and relevant search experiences for their users. It provides a search-as-you-type experience for websites and applications, making data retrieval instantaneous and efficient. Algolia indexes your data so that it can be easily queried and delivered to users in a fraction of a second. [Algolia Intro Video](https://youtu.be/pnEzD8KiiBs).

## Consuming from Algolia

To consume data from Algolia, you'll need to add the instant search wrapper around the page that uses it, and create a custom hook for your algolia items:

- **Instant Search Provider**: Normally you would wrap your `_app.tsx` in an instant search context to use the same client connection throughout multiple pages but because of watch being configured for SSG, we need to add the instant search and the SSR wrapper at the page level. There is a `useInstantSearchClient` hook that at least means that you can reuse the same search client on every page.

```typescript
function VideosPage({ initialApolloState, serverState }: VideosPageProps): ReactElement {
  const searchClient = useInstantSearchClient()
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch searchClient={searchClient} indexName={indexName} stalledSearchDelay={500} future={{ preserveSharedStateOnUnmount: true }} insights routing={createInstantSearchRouter()}>
        <Configure ruleContexts={['all_videos_page']} />
        ...
      </InstantSearch>
    </InstantSearchSSRProvider>
  )
}
```

Note you can also add any configuration to this particular page's search experience with the `<Configure />` widget from Algolia.

Your child components can now use algolia hooks and the InstantSearch will maintain the state.

- **Custom Hook**: Create a custom React hook that encapsulates the logic for fetching search results from Algolia and transforming it into the correct type. See `useAlgoliaVideos.tsx` for an example. See [Custom Hooks](../06-custom-hooks/index.md) for more examples.

```typescript
export function useAlgoliaVideos(): {
  loading: boolean
  noResults: boolean
  items: CoreVideo[]
  showMore: () => void
  isLastPage: boolean
  sendEvent: SendEventForHits
} {
  const { status, results } = useInstantSearch()
  const { items, showMore, isLastPage, sendEvent } = useInfiniteHits<AlgoliaVideo>()

  const transformedHits = transformItems(hits)

  return {
    loading: status === 'stalled' || status === 'loading',
    noResults: !(results.__isArtificial ?? false) && results.nbHits === 0,
    items: transformedHits,
    showMore,
    isLastPage,
    sendEvent
  }
}
```

Note that we can use the algolia hooks `useHits` or `useInfiniteHits` to query an algolia index for items. The index name should be defined in the instant search. If you need to query multiple indexes per page, still define a default index at the instant search level and then add `<Index indexName=''/>` widgets as needed.

This hook can only be called inside an instant search context.

- **Transform Function**: Include a transform function that transforms the data returned from Algolia into a format that your components can readily use. This may include mapping over the hits and extracting necessary fields.

```typescript
export function transformItems(items: AlgoliaVideo[]): CoreVideo[] {
  return items.map((videoVariant) => ({
    __typename: 'Video',
    id: videoVariant.videoId,
    label: videoVariant.label,
    title: [
      {
        value: videoVariant.titles[0]
      }
    ],
    snippet: []
  }))
}
```

- **Make a Component Use Algolia**: Some tips and tricks that might be useful now that you are ready to create some algolia components. Try to build components that take the data they need to render as a prop. This means the algolia hooks are higher up the component dependency tree meaning less mocking is needed for tests. It also makes things easier when modifying a component that currently uses core data, to also accept algolia data. You can see `AlgoliaVideoGrid.tsx` as an example.

```typescript
export function AlgoliaVideoGrid(props: VideoGridProps): ReactElement {
  const { hits: algoliaVideos, showMore, isLastPage, loading, noResults } = useAlgoliaVideos()
  return <VideoGrid videos={algoliaVideos} loading={loading} showMore={showMore} hasNextPage={!isLastPage} hasNoResults={noResults} {...props} />
}
```

By creating an algolia wrapper class, the `<VideoGrid />` component remained relatively unchanged and still able to be used in other places with core videos.

## Testing

### Component Testing

For component jest tests, you can mock algolia by mocking the react-instantsearch library and each hook individually like this:

```typescript
jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

describe('Component', () => {
  const refine = jest.fn()

  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  const useSearchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  const clearRefinements = {
    refine: jest.fn(),
    canRefine: false
  } as unknown as ClearRefinementsRenderState

  beforeEach(() => {
    mockUseRefinementList.mockReturnValue(useRefinementList)
    mockUseSearchBox.mockReturnValue(useSearchBox)
    mockUseClearRefinements.mockReturnValue(clearRefinements)
  })
  ...
})
```

Try to define large object data in a `data.ts` file like `languageRefinements` above.

### Storybook Testing

For storybooks we need to utilise mock service workers (MSW) to intercept the algolia API calls and instead return our own data. Note if you are adding the `<SearchBar />` to your page, you will need the `<SearchBarProvider />` and mocks.

```typescript
const Template: StoryObj<ComponentProps<typeof SearchBar> & { query: string }> = {
  render: (args) => (
    <InstantSearchTestWrapper query={args.query}>
      <SearchBarProvider>
        <MockedProvider mocks={[getLanguagesContinentsMock]}>
          <SearchBar showDropdown={args.showDropdown} showLanguageButton={args.showLanguageButton} />
        </MockedProvider>
      </SearchBarProvider>
    </InstantSearchTestWrapper>
  )
}
```

Make sure the component is wrapped in our `<InstantSearchTestWrapper/>`. This makes the API calls consistent so that we can intercept them with MSK. See [Storybook](../04-storybook/index.md) for examples of MSWs.

```typescript
export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}
```
