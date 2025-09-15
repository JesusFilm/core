import { observe } from '@langfuse/tracing'

import { langfuseClient, langfuseEnvironment } from './server'

/**
 * Retrieves and compiles a Langfuse prompt with optional variables.
 *
 * This helper function encapsulates the process of fetching a prompt from Langfuse
 * using the configured environment and compiling it with provided variables.
 *
 * @param promptName - The name of the prompt to retrieve from Langfuse
 * @param promptVariables - Optional object containing variables to compile into the prompt.
 *                         Keys should match template variables in the Langfuse prompt.
 * @returns Promise that resolves to the compiled prompt string, or empty string if promptName is falsy
 * @throws Error if prompt retrieval or compilation fails
 */
export async function getPrompt(
  promptName: string,
  promptVariables: Record<string, any> = {}
): Promise<string> {
  if (!promptName) {
    return ''
  }

  try {
    const prompt = await langfuseClient.prompt.get(promptName, {
      label: langfuseEnvironment,
      cacheTtlSeconds: ['development', 'preview'].includes(langfuseEnvironment)
        ? 0
        : 60
    })

    return prompt.compile(promptVariables)
  } catch (error) {
    console.error(`Failed to get or compile prompt "${promptName}":`, error)
    throw error
  }
}
