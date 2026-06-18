import { GraphQLError } from 'graphql'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import {
  Block,
  Action as BlockAction,
  JourneyStatus,
  UserJourneyRole,
  prisma
} from '@core/prisma/journeys/client'

import { queue as plausibleQueue } from '../../workers/plausible/queue'
import { builder } from '../builder'

import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

type BlockWithAction = Block & { action: BlockAction | null }

function getFirstMissingNumber(arr: number[]): number {
  arr.sort((a, b) => a - b)
  let num = 0
  for (const val of arr) {
    if (val === num) num++
  }
  return num
}

function getDuplicateTitle(
  existingTitles: string[],
  originalTitle: string
): string {
  const duplicates = existingTitles.map((title) => {
    if (title === originalTitle) return 0
    if (title === `${originalTitle} copy`) return 1
    const modifier = title.split(originalTitle)[1]?.split(' copy')
    const dup = modifier?.[1]?.trim() ?? ''
    const numbers = dup.match(/^\d+$/)
    return numbers != null ? Number.parseInt(numbers[0]) : 0
  })
  const duplicateNumber = getFirstMissingNumber(duplicates)
  return `${originalTitle}${
    duplicateNumber === 0
      ? ''
      : duplicateNumber === 1
        ? ' copy'
        : ` copy ${duplicateNumber}`
  }`.trimEnd()
}

async function getDuplicateBlockAndChildren(
  id: string,
  journeyId: string,
  parentBlockId: string | null,
  duplicateId: string | undefined,
  duplicateJourneyId: string,
  duplicateStepIds: Map<string, string>
): Promise<BlockWithAction[]> {
  const block = await prisma.block.findUnique({
    where: { id, deletedAt: null },
    include: { action: true }
  })
  if (block == null) throw new Error("Block doesn't exist")

  const duplicateBlockId = duplicateId ?? uuidv4()

  const children = await prisma.block.findMany({
    where: { parentBlockId: block.id, journeyId, deletedAt: null },
    include: { action: true },
    orderBy: { parentOrder: 'asc' }
  })

  const childIds = new Map<string, string>()
  for (const child of children) {
    childIds.set(child.id, uuidv4())
  }

  const updatedBlockProps: Record<string, unknown> = {}
  for (const key of Object.keys(block)) {
    if (key === 'nextBlockId') {
      updatedBlockProps[key] =
        block.nextBlockId != null
          ? (duplicateStepIds.get(block.nextBlockId) ?? null)
          : null
    } else if (key.includes('BlockId') || key.includes('IconId')) {
      const blockId: string | null | undefined = (block as any)[key]
      updatedBlockProps[key] =
        blockId != null ? (childIds.get(blockId) ?? null) : null
    }
    if (key === 'action') {
      const action = omit(
        block.action,
        'parentBlockId'
      ) as unknown as BlockAction
      updatedBlockProps[key] =
        action?.blockId != null
          ? {
              ...action,
              blockId: duplicateStepIds.get(action.blockId) ?? action.blockId
            }
          : action
    }
  }

  const duplicateBlock: BlockWithAction = {
    ...block,
    ...(updatedBlockProps as Partial<BlockWithAction>),
    id: duplicateBlockId,
    journeyId: duplicateJourneyId,
    parentBlockId
  }

  const duplicateChildren: BlockWithAction[] = []
  for (const child of children) {
    const childDuplicates = await getDuplicateBlockAndChildren(
      child.id,
      journeyId,
      duplicateBlockId,
      childIds.get(child.id),
      duplicateJourneyId,
      duplicateStepIds
    )
    duplicateChildren.push(...childDuplicates)
  }

  return [duplicateBlock, ...duplicateChildren]
}

