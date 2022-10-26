import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { orderBy, findIndex } from 'lodash'
import {
  TypographyBlock,
  CardBlock,
  StepBlock,
  TypographyVariant,
  Visitor
} from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async getStepHeader(parentBlockId: string): Promise<string> {
    const cardBlock: CardBlock = await (
      await this.db.query(aql`
      FOR block in blocks
        FILTER block._key == ${parentBlockId}
          LIMIT 1
          return block
    `)
    ).next()

    const typogsArray: TypographyBlock[] = await (
      await this.db.query(aql`
    FOR block in blocks
      FILTER block.__typename == "TypgoraphyBlock"
      AND block.parentBlockId == ${cardBlock.id} 
        return block
    `)
    ).all()

    const typog =
      typogsArray.length > 0
        ? typogsArray.reduce(findMostImportantTypographyBlock, null)
        : undefined

    if (typog != null) {
      return typog.content
    } else {
      const stepBlock: StepBlock = await (
        await this.db.query(aql`
        FOR block in blocks
          FILTER block._key == ${cardBlock.parentBlockId}
            LIMIT 1
            return block
      `)
      ).next()

      const steps: StepBlock[] = orderBy(
        await (
          await this.db.query(aql`
        FOR block in blocks
          FILTER block.__typename == "StepBlock"
              return block
      `)
        ).all(),
        ['parentOrder'],
        ['asc']
      )

      return getStepNumber(stepBlock.id, steps)
    }
  }

  @KeyAsId()
  async getVisitorByUserIdAndTeamId(
    userId: string,
    journeyId: string
  ): Promise<Visitor> {
    const res = await this.db.query(aql`
      FOR v in visitors
        FILTER v.key == ${userId}
        FOR j in journeys
          FILTER j.key == ${journeyId} AND j.teamId == v.teamId
          LIMIT 1
          RETURN v
    `)
    return await res.next()
  }
}

const orderedVariants: TypographyVariant[] = [
  TypographyVariant.overline,
  TypographyVariant.caption,
  TypographyVariant.body2,
  TypographyVariant.body1,
  TypographyVariant.subtitle2,
  TypographyVariant.subtitle1,
  TypographyVariant.h6,
  TypographyVariant.h5,
  TypographyVariant.h4,
  TypographyVariant.h3,
  TypographyVariant.h2,
  TypographyVariant.h1
]

function findMostImportantTypographyBlock(
  previous: TypographyBlock | null,
  current: TypographyBlock
): TypographyBlock | null {
  if (current.__typename !== 'TypographyBlock') return previous
  if (previous === null) return current

  const previousIndex = orderedVariants.findIndex(
    (variant) => variant === previous.variant
  )
  const currentIndex = orderedVariants.findIndex(
    (variant) => variant === current.variant
  )
  return currentIndex > previousIndex ? current : previous
}

function getStepNumber(stepId: string, steps: StepBlock[]): string {
  const index = findIndex(steps, { id: stepId })
  console.log(index)
  if (index === -1) {
    return 'Untitled'
  } else {
    return `Step number ${index + 1}`
  }
}
