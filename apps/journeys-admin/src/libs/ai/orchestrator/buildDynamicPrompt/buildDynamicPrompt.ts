import { langfuse, langfuseEnvironment } from '../../langfuse/server'
import { IntentClassification } from '../classifyIntent'

export async function getLangfusePrompt(promptName: string) {
  return langfuse.getPrompt(promptName, undefined, {
    label: langfuseEnvironment,
    cacheTtlSeconds: ['development', 'preview'].includes(langfuseEnvironment)
      ? 0
      : 60
  })
}

/**
 * Builds a dynamic prompt based on the intent classification
 */
export async function buildDynamicPrompt(
  classification: IntentClassification,
  params: { journeyId: string; selectedStepId: string; selectedBlockId: string }
) {
  const baseSystemPrompt = await getLangfusePrompt('base-system-prompt')

  if (classification.promptModules.length === 0) {
    return baseSystemPrompt.compile({
      journeyId: params.journeyId,
      selectedStepId: params.selectedStepId,
      selectedBlockId: params.selectedBlockId
    })
  }

  let dynamicPrompt = baseSystemPrompt.compile()

  for (const moduleName of classification.promptModules) {
    try {
      const modulePrompt = await getLangfusePrompt(moduleName)

      dynamicPrompt +=
        '\n\n' +
        modulePrompt.compile({
          journeyId: params.journeyId,
          selectedStepId: params.selectedStepId,
          selectedBlockId: params.selectedBlockId
        })
    } catch (error) {
      console.error(`Failed to fetch prompt module: ${moduleName}`, error)
    }
  }

  return dynamicPrompt
}
