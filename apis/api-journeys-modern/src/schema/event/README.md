# EventService

The EventService provides utilities for validating block events and managing visitor interactions in the modern api-journeys architecture.

## Key Methods

### `validateBlockEvent(userId, blockId, stepId?)`

This method validates that a user can interact with a specific block and step within a journey. It returns the visitor, journey visitor, journey ID, and block information needed for event processing.

**Parameters:**

- `userId: string` - The ID of the user performing the action
- `blockId: string` - The ID of the block being interacted with
- `stepId?: string` - Optional step ID for additional validation

**Returns:**

```typescript
{
  visitor: Visitor
  journeyVisitor: JourneyVisitor
  journeyId: string
  block: Block
}
```

**Throws:**

- `GraphQLError` with code `NOT_FOUND` if block doesn't exist
- `GraphQLError` with code `NOT_FOUND` if visitor doesn't exist
- `GraphQLError` with code `NOT_FOUND` if step doesn't belong to the journey

### `validateBlock(id, value, type)`

Helper method to validate block relationships.

### `getByUserIdAndJourneyId(userId, journeyId)`

Gets visitor and journey visitor information for a specific user and journey.

## Usage Example

```typescript
import { eventService } from '../event'

// In an event resolver
const result = await eventService.validateBlockEvent(userId, input.blockId, input.stepId)

const { visitor, journeyVisitor, journeyId, block } = result

// Create the event
const event = await prisma.event.create({
  data: {
    typename: 'ButtonClickEvent',
    journeyId,
    blockId: input.blockId,
    stepId: input.stepId,
    visitorId: visitor.id
    // ... other event data
  }
})
```

## Migration Notes

This service replaces the similar functionality from the legacy api-journeys EventService. The main differences:

1. Uses Pothos/GraphQL Yoga patterns instead of NestJS
2. Automatically creates JourneyVisitor if it doesn't exist
3. Uses modern Prisma client directly
4. Simplified error handling with GraphQLError

The `validateBlockEvent` method provides the same functionality as the legacy version, ensuring compatibility during the migration process.
