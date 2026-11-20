import { GraphQLError, visit } from 'graphql'
import type { Plugin } from 'graphql-yoga'

import {
  PrismaClient,
  journeyTransactionScope
} from '@core/prisma/journeys/client'

export const privatePreviewCachePolicy = {
  'Query.journeyPreview': 0,
  'Query.journeyPublishPermission': 0
}

// Pothos resolves nested blocks, Host and theme after the root field returns.
// Keep those reads in the same snapshot and journey lock as its revision check.
export function usePrivatePreview(db: PrismaClient): Plugin {
  return {
    onExecute({ executeFn, setExecuteFn, args }) {
      let preview = false
      visit(args.document, {
        Field(node) {
          if (node.name.value === 'journeyPreview') preview = true
        }
      })
      if (!preview) return
      setExecuteFn(async (options) =>
        db.$transaction(
          (tx) =>
            journeyTransactionScope.run(tx, async () => {
              const result = await executeFn(options)
              if (Symbol.asyncIterator in result)
                throw new GraphQLError(
                  'Streaming private preview is unavailable'
                )
              return result
            }),
          { isolationLevel: 'RepeatableRead', timeout: 20000 }
        )
      )
    }
  }
}
