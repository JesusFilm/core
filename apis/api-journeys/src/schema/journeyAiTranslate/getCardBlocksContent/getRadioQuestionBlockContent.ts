import { Block } from '@core/prisma/journeys/client'

export function getRadioQuestionBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = `
## Radio Question:
- Block ID: ${block.id}
${block.label != null && block.label !== '' ? `- Question: ${block.label}\n` : ''}
### Options:
`
  const options = blocks.filter(
    (childBlock) =>
      childBlock.parentBlockId === block.id &&
      childBlock.typename === 'RadioOptionBlock'
  )
  for (const option of options) {
    result += `- ${option.label}\n`
  }
  return result
}
