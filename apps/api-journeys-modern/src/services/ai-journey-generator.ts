import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamObject } from 'ai'
import { z } from 'zod'

import {
  JourneyGenerationInput,
  TemplateSelection,
  TemplateSelectionSchema,
  TheologicalValidation,
  TheologicalValidationSchema
} from '../schema/ai/journey-generation.types'
import { JourneySchema } from '../schema/journey/journey.zod'

const openai = createOpenAI({
  compatibility: 'strict',
  apiKey: process.env.OPEN_AI_API_KEY
})

export class AiJourneyGenerator {
  private readonly systemPrompt =
    'You help people build evangelical Christian journeys. ' +
    'Follow these rules:\n' +
    '1. Content must be exclusively evangelical Christian\n' +
    '2. Use only real Unsplash images, no AI-generated images\n' +
    '3. Images must not repeat more than once\n' +
    '4. Images must relate to the content\n' +
    '5. Each StepBlock must have exactly one CardBlock child\n' +
    '6. Each CardBlock must have 3-6 relevant content blocks as children\n' +
    '7. All content must be theologically sound and biblically accurate\n' +
    '8. Maintain EXACTLY the same block structure as the template\n' +
    '9. Keep all StepBlocks, CardBlocks, and their relationships intact\n' +
    '10. Only modify the content, images, and text while preserving structure\n' +
    '11. Ensure navigation flow and block relationships match template exactly'

