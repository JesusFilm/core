import { Tool, tool } from 'ai'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

export function generateUuid(): Tool {
  return tool({
    description: 'Generate a new UUID v4 string.',
    parameters: z.object({}), // No parameters needed
    execute: async () => {
      try {
        const uuid = uuidv4()
        return {
          uuid
        }
      } catch (error) {
        return `Error generating UUID: ${error}`
      }
    }
  })
}
