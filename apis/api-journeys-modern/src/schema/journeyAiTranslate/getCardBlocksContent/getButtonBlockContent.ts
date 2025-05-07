import { Block } from '.prisma/api-journeys-modern-client'

export function getButtonBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = ''
  result += `## Button: \n`
  if (block.startIconId) {
    const startIcon = blocks.find(
      (childBlock) => childBlock.id === block.startIconId
    )
    if (startIcon) {
      result += `Start Icon Name: \n ${startIcon.name}\n`
    }
  }
  result += `Button Label: \n ${block.label}\n`
  if (block.endIconId) {
    const endIcon = blocks.find(
      (childBlock) => childBlock.id === block.endIconId
    )
    if (endIcon) {
      result += `End Icon Name: \n ${endIcon.name}\n`
    }
  }
  return result
}