  private readonly templates = [
    {
      id: '560ee498-5720-4788-a0d8-0f3b385ad389',
      slug: 'untitled-journey-560ee498-5720-4788-a0d8-0f3b385ad389',
      title: 'Zod Schema Generator',
      description: '',
      status: 'published',
      createdAt: '2025-02-03T17:32:05.544Z',
      featuredAt: null,
      publishedAt: '2025-02-03T17:32:05.543Z',
      themeName: 'base',
      themeMode: 'dark',
      strategySlug: null,
      seoTitle: null,
      seoDescription: null,
      template: false,
      blocks: [
        {
          id: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentBlockId: 'c4e4a0b0-52ec-422b-99ce-e4fd69de9639',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: '57d1d485-2a08-452a-a29e-13c6692ecd34',
          themeMode: 'dark',
          themeName: 'base',
          fullscreen: true,
          __typename: 'CardBlock'
        },
        {
          id: '0453a421-6e06-47c5-9f57-51b6b4a13d05',
          parentBlockId: 'f8339f70-f4ed-4207-a320-b829cd6ee87c',
          parentOrder: 0,
          backgroundColor: '#0E1412',
          coverBlockId: '7a3aa964-c194-4083-8ade-6fdac5980abb',
          themeMode: 'dark',
          themeName: 'base',
          fullscreen: false,
          __typename: 'CardBlock'
        },
        {
          id: 'd2be38b8-279b-4e72-9f38-23ba7b54dc09',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: 0,
          align: null,
          color: null,
          content: "Let's Connect",
          variant: 'h6',
          __typename: 'TypographyBlock'
        },
        {
          id: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentBlockId: '315ad597-1283-4727-9b8b-bc74b6b16604',
          parentOrder: 0,
          backgroundColor: '#0E1412',
          coverBlockId: '7653c28d-1533-4a93-a1df-d8d72716981a',
          themeMode: 'dark',
          themeName: 'base',
          fullscreen: false,
          __typename: 'CardBlock'
        },
        {
          id: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentBlockId: '143d62d7-bb0a-41b5-b165-899c7e936968',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: '7854c54a-98c3-4f23-b855-a81dcef3390d',
          themeMode: 'dark',
          themeName: 'base',
          fullscreen: true,
          __typename: 'CardBlock'
        },
        {
          id: 'f8339f70-f4ed-4207-a320-b829cd6ee87c',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: 'c4e4a0b0-52ec-422b-99ce-e4fd69de9639',
          slug: null,
          __typename: 'StepBlock'
        },
        {
          id: '9788239c-88e5-4bd6-abe6-bca475101ab5',
          parentBlockId: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Prayer Request',
          variant: 'h6',
          __typename: 'TypographyBlock'
        },
        {
          id: 'fb2bdae1-4cf6-4817-bd20-98aae78276e5',
          parentBlockId: '0453a421-6e06-47c5-9f57-51b6b4a13d05',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'The Bible Says:',
          variant: 'h6',
          __typename: 'TypographyBlock'
        },
        {
          id: 'eb908ed0-1b1c-4c75-b8c2-92f25b61ca03',
          parentBlockId: '2aa58e99-015e-4134-83b6-954f949942cf',
          parentOrder: 0,
          label: 'Turning the other cheek',
          action: null,
          __typename: 'RadioOptionBlock'
        },
        {
          id: '1b6b2569-bfad-4daa-bf28-212a10f76623',
          parentBlockId: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Got an Opinion?',
          variant: 'h6',
          __typename: 'TypographyBlock'
        },
        {
          id: 'd38d8689-6010-44ac-b110-f45711198e1b',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: 1,
          align: null,
          color: null,
          content: "From 'hello' to heartfelt conversations",
          variant: 'h3',
          __typename: 'TypographyBlock'
        },
        {
          id: '807bbcc1-4ab6-467d-8460-c4bee48aa995',
          parentBlockId: '0453a421-6e06-47c5-9f57-51b6b4a13d05',
          parentOrder: 1,
          align: null,
          color: null,
          content:
            'Blessed are the peacemakers, for they shall be called sons of God.',
          variant: 'h3',
          __typename: 'TypographyBlock'
        },
        {
          id: '3b689a52-77aa-457b-bf7d-884f222d0263',
          parentBlockId: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentOrder: 1,
          align: null,
          color: null,
          content: "Which of Jesus' teachings challenges you the most?",
          variant: 'h2',
          __typename: 'TypographyBlock'
        },
        {
          id: 'a3282775-34a1-4adc-bed1-7e7111bf53d5',
          parentBlockId: '2aa58e99-015e-4134-83b6-954f949942cf',
          parentOrder: 1,
          label: 'Loving your enemies',
          action: null,
          __typename: 'RadioOptionBlock'
        },
        {
          id: '315ad597-1283-4727-9b8b-bc74b6b16604',
          parentBlockId: null,
          parentOrder: 1,
          locked: false,
          nextBlockId: null,
          slug: null,
          __typename: 'StepBlock'
        },
        {
          id: 'f3a45e59-b685-4154-aeb9-0c152c3c8ef6',
          parentBlockId: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentOrder: 1,
          align: null,
          color: null,
          content: 'How can we pray for you?',
          variant: 'h1',
          __typename: 'TypographyBlock'
        },
        {
          id: 'fd21a9df-c2e1-46cf-b9f2-67f8515f29d1',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: 2,
          label: 'Chat with us',
          buttonVariant: 'contained',
          buttonColor: null,
          size: 'large',
          startIconId: 'a21727b0-5fed-49b6-adc5-297272655095',
          endIconId: '01adcbd0-ab80-47fa-a866-2aa7dacebc51',
          action: null,
          __typename: 'ButtonBlock'
        },
        {
          id: '3356028e-13e2-458a-8c32-5137a7e14ccd',
          parentBlockId: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentOrder: 2,
          label: 'Your answer here',
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null,
          __typename: 'TextResponseBlock'
        },
        {
          id: 'cf9010d2-b40c-44bc-ad28-a42e24cd6a52',
          parentBlockId: '0453a421-6e06-47c5-9f57-51b6b4a13d05',
          parentOrder: 2,
          align: null,
          color: 'secondary',
          content: '– Jesus Christ',
          variant: 'body1',
          __typename: 'TypographyBlock'
        },
        {
          id: 'c4e4a0b0-52ec-422b-99ce-e4fd69de9639',
          parentBlockId: null,
          parentOrder: 2,
          locked: false,
          nextBlockId: '143d62d7-bb0a-41b5-b165-899c7e936968',
          slug: null,
          __typename: 'StepBlock'
        },
        {
          id: '2aa58e99-015e-4134-83b6-954f949942cf',
          parentBlockId: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentOrder: 2,
          __typename: 'RadioQuestionBlock'
        },
        {
          id: 'a5a9c593-ac67-4042-9c79-556ae04799f8',
          parentBlockId: '2aa58e99-015e-4134-83b6-954f949942cf',
          parentOrder: 2,
          label: 'Not worrying about tomorrow',
          action: null,
          __typename: 'RadioOptionBlock'
        },
        {
          id: '143d62d7-bb0a-41b5-b165-899c7e936968',
          parentBlockId: null,
          parentOrder: 3,
          locked: false,
          nextBlockId: '315ad597-1283-4727-9b8b-bc74b6b16604',
          slug: null,
          __typename: 'StepBlock'
        },
        {
          id: '1b270a89-5169-4c36-aa28-cea57b6c25d0',
          parentBlockId: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentOrder: 3,
          align: null,
          color: 'secondary',
          content:
            "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
          variant: 'caption',
          __typename: 'TypographyBlock'
        },
        {
          id: 'd5a0b7da-21d8-4787-adfe-d7954da00300',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: 3,
          label: 'Email us',
          buttonVariant: 'contained',
          buttonColor: null,
          size: 'large',
          startIconId: '2e2eb346-bd8c-4f26-8eb2-37403e4884da',
          endIconId: '25e68708-f9bc-448d-b46c-ec404373fa12',
          action: null,
          __typename: 'ButtonBlock'
        },
        {
          id: '1a7d6ce0-1fcb-4d7c-8300-b7e9929a6c6f',
          parentBlockId: '2aa58e99-015e-4134-83b6-954f949942cf',
          parentOrder: 3,
          label: 'Seeking first the kingdom of God',
          action: null,
          __typename: 'RadioOptionBlock'
        },
        {
          id: '97d522f3-013e-4d61-b851-4d4644d8faa3',
          parentBlockId: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentOrder: 3,
          align: null,
          color: 'secondary',
          content: '↑ Select an answer to continue',
          variant: 'caption',
          __typename: 'TypographyBlock'
        },
        {
          id: '4aaff18f-ace4-4413-b4c6-1f2afc85774d',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: 4,
          label: 'More about us',
          buttonVariant: 'text',
          buttonColor: 'secondary',
          size: 'large',
          startIconId: '6620024a-8835-4be5-a1e9-ea26af99c929',
          endIconId: '98e4efcf-c312-48dd-bf1f-48cfca1071a9',
          action: null,
          __typename: 'ButtonBlock'
        },
        {
          id: 'a21727b0-5fed-49b6-adc5-297272655095',
          parentBlockId: 'fd21a9df-c2e1-46cf-b9f2-67f8515f29d1',
          parentOrder: null,
          iconName: 'ChatBubbleOutlineRounded',
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        {
          id: '7854c54a-98c3-4f23-b855-a81dcef3390d',
          parentBlockId: '1a214545-0afc-40a2-afe7-0f7ccf58f07f',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1488048924544-c818a467dacd',
          width: 5184,
          height: 3456,
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          scale: null,
          focalTop: 50,
          focalLeft: 50,
          __typename: 'ImageBlock'
        },
        {
          id: '7a3aa964-c194-4083-8ade-6fdac5980abb',
          parentBlockId: '0453a421-6e06-47c5-9f57-51b6b4a13d05',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1552423310-ba74b8de5e6f',
          width: 5094,
          height: 3396,
          blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
          scale: null,
          focalTop: 50,
          focalLeft: 50,
          __typename: 'ImageBlock'
        },
        {
          id: '01adcbd0-ab80-47fa-a866-2aa7dacebc51',
          parentBlockId: 'fd21a9df-c2e1-46cf-b9f2-67f8515f29d1',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        {
          id: '57d1d485-2a08-452a-a29e-13c6692ecd34',
          parentBlockId: 'dc0264e5-1310-438f-b81d-05bfe3f4ff37',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1488048924544-c818a467dacd',
          width: 5184,
          height: 3456,
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          scale: null,
          focalTop: 50,
          focalLeft: 50,
          __typename: 'ImageBlock'
        },
        {
          id: '98e4efcf-c312-48dd-bf1f-48cfca1071a9',
          parentBlockId: '4aaff18f-ace4-4413-b4c6-1f2afc85774d',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        {
          id: '7653c28d-1533-4a93-a1df-d8d72716981a',
          parentBlockId: '82e4d9f7-722b-4fa2-8677-6c0973ce021f',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1474314881477-04c4aac40a0e',
          width: 6000,
          height: 4000,
          blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
          scale: null,
          focalTop: 50,
          focalLeft: 50,
          __typename: 'ImageBlock'
        },
        {
          id: '2e2eb346-bd8c-4f26-8eb2-37403e4884da',
          parentBlockId: 'd5a0b7da-21d8-4787-adfe-d7954da00300',
          parentOrder: null,
          iconName: 'SendRounded',
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        {
          id: '25e68708-f9bc-448d-b46c-ec404373fa12',
          parentBlockId: 'd5a0b7da-21d8-4787-adfe-d7954da00300',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        {
          id: '6620024a-8835-4be5-a1e9-ea26af99c929',
          parentBlockId: '4aaff18f-ace4-4413-b4c6-1f2afc85774d',
          parentOrder: null,
          iconName: 'ArrowForwardRounded',
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        }
      ],
      primaryImageBlock: null,
      creatorDescription: null,
      creatorImageBlock: null,
      chatButtons: [],
      host: null,
      tags: [],
      website: false,
      showShareButton: false,
      showLikeButton: false,
      showDislikeButton: false,
      displayTitle: null,
      logoImageBlock: null,
      menuButtonIcon: null,
      menuStepBlock: null,
      __typename: 'Journey',
      language: {
        id: '529',
        bcp47: 'en',
        iso3: 'eng',
        name: [
          {
            value: 'English',
            primary: true,
            __typename: 'LanguageName'
          }
        ],
        __typename: 'Language'
      }
    }
  ]

  async selectTemplate(
    input: JourneyGenerationInput
  ): Promise<TemplateSelection> {
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content:
          'You are a journey template selector. Analyze the input and select the most appropriate template.' +
          `here is a list of our templates: ${JSON.stringify(this.templates)}`
      },
      {
        role: 'user',
        content: JSON.stringify(input)
      }
    ]

    const result = await streamObject({
      system: this.systemPrompt,
      model: openai('gpt-4o'),
      messages,
      output: 'object',
      schema: TemplateSelectionSchema
    })

    let fullResponse = ''
    for await (const delta of result.textStream) {
      fullResponse += delta
    }
    messages.push({ role: 'assistant', content: fullResponse })

    return JSON.parse(fullResponse)
  }

  async validateTheology(content: string): Promise<TheologicalValidation> {
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content:
          'You are a theological validator for evangelical Christian content. Check for biblical accuracy and sound doctrine.'
      },
      {
        role: 'user',
        content
      }
    ]

    const result = await streamObject({
      system: this.systemPrompt,
      model: openai('gpt-4o'),
      messages,
      output: 'object',
      schema: TheologicalValidationSchema
    })

    let fullResponse = ''
    for await (const delta of result.textStream) {
      fullResponse += delta
    }
    messages.push({ role: 'assistant', content: fullResponse })

    return JSON.parse(fullResponse)
  }

  async generateJourney(
    input: JourneyGenerationInput
  ): Promise<z.infer<typeof JourneySchema>> {
    const templateSelection = await this.selectTemplate(input)
    const template = this.templates.find(
      ({ id }) => id === templateSelection.templateId
    )

    if (template == null) throw new Error('template not found')

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt
      },
      {
        role: 'user',
        content: `
          Generate a journey using this template structure EXACTLY:
          1. Keep all StepBlocks 
          2. Keep all CardBlocks 
          3. Maintain all parent-child relationships
          4. Only modify:
             - Text content
             - Image URLs (must be from Unsplash)
             - Button labels
             - Video content 
          
          Input: ${JSON.stringify(input)}
          Template: ${JSON.stringify(template)}
          
          Return a complete journey object matching this template's structure.
        `
      }
    ]

    const result = await streamObject({
      system: this.systemPrompt,
      model: openai('gpt-4o'),
      messages,
      output: 'object',
      schema: JourneySchema
    })

    let fullResponse = ''
    for await (const delta of result.textStream) {
      console.log(delta)
      fullResponse += delta
    }

    // Validate the generated content
    const validation = await this.validateTheology(fullResponse)
    if (!validation.isValid) {
      throw new Error(
        `Theological validation failed: ${validation.concerns.join(', ')}`
      )
    }

    messages.push({ role: 'assistant', content: fullResponse })

    return JSON.parse(fullResponse)
  }
}
