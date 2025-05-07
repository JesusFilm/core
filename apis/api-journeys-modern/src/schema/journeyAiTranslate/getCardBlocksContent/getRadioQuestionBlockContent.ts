import { Block } from '.prisma/api-journeys-modern-client'

export function getRadioQuestionBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = ''
  result += `## Radio Question List: \n Text: ${block.label}\n`
  const questions = blocks.filter(
    (childBlock) => childBlock.typename === 'RadioQuestionBlock'
  )
  for (const question of questions) {
    result += `- \n ${question.label}\n`
  }
  return result
}
