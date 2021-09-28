# API Journeys

## Add a New Block Type

1. Add BlockType to prisma/schema.prisma

```
  enum BlockType {
    ImageBlock
  }
```

2. run `nx migrations api-journeys`
3. update schema in src/modules/block/index.ts with new block (sort alphabetically by block)

```
  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String
  }
```

3. update resolvers in src/modules/block/index.ts with new block (sort alphabetically by block)

```ts
const resolvers: Resolvers = {
  ...
  ImageBlock: {
    src: ({ extraAttrs }) => get(extraAttrs, 'src'),
    width: ({ extraAttrs }) => get(extraAttrs, 'width'),
    height: ({ extraAttrs }) => get(extraAttrs, 'height'),
    alt: ({ extraAttrs }) => get(extraAttrs, 'alt')
  }
}
```

4. update codegen.yml with new mapper for new block (sort alphabetically by block)

```yaml
generates:
  ./apps/api-journeys/src/modules/:
    ...
    config:
      ...
      mappers:
        ...
        ImageBlock: .prisma/api-journeys-client#Block as BlockType
```

5. run `nx codegen api-journeys`
6. update src/modules/block/index.spec.ts and prisma/seed.ts with new block
7. run `nx serve api-journeys` to start schema generation process
8. in another terminal run `nx generate-graphql api-journeys` to update apps/api-journeys/schema.graphql
9. run `nx generate-graphql api-gateway` to update apps/api-gateway/schema.graphql
