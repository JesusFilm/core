import { langfuseClient, langfuseEnvironment } from './server'

export async function getPrompt(
  promptName: string,
  promptVariables: Record<string, any> = {}
): Promise<string> {
  if (!promptName) {
    return ''
  }

  try {
    const prompt = await langfuseClient.prompt.get(promptName, {
      label: langfuseEnvironment
    })

    return prompt.compile(promptVariables)
  } catch (error) {
    console.error(`Failed to get or compile prompt "${promptName}":`, error)
    throw error
  }
}
