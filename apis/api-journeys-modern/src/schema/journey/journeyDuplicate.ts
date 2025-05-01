import { GraphQLError } from 'graphql'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import {
  Block,
  Journey,
  Prisma,
  UserJourneyRole
} from '.prisma/api-journeys-modern-client'

import { BlockService } from '../../lib/block'
import { PlausibleQueueService } from '../../lib/plausible'
import { prisma } from '../../lib/prisma'
import { FIVE_DAYS, RevalidateQueueService } from '../../lib/revalidate'
import { builder } from '../builder'

type BlockWithAction = Block & { action: unknown | null }

export const journeyDuplicate = builder.mutationField('journeyDuplicate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Journey',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
      teamId: t.arg.string({ required: true })
    },
    resolve: async (query, _root, { id, teamId }, { user }) => {
      // Services initialization
      const blockService = new BlockService(prisma)
      const revalidateQueue = new RevalidateQueueService()
      const plausibleQueue = new PlausibleQueueService()

      // Find the journey to duplicate
      const journey = await prisma.journey.findUnique({
        where: { id },
        include: {
          userJourneys: true,
          journeyTags: true,
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Generate a new ID for the duplicated journey
      const duplicateJourneyId = uuidv4()

      // Find and duplicate all blocks associated with the journey
      const originalBlocks = await prisma.block.findMany({
        where: {
          journeyId: journey.id,
          typename: 'StepBlock',
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })

      // Create mapping for block IDs and handle menu step block
      let duplicateMenuStepBlockId: string | undefined
      const duplicateStepIds = new Map<string, string>()
      originalBlocks.forEach((block) => {
        const duplicateBlockId = uuidv4()
        if (journey.menuStepBlockId === block.id) {
          duplicateMenuStepBlockId = duplicateBlockId
        }
        duplicateStepIds.set(block.id, duplicateBlockId)
      })

      // Get duplicated blocks with all children
      const duplicateBlocks = await blockService.getDuplicateChildren(
        originalBlocks,
        id,
        null,
        true,
        duplicateStepIds,
        undefined,
        duplicateJourneyId,
        duplicateStepIds
      )

      // Handle primary image block duplication
      let duplicatePrimaryImageBlock: BlockWithAction | undefined
      if (journey.primaryImageBlockId != null) {
        const primaryImageBlock = await prisma.block.findUnique({
          where: { id: journey.primaryImageBlockId },
          include: { action: true }
        })
        if (primaryImageBlock != null) {
          const id = uuidv4()
          duplicatePrimaryImageBlock = {
            ...omit(primaryImageBlock, ['id']),
            id
          } as BlockWithAction

          duplicateBlocks.push(duplicatePrimaryImageBlock)
        }
      }

      // Handle logo image block duplication
      let duplicateLogoImageBlock: BlockWithAction | undefined
      if (journey.logoImageBlockId != null) {
        const logoImageBlock = await prisma.block.findUnique({
          where: { id: journey.logoImageBlockId },
          include: { action: true }
        })
        if (logoImageBlock != null) {
          const id = uuidv4()
          duplicateLogoImageBlock = {
            ...omit(logoImageBlock, ['id']),
            id
          } as BlockWithAction

          duplicateBlocks.push(duplicateLogoImageBlock)
        }
      }

      // Find a unique title for the duplicated journey
      const existingActiveDuplicateJourneys = await prisma.journey.findMany({
        where: {
          title: {
            contains: journey.title
          },
          archivedAt: null,
          trashedAt: null,
          deletedAt: null,
          template: false,
          team: { id: teamId }
        }
      })

      const duplicates = getJourneyDuplicateNumbers(
        existingActiveDuplicateJourneys,
        journey.title
      )
      const duplicateNumber = getFirstMissingNumber(duplicates)
      const duplicateTitle = `${journey.title}${
        duplicateNumber === 0
          ? ''
          : duplicateNumber === 1
            ? ' copy'
            : ` copy ${duplicateNumber}`
      }`.trimEnd()

      // Generate a slug for the journey
      let slug = slugify(duplicateTitle, {
        lower: true,
        strict: true
      })

      // Create the duplicated journey with retry mechanism for slug uniqueness
      let retry = true
      while (retry) {
        try {
          // Create the journey
          const duplicateJourney = await prisma.$transaction(async (tx) => {
            await tx.journey.create({
              data: {
                ...omit(journey, [
                  'primaryImageBlockId',
                  'creatorImageBlockId',
                  'creatorDescription',
                  'publishedAt',
                  'hostId',
                  'teamId',
                  'createdAt',
                  'strategySlug',
                  'journeyTags',
                  'logoImageBlockId',
                  'menuStepBlockId'
                ]),
                id: duplicateJourneyId,
                slug,
                title: duplicateTitle,
                status: journey.status,
                publishedAt: new Date(),
                featuredAt: null,
                template: false,
                team: { connect: { id: teamId } },
                userJourneys: {
                  create: {
                    userId: user.id,
                    role: UserJourneyRole.owner
                  }
                }
              }
            })

            return tx.journey.findUnique({
              where: { id: duplicateJourneyId },
              include: {
                userJourneys: true,
                team: {
                  include: { userTeams: true }
                }
              }
            })
          })

          if (duplicateJourney == null) {
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }

          // Save all blocks
          await blockService.saveAll(
            duplicateBlocks.map((block: BlockWithAction) => ({
              ...omit(block, [
                'journeyId',
                'parentBlockId',
                'posterBlockId',
                'coverBlockId',
                'nextBlockId',
                'action'
              ]),
              typename: block.typename,
              journey: {
                connect: { id: duplicateJourneyId }
              }
            }))
          )

          // Update block references
          for (const block of duplicateBlocks) {
            if (
              block.parentBlockId != null ||
              block.posterBlockId != null ||
              block.coverBlockId != null ||
              block.nextBlockId != null
            ) {
              await prisma.block.update({
                where: { id: block.id },
                data: {
                  parentBlockId: block.parentBlockId ?? undefined,
                  posterBlockId: block.posterBlockId ?? undefined,
                  coverBlockId: block.coverBlockId ?? undefined,
                  nextBlockId: block.nextBlockId ?? undefined
                }
              })
            }
            if (block.action != null && !isEmpty(block.action)) {
              await prisma.action.create({
                data: {
                  ...block.action,
                  parentBlockId: block.id
                }
              })
            }
          }

          // Update journey with image blocks and menu step block
          if (duplicatePrimaryImageBlock != null) {
            await prisma.journey.update({
              where: { id: duplicateJourneyId },
              data: { primaryImageBlockId: duplicatePrimaryImageBlock.id }
            })
          }
          if (duplicateLogoImageBlock != null) {
            await prisma.journey.update({
              where: { id: duplicateJourneyId },
              data: { logoImageBlockId: duplicateLogoImageBlock.id }
            })
          }
          if (duplicateMenuStepBlockId != null) {
            await prisma.journey.update({
              where: { id: duplicateJourneyId },
              data: { menuStepBlockId: duplicateMenuStepBlockId }
            })
          }

          // Create plausible sites for analytics
          await plausibleQueue.add(
            'create-journey-site',
            {
              __typename: 'plausibleCreateJourneySite',
              journeyId: duplicateJourneyId
            },
            {
              removeOnComplete: true,
              removeOnFail: { age: FIVE_DAYS, count: 50 }
            }
          )
          await plausibleQueue.add(
            'create-team-site',
            {
              __typename: 'plausibleCreateTeamSite',
              teamId
            },
            {
              removeOnComplete: true,
              removeOnFail: { age: FIVE_DAYS, count: 50 }
            }
          )

          retry = false
          return duplicateJourney
        } catch (err: any) {
          if (err.code === 'P2002') {
            // Prisma unique constraint error
            slug = slugify(`${slug}-${duplicateJourneyId}`)
          } else {
            retry = false
            throw err
          }
        }
      }
    }
  })
)

// Helper functions
function getFirstMissingNumber(arr: number[]): number {
  // May contain duplicate numbers in array so can't use binary search
  arr.sort((a, b) => a - b)
  let duplicateNumber = 0
  arr.forEach((num) => {
    if (num === duplicateNumber) duplicateNumber++
  })
  return duplicateNumber
}

function getJourneyDuplicateNumbers(
  journeys: Journey[],
  title: string
): number[] {
  return journeys.map((journey) => {
    if (journey.title === title) {
      return 0
    } else if (journey.title === `${title} copy`) {
      return 1
    } else {
      // Find the difference between duplicated journey and journey in list
      // titles, remove the "copy" to find duplicate number
      const modifier = journey.title.split(title)[1]?.split(' copy')
      const duplicate = modifier?.[1]?.trim() ?? ''
      const numbers = duplicate.match(/^\d+$/)
      // If no duplicate number found, it's a unique journey. Return 0
      return numbers != null ? Number.parseInt(numbers[0]) : 0
    }
  })
}
