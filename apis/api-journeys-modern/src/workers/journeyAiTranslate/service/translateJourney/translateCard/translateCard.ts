import { Logger } from 'pino'

import { Block } from '.prisma/api-journeys-modern-client'

import { translateButtonBlock } from './translateButtonBlock'
import { translateRadioQuestionBlock } from './translateRadioQuestionBlock'
import { translateTextResponseBlock } from './translateTextResponseBlock'
import { translateTypographyBlock } from './translateTypographyBlock'

export async function translateCardBlock({
  blocks,
  cardBlock,
  cardAnalysis,
  sourceLanguageName,
  targetLanguageName,
  logger
}: {
  blocks: Block[]
  cardBlock: Block
  cardAnalysis: string
  sourceLanguageName: string
  targetLanguageName: string
  logger?: Logger
}): Promise<void> {
  const cardBlocksChildren = blocks.filter(
    ({ parentBlockId }) => parentBlockId === cardBlock.id
  )

  for (const block of cardBlocksChildren) {
    switch (block.typename) {
      case 'TypographyBlock':
        await translateTypographyBlock({
          block,
          cardAnalysis,
          sourceLanguageName,
          targetLanguageName,
          logger
        })
        break
      case 'ButtonBlock':
        await translateButtonBlock({
          block,
          cardAnalysis,
          sourceLanguageName,
          targetLanguageName,
          logger
        })
        break
      case 'RadioQuestionBlock':
        await translateRadioQuestionBlock({
          block,
          blocks,
          cardAnalysis,
          sourceLanguageName,
          targetLanguageName,
          logger
        })
        break
      case 'TextResponseBlock':
        await translateTextResponseBlock({
          block,
          cardAnalysis,
          sourceLanguageName,
          targetLanguageName,
          logger
        })
        break
    }
  }
}
