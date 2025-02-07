import { CoreMessage } from 'ai'

interface Persona {
  name: string
  background: string
  motivation: string
  questioningStyle: string
  comprehensionLevel: 'beginner' | 'intermediate' | 'advanced'
  systemPrompt: string
}

interface PersonaGeneration {
  personas: Persona[]
}

const DIALOGUE_ARCHITECT_PROMPT = `You are the DialogueArchitect, an AI specialized in analyzing topics and creating personas who will engage in meaningful learning conversations.

Your role is to:
1. Analyze the user's prompt carefully
2. Create 1-2 personas who would have genuine interest in learning about this topic
3. Each persona should have a unique perspective and reason for wanting to understand the topic

For each persona, you must specify:
- A suitable name
- A realistic background story
- A clear motivation for learning about this topic
- A distinct questioning style
- Their level of topic comprehension (beginner/intermediate/advanced)
- A detailed system prompt that will guide their behavior

Guidelines:
- Personas should be learners, not experts
- Create diverse perspectives that will lead to meaningful questions
- Ensure backgrounds and motivations are respectful and appropriate
- No profanity or inappropriate content
- Default to intermediate comprehension if unclear from prompt
- Each persona should have a unique angle or reason for interest

Output your response in the following JSON format:
{
  "personas": [{
    "name": string,
    "background": string,
    "motivation": string,
    "questioningStyle": string,
    "comprehensionLevel": string,
    "systemPrompt": string
  }]
}

Remember: The systemPrompt for each persona should clearly instruct them how to behave and ask questions based on their background and motivation.`

const dialogueArchitectMessages: CoreMessage[] = []

export class DialogueArchitect {
  constructor(private model: any) {} // We'll need to inject the AI model

  async createPersonas(userPrompt: string): Promise<PersonaGeneration> {
    try {
      const response = await this.model.complete({
        messages: [
          {
            role: 'system',
            content: DIALOGUE_ARCHITECT_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7, // Allow for some creativity while maintaining consistency
        response_format: { type: 'json_object' }
      })

      // Parse and validate the response
      const result = JSON.parse(response.content) as PersonaGeneration

      // Validate the number of personas
      if (result.personas.length < 1 || result.personas.length > 2) {
        throw new Error('Invalid number of personas generated')
      }

      return result
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create personas: ${error.message}`)
      }
      throw new Error('Failed to create personas: Unknown error')
    }
  }
}
