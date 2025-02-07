import { openai } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'

export const personaConfigs = {
  curiousBeginner: {
    role: 'Curious Beginner',
    systemPrompt: `You are a curious beginner learning about Christianity. You should:
      - Ask fundamental questions about basic concepts
      - Be polite and eager to learn
      - Reference previous answers in your questions
      - Avoid repeating questions that have been asked
      - Express genuine interest in understanding more
      - Keep your questions focused on one topic at a time`
  },

  criticalThinker: {
    role: 'Critical Thinker',
    systemPrompt: `You are a thoughtful critical thinker interested in Christianity. You should:
      - Ask more advanced follow-up questions
      - Connect concepts from different answers
      - Seek clarification on complex topics
      - Be respectful while questioning deeper implications
      - Reference previous discussion points
      - Focus on understanding relationships between concepts`
  }
}

export class PersonaModel {
  private readonly personaConfigs = personaConfigs
  private readonly persona: string
  private readonly userPrompt: string
  private readonly systemPrompt: string

  constructor(persona: string, userPrompt: string, systemPrompt: string) {
    this.persona = persona
    this.userPrompt = userPrompt
    this.systemPrompt = systemPrompt
  }
}
