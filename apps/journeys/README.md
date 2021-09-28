# Journeys

## Generating Types for New Blocks

Once a new block type has been minted on the backend it's important that you update our GraphQL query to bring in data to populate the new block. [Learn how to add a block on the backend](../api-journeys/README.md#add-a-new-block-type).

1. Add block to `pages/[journeyId]` for example:

```
  ... on VideoBlock {
    src
    title
    volume
    autoplay
  }
```

2. run `nx codegen journeys`
3. if step 2 fails, run `rm -rf node_modules/apollo-language-server/node_modules/graphql/` and retry step 2.
