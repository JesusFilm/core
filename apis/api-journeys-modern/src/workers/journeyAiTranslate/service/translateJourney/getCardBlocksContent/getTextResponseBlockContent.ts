import { Block } from '.prisma/api-journeys-modern-client'

export function getTextResponseBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = ''
  result += `## Text Input: \n`
  result += `Label: \n ${block.label}\n`
  result += `Input Placeholder Text: \n ${block.placeholder}\n`
  result += `Required: \n ${block.required}\n`
  if (block.submitLabel != null) {
    result += `\n## Submit Button :\n Label: ${block.submitLabel}\n`
    if (block.submitIconId != null) {
      const submitIcon = blocks.find(
        (childBlock) => childBlock.id === block.submitIconId
      )
      if (submitIcon) {
        result += `Icon: \n ${submitIcon.name}\n`
      }
    }
  }
  return result
}