builder.mutationField('journeyDuplicate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        teamId: t.arg({ type: 'ID', required: true }),
        forceNonTemplate: t.arg.boolean({ required: false }),
        duplicateAsDraft: t.arg.boolean({ required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const { id, teamId } = args
        const userId = context.user.id

        const journey = await prisma.journey.findUnique({
          where: { id: String(id) },
          include: {
            userJourneys: true,
            journeyTags: true,
            team: { include: { userTeams: true } },
            journeyCustomizationFields: true,
            journeyTheme: true,
            chatButtons: true
          }
        })
        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (!journeyAcl(Action.Read, journey, context.user))
          throw new GraphQLError('user is not allowed to duplicate journey', {
            extensions: { code: 'FORBIDDEN' }
          })

        const duplicateJourneyId = uuidv4()

        const originalBlocks = await prisma.block.findMany({
          where: {
            journeyId: journey.id,
            typename: 'StepBlock',
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })

        let duplicateMenuStepBlockId: string | undefined
        const duplicateStepIds = new Map<string, string>()
        for (const block of originalBlocks) {
          const duplicateBlockId = uuidv4()
          if (journey.menuStepBlockId === block.id) {
            duplicateMenuStepBlockId = duplicateBlockId
          }
          duplicateStepIds.set(block.id, duplicateBlockId)
        }

        const duplicateBlocks: BlockWithAction[] = []
        for (const block of originalBlocks) {
          const blockDuplicates = await getDuplicateBlockAndChildren(
            block.id,
            String(id),
            null,
            duplicateStepIds.get(block.id),
            duplicateJourneyId,
            duplicateStepIds
          )
          duplicateBlocks.push(...blockDuplicates)
        }

        let duplicatePrimaryImageBlock: BlockWithAction | undefined
        if (journey.primaryImageBlockId != null) {
          const primaryImageBlock = await prisma.block.findUnique({
            where: { id: journey.primaryImageBlockId },
            include: { action: true }
          })
          if (primaryImageBlock != null) {
            const newId = uuidv4()
            duplicatePrimaryImageBlock = { ...primaryImageBlock, id: newId }
            duplicateBlocks.push(duplicatePrimaryImageBlock)
          }
        }

        let duplicateLogoImageBlock: BlockWithAction | undefined
        if (journey.logoImageBlockId != null) {
          const logoImageBlock = await prisma.block.findUnique({
            where: { id: journey.logoImageBlockId },
            include: { action: true }
          })
          if (logoImageBlock != null) {
            const newId = uuidv4()
            duplicateLogoImageBlock = { ...logoImageBlock, id: newId }
            duplicateBlocks.push(duplicateLogoImageBlock)
          }
        }

        const existingDuplicateJourneys = await prisma.journey.findMany({
          where: {
            title: { contains: journey.title },
            trashedAt: null,
            deletedAt: null,
            template: false,
            team: { id: String(teamId) }
          }
        })
        const duplicateTitle = getDuplicateTitle(
          existingDuplicateJourneys.map((j) => j.title),
          journey.title
        )

        let slug = slugify(duplicateTitle, { lower: true, strict: true })

        const duplicateCustomizationFields =
          journey.journeyCustomizationFields.map((field) => ({
            ...field,
            id: uuidv4(),
            journeyId: duplicateJourneyId
          }))
        const isLocalTemplate =
          journey.teamId !== 'jfp-team' && journey.template
        const duplicateAsTemplate = args.forceNonTemplate
          ? false
          : isLocalTemplate
        const duplicateStatus =
          args.duplicateAsDraft === true
            ? JourneyStatus.draft
            : JourneyStatus.published

        let retry = true
        while (retry) {
          try {
            const duplicateJourney = await prisma.$transaction(async (tx) => {
              await tx.journey.create({
                data: {
                  ...(omit(journey, [
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
                    'menuStepBlockId',
                    'journeyCustomizationFields',
                    'journeyTheme',
                    'templateSite',
                    'customizable',
                    'chatButtons'
                  ]) as any),
                  id: duplicateJourneyId,
                  slug,
                  title: duplicateTitle,
                  status: duplicateStatus,
                  publishedAt:
                    duplicateStatus === JourneyStatus.published
                      ? new Date()
                      : null,
                  featuredAt: null,
                  archivedAt: null,
                  trashedAt: null,
                  deletedAt: null,
                  template: duplicateAsTemplate,
                  customizable: duplicateAsTemplate
                    ? (journey.customizable ?? false)
                    : false,
                  fromTemplateId: journey.template
                    ? String(id)
                    : (journey.fromTemplateId ?? null),
                  team: { connect: { id: String(teamId) } },
                  userJourneys: {
                    create: {
                      userId,
                      role: UserJourneyRole.owner
                    }
                  }
                }
              })

              await tx.journeyCustomizationField.createMany({
                data: duplicateCustomizationFields
              })

              const created = await tx.journey.findUnique({
                where: { id: duplicateJourneyId },
                include: {
                  userJourneys: true,
                  team: { include: { userTeams: true } }
                }
              })
              if (created == null)
                throw new GraphQLError('journey not found', {
                  extensions: { code: 'NOT_FOUND' }
                })
              if (!journeyAcl(Action.Create, created, context.user))
                throw new GraphQLError(
                  'user is not allowed to duplicate journey',
                  { extensions: { code: 'FORBIDDEN' } }
                )
              return created
            })

            const OMITTED_BLOCK_FIELDS = ['__typename', 'journeyId', 'isCover']
            await Promise.all(
              duplicateBlocks.map(async (block) => {
                await prisma.block.create({
                  data: {
                    ...(omit(block, [
                      ...OMITTED_BLOCK_FIELDS,
                      'journeyId',
                      'parentBlockId',
                      'posterBlockId',
                      'coverBlockId',
                      'pollOptionImageBlockId',
                      'nextBlockId',
                      'action'
                    ]) as any),
                    typename: block.typename,
                    journey: { connect: { id: duplicateJourneyId } },
                    settings: block.settings ?? {}
                  }
                })
              })
            )

            for (const block of duplicateBlocks) {
              if (
                block.parentBlockId != null ||
                block.posterBlockId != null ||
                block.coverBlockId != null ||
                block.nextBlockId != null ||
                block.pollOptionImageBlockId != null
              ) {
                await prisma.block.update({
                  where: { id: block.id },
                  data: {
                    parentBlockId: block.parentBlockId ?? undefined,
                    posterBlockId: block.posterBlockId ?? undefined,
                    coverBlockId: block.coverBlockId ?? undefined,
                    nextBlockId: block.nextBlockId ?? undefined,
                    pollOptionImageBlockId:
                      block.pollOptionImageBlockId ?? undefined
                  }
                })
              }
              if (block.action != null && !isEmpty(block.action)) {
                await prisma.action.create({
                  data: {
                    ...block.action,
                    customizable: block.action.customizable ?? false,
                    parentStepId:
                      block.action.parentStepId != null
                        ? (duplicateStepIds.get(block.action.parentStepId) ??
                          null)
                        : null,
                    parentBlockId: block.id
                  }
                })
              }
            }

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
            if (journey.journeyTheme != null) {
              await prisma.journeyTheme.create({
                data: {
                  journeyId: duplicateJourneyId,
                  userId,
                  headerFont: journey.journeyTheme.headerFont,
                  bodyFont: journey.journeyTheme.bodyFont,
                  labelFont: journey.journeyTheme.labelFont
                }
              })
            }
            for (const chatButton of journey.chatButtons) {
              await prisma.chatButton.create({
                data: {
                  id: uuidv4(),
                  journeyId: duplicateJourneyId,
                  link: chatButton.link,
                  platform: chatButton.platform,
                  customizable: chatButton.customizable
                }
              })
            }

            retry = false

            const FIVE_DAYS = 5 * 24 * 60 * 60
            void plausibleQueue.add(
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
            void plausibleQueue.add(
              'create-team-site',
              {
                __typename: 'plausibleCreateTeamSite',
                teamId: String(teamId)
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: FIVE_DAYS, count: 50 }
              }
            )

            return await prisma.journey.findUniqueOrThrow({
              ...query,
              where: { id: duplicateJourney.id }
            })
          } catch (err: any) {
            if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
              slug = slugify(`${slug}-${duplicateJourneyId}`)
            } else {
              retry = false
              throw err
            }
          }
        }

        throw new GraphQLError('failed to duplicate journey', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    })
)
