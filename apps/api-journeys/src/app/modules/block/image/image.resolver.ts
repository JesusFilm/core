import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-errors'
import { encode } from 'blurhash'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { omit } from 'lodash'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'

import { BlockService } from '../block.service'
import {
  ImageBlock,
  ImageBlockCreateInput,
  ImageBlockUpdateInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import { PrismaService } from '../../../lib/prisma.service'

export async function handleImage(
  input
): Promise<ImageBlockCreateInput | ImageBlockUpdateInput> {
  if (
    (input.width ?? 0) > 0 &&
    (input.height ?? 0) > 0 &&
    (input.blurhash ?? '').length > 0
  ) {
    return input
  }

  const defaultBlock = {
    ...input,
    width: 0,
    height: 0,
    blurhash: ''
  }
  if (input.src == null) return defaultBlock

  try {
    const response = await fetch(input.src)
    const buffer = await response.buffer()
    const { data: pixels, info: metadata } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true })
    defaultBlock.width = metadata.width
    defaultBlock.height = metadata.height
    const data = new Uint8ClampedArray(pixels)
    defaultBlock.blurhash = encode(
      data,
      defaultBlock.width,
      defaultBlock.height,
      4,
      4
    )
  } catch (ex) {
    throw new UserInputError(ex.message, {
      argumentName: 'src'
    })
  }

  const block = {
    ...input,
    width: defaultBlock.width,
    height: defaultBlock.height,
    blurhash: defaultBlock.blurhash
  }

  return block
}

@Resolver('ImageBlock')
export class ImageBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  @FromPostgresql()
  async imageBlockCreate(
    @Args('input') input: ImageBlockCreateInput
  ): Promise<ImageBlock> {
    const block = (await handleImage(input)) as ImageBlockCreateInput

    if (block.isCover === true) {
      const coverBlock: ImageBlock = await this.blockService.save({
        ...omit(block, ['journeyId', '__typename']),
        id: block.id ?? undefined,
        typename: 'ImageBlock',
        journey: { connect: { id: block.journeyId } },
        parentOrder: null
      })
      const parentBlock = await this.prismaService.block.findUnique({
        where: {
          id: block.parentBlockId
        },
        include: { action: true }
      })

      if (parentBlock == null) {
        throw new Error('Parent block not found')
      }

      await this.blockService.update(parentBlock.id, {
        coverBlockId: coverBlock.id
      })
      // Delete old coverBlock
      if (parentBlock.coverBlockId != null) {
        const coverBlockToDelete = await this.prismaService.block.findUnique({
          where: {
            id: parentBlock.coverBlockId
          },
          include: { action: true }
        })
        if (coverBlockToDelete != null) {
          await this.blockService.removeBlockAndChildren(
            parentBlock.coverBlockId,
            parentBlock.journeyId
          )
        }
      }

      return coverBlock
    }

    const siblings = await this.blockService.getSiblings(
      block.journeyId,
      block.parentBlockId
    )
    return await this.blockService.save({
      ...omit(block, ['journeyId', '__typename']),
      id: block.id ?? undefined,
      typename: 'ImageBlock',
      journey: { connect: { id: block.journeyId } },
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async imageBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ImageBlockUpdateInput
  ): Promise<ImageBlock> {
    const block = await handleImage(input)
    return await this.blockService.update(id, { ...block, id })
  }
}
