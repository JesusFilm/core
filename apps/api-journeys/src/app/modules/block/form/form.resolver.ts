import { subject } from '@casl/ability'
import { createClient } from '@formium/client'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Block } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  FormBlockCreateInput,
  FormBlockUpdateInput,
  FormiumForm,
  FormiumProject,
  Json
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { validateFormCredentials } from './validateFormCredentials'

@Resolver('FormBlock')
export class FormBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async formBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: FormBlockCreateInput
  ): Promise<Block> {
    const parentOrder = (
      await this.blockService.getSiblings(input.journeyId, input.parentBlockId)
    ).length

    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'parentBlockId', 'journeyId'),
          id: input.id ?? undefined,
          typename: 'FormBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          parentOrder
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })

      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      return block
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async formBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: FormBlockUpdateInput
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })

    const validatedInput = await validateFormCredentials({ input, block })
    return await this.blockService.update(id, validatedInput)
  }

  @ResolveField('projects')
  async projects(@Parent() { apiToken }: Block): Promise<FormiumProject[]> {
    if (apiToken === null) return []

    try {
      const projectsData =
        (await createClient('', { apiToken }).getMyProjects()).data ?? []

      return projectsData.map(({ id, name }) => ({ id, name }))
    } catch (e) {
      return []
    }
  }

  @ResolveField('forms')
  async forms(
    @Parent() { projectId, apiToken }: Block
  ): Promise<FormiumForm[]> {
    if (projectId == null || apiToken == null) return []

    try {
      const formsData =
        (await createClient(projectId, { apiToken }).findForms()).data ?? []

      return formsData.map(({ slug, name }) => ({ slug, name }))
    } catch (e) {
      return []
    }
  }

  @ResolveField('form')
  async form(
    @Parent() { projectId, apiToken, formSlug }: Block
  ): Promise<Json | null> {
    if (projectId == null || apiToken == null || formSlug == null) return null

    const formiumClient = createClient(projectId, {
      apiToken
    })

    try {
      return await formiumClient.getFormBySlug(formSlug)
    } catch (e) {
      return null
    }
  }

  @ResolveField('apiTokenExists')
  async apiTokenExists(@Parent() { apiToken }: Block): Promise<boolean> {
    return apiToken != null
  }
}
