import { z } from 'zod'

import {
  journeySimpleBlockSchema,
  journeySimpleCardSchema,
  journeySimpleSchema
} from './journeySimpleTypes'

// --- AgentJourney: enriched journey state injected into AI system prompt ---

export interface AgentJourneyCard {
  simpleId: string
  blockId: string
  cardBlockId: string
  heading?: string
  content: Array<z.infer<typeof journeySimpleBlockSchema> & { blockId: string }>
  backgroundColor?: string
  backgroundImage?: { src: string; alt: string }
  backgroundVideo?: { url: string }
  defaultNextCard?: string
}

export interface NavigationMapEntry {
  sourceCardId: string
  targetCardId: string
  trigger: 'default' | 'button' | 'poll'
  label?: string
  blockId: string
}

export interface AgentJourney {
  title: string
  description: string
  language: string
  cards: AgentJourneyCard[]
  navigationMap: NavigationMapEntry[]
}

// --- PlanOperation: discriminated union by tool ---

export const planOperationSchema = z.discriminatedUnion('tool', [
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('generate_journey'),
    cardId: z.string().optional(),
    args: z.object({ simple: journeySimpleSchema })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('create_card'),
    cardId: z.string().optional(),
    args: z.object({
      card: journeySimpleCardSchema,
      insertAfterCard: z.string().optional()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('delete_card'),
    cardId: z.string().optional(),
    args: z.object({
      cardId: z.string(),
      redirectTo: z.string().optional()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('update_card'),
    cardId: z.string().optional(),
    args: z.object({
      blockId: z.string(),
      backgroundColor: z.string().optional(),
      backgroundImage: z.object({
        src: z.string(),
        alt: z.string()
      }).nullable().optional(),
      defaultNextCard: z.string().optional(),
      x: z.number().optional(),
      y: z.number().optional()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('add_block'),
    cardId: z.string().optional(),
    args: z.object({
      cardBlockId: z.string(),
      block: journeySimpleBlockSchema,
      position: z.number().int().nonnegative().optional()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('update_block'),
    cardId: z.string().optional(),
    args: z.object({
      blockId: z.string(),
      updates: z.record(z.string(), z.unknown())
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('delete_block'),
    cardId: z.string().optional(),
    args: z.object({
      blockId: z.string()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('reorder_cards'),
    cardId: z.string().optional(),
    args: z.object({
      blockIds: z.array(z.string())
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('update_journey_settings'),
    cardId: z.string().optional(),
    args: z.object({
      title: z.string().optional(),
      description: z.string().optional()
    })
  }),
  z.object({
    id: z.string(),
    description: z.string(),
    tool: z.literal('translate'),
    cardId: z.string().optional(),
    args: z.object({
      targetLanguage: z.string(),
      cardIds: z.array(z.string()).optional()
    })
  })
])

export type PlanOperation = z.infer<typeof planOperationSchema>

export const planOperationArraySchema = z.object({
  operations: z.array(planOperationSchema)
})

export type PlanOperationArray = z.infer<typeof planOperationArraySchema>
