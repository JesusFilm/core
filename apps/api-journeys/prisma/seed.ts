import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const journey = await prisma.journey.create({
    data: {
      title: 'Test Journey',
      published: true
    }
  })
  const step = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock'
    }
  })
  const question = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: step.id,
      extraAttrs: { label: 'Test Question', description: 'description', variant: 'DARK' }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: { label: 'Answer 1' }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question.id,
      extraAttrs: { label: 'Answer 2' }
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().catch(noop)
  })
