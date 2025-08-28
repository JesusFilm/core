import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../builder'

import { Block } from './block'
import { BlockDuplicateIdMapInput } from './inputs'

builder.mutationField('blockDuplicate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description:
      'blockDuplicate returns the updated block, its children and sibling blocks on successful duplicate',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({
        type: 'Int',
        required: false,
        description:
          'parentOrder defines the position to add the duplicated block. Negative values defines the position from the end of the array. Positions greater than the length of the array or null parentOrder will add duplicate at end of the array.'
      }),
      idMap: t.arg({
        type: [BlockDuplicateIdMapInput],
        required: false,
        description:
          'idMap is used to set custom ids for the duplicated block and its descendants.'
      }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      x: t.arg({
        type: 'Int',
        required: false,
        description:
          'x is used to position a step block block horizontally in the journey flow diagram on the editor.'
      }),
      y: t.arg({
        type: 'Int',
        required: false,
        description:
          'y is used to position a step block block vertically in the journey flow diagram on the editor.'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder, idMap, x, y } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to duplicate block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const duplicateId = uuidv4()
        const isStepBlock = blockWithJourney.typename === 'StepBlock'

        // TODO: Implement full block duplication logic similar to legacy BlockService
        // For now, create a simple duplicate
        const duplicateData: any = {
          ...blockWithJourney,
          id: duplicateId,
          parentOrder: parentOrder ?? (blockWithJourney.parentOrder ?? 0) + 1
        }

        if (isStepBlock && x !== undefined) {
          duplicateData.x = x
        }
        if (isStepBlock && y !== undefined) {
          duplicateData.y = y
        }

        // Remove fields that shouldn't be duplicated
        delete duplicateData.action
        delete duplicateData.journey
        delete duplicateData.createdAt
        delete duplicateData.updatedAt
        delete duplicateData.deletedAt

        const duplicatedBlock = await tx.block.create({
          data: duplicateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Return siblings including the new duplicate
        const siblings = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            parentBlockId: blockWithJourney.parentBlockId,
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)
