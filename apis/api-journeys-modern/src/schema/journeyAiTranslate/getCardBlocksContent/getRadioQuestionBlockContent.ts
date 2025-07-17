import { Block } from '.prisma/api-journeys-modern-client'

export function getRadioQuestionBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = `
## Radio Question List:
- Block ID: ${block.id}

### Questions:
`
  const questions = blocks.filter(
    (childBlock) => childBlock.typename === 'RadioQuestionBlock'
  )
  for (const question of questions) {
    result += `- ${question.label}\n`
  }
  return result
}
