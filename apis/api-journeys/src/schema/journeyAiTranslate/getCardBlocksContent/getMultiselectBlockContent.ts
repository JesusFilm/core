import { Block } from '@core/prisma/journeys/client'

export function getMultiselectBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = `
## Multiselect Question:
- Block ID: ${block.id}
${block.label != null && block.label !== '' ? `- Question: ${block.label}\n` : ''}
### Options:
`
  const options = blocks.filter(
    (childBlock) =>
      childBlock.parentBlockId === block.id &&
      childBlock.typename === 'MultiselectOptionBlock'
  )
  for (const option of options) {
    result += `- ${option.label}\n`
  }
  return result
}
