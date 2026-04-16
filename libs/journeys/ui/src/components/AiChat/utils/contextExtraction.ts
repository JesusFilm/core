import { FullBlockContext } from '../../../libs/useJourneyAiContextGenerator/utils/createFullContext'

export function getActiveBlockContext(
  activeBlockId: string | undefined,
  aiContextData: FullBlockContext[]
): string {
  if (activeBlockId == null) {
    return combineAllContext(aiContextData)
  }

  const activeContext = aiContextData.find(
    (ctx) => ctx.blockId === activeBlockId
  )

  if (activeContext != null) {
    return activeContext.enrichedContext
  }

  return combineAllContext(aiContextData)
}

function combineAllContext(aiContextData: FullBlockContext[]): string {
  return aiContextData
    .map((ctx) => ctx.enrichedContext)
    .filter((text) => text.length > 0)
    .join('\n\n')
}
