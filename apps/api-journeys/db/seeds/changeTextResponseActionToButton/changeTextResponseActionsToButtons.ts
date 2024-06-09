import cliProgress from 'cli-progress'

import prisma from './client'

export async function changeTextResponseActionsToButtons(): Promise<void> {
  console.log('Starting text response block action migrations...')
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  const textResponseWithActions = await prisma.block.findMany({
    where: { action: { isNot: null }, typename: 'TextResponseBlock' }
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
    await prisma.$transaction(
      async (tx) => {
        if (textResponse.parentOrder == null)
          throw new Error(`missing parentOrder for: ${textResponse.id}`)
        if (textResponse.parentBlockId == null)
          throw new Error(`missing parentBlockId for: ${textResponse.id}`)

        // create button block
        const buttonBlock = await tx.block.create({
          data: {
            typename: 'ButtonBlock',
            journey: { connect: { id: textResponse.journeyId } },
            parentBlock: {
              connect: { id: textResponse.parentBlockId }
            },
            label: textResponse.submitLabel ?? 'Submit',
            startIconId: textResponse.submitIconId
          }
        })
        // re order blocks
        const siblingBlocks = await tx.block.findMany({
          where: {
            journeyId: textResponse.journeyId,
            parentBlockId: textResponse.parentBlockId,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' }
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
                data: { parentOrder: block.parentOrder }
              })
          )
        )
        // update action
        await tx.action.update({
          where: { parentBlockId: textResponse.id },
          data: {
            parentBlockId: buttonBlock.id
          }
        })
        // if submit icon exists, update icon block
        if (textResponse.submitIconId != null) {
          const iconBlock = await tx.block.update({
            where: { id: textResponse.submitIconId },
            data: { parentBlockId: buttonBlock.id }
          })
          await tx.block.update({
            where: { id: buttonBlock.id },
            data: { startIconId: iconBlock.id }
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
        maxWait: 1000000, // default: 2000
        timeout: 2000000 // default: 5000
      }
    )
    bar1.increment()
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
