import { JourneyGenerationInput } from '../schema/ai/journey-generation.types'
import { AiJourneyGenerator } from '../services/ai-journey-generator'

async function testJourneyGeneration(): Promise<void> {
  try {
    const generator = new AiJourneyGenerator()

    // Test input
    const input: JourneyGenerationInput = {
      theme: 'modern',
      targetAudience: 'young adults',
      mainMessage: 'Finding peace through prayer',
      language: '529', // English
      additionalContext:
        'Focus on anxiety and stress relief through Christian prayer'
    }

    console.log('🚀 Starting journey generation with input:', input)

    const journey = await generator.generateJourney(input)

    console.log('\n✅ Journey generated successfully!')
    console.log('\nGenerated Journey:')
    console.log(JSON.stringify(journey, null, 2))
  } catch (error) {
    console.error('\n❌ Journey generation failed:')
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testJourneyGeneration().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
