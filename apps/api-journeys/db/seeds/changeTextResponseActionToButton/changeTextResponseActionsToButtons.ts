import cliProgress from 'cli-progress'
import { v4 as uuid } from 'uuid'

import prisma from './client'

export async function changeTextResponseActionsToButtons(): Promise<void> {
  console.log('Starting text response block action migrations...')
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  const textResponseWithActions = await prisma.block.findMany({
    where: { action: { isNot: null }, typename: 'TextResponseBlock' },
    include: { action: true }
  })
  if (!Array.isArray(textResponseWithActions)) {
    console.warn(
      'textResponseWithActions is not an array:',
      textResponseWithActions
    )
    return
  }

  bar1.start(textResponseWithActions.length, 0)

  for (const textResponse of textResponseWithActions) {
    try {
      const id = uuid()
      await prisma.$transaction(
        async (tx) => {
          if (textResponse.parentOrder == null)
            throw new Error(`missing parentOrder for: ${textResponse.id}`)
          if (textResponse.parentBlockId == null)
            throw new Error(`missing parentBlockId for: ${textResponse.id}`)
          if (textResponse.action == null)
            throw new Error(`missing action for: ${textResponse.id}`)

          // create button block
          const buttonBlock = await tx.block.create({
            data: {
              id,
              typename: 'ButtonBlock',
              journey: { connect: { id: textResponse.journeyId } },
              parentBlock: {
                connect: { id: textResponse.parentBlockId }
              },
              // parentOrder: textResponse.parentOrder + 1,
              label: textResponse.submitLabel ?? 'Submit',
              startIconId: textResponse.submitIconId
            },
            include: { action: true }
          })
          // re order blocks
          const siblingBlocks = await tx.block.findMany({
            where: {
              journeyId: textResponse.journeyId,
              parentBlockId: textResponse.parentBlockId,
              parentOrder: { not: null }
            },
            orderBy: { parentOrder: 'asc' },
            include: { action: true }
          })
          siblingBlocks.splice(textResponse.parentOrder + 1, 0, buttonBlock)
          // update parentblockId
          const updatedSiblings = siblingBlocks.map((block, index) => ({
            ...block,
            parentOrder: index
          }))
          await Promise.all(
            updatedSiblings.map(
              async (block) =>
                await tx.block.update({
                  where: { id: block.id },
                  data: { parentOrder: block.parentOrder },
                  include: { action: true }
                })
            )
          )
          // update action
          await tx.action.update({
            where: { parentBlockId: textResponse.action.parentBlockId },
            data: {
              ...textResponse.action,
              parentBlockId: buttonBlock.id
            }
          })
          // if submit icon exists, update icon block
          if (textResponse.submitIconId != null) {
            await tx.block.update({
              where: { id: textResponse.submitIconId },
              data: { parentBlockId: buttonBlock.id }
            })
            // finally update textResponse
            await tx.block.update({
              where: { id: textResponse.id },
              data: {
                submitIconId: null
              }
            })
          }
        },
        {
          maxWait: 10000, // default: 2000
          timeout: 20000 // default: 5000
        }
      )
      bar1.increment()
    } catch (e) {
      throw new Error(e.message as string)
    }
  }
  bar1.stop()
}

async function main(): Promise<void> {
  await changeTextResponseActionsToButtons()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
