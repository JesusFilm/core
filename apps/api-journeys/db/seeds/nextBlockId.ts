import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

export async function nextBlockId(): Promise<void> {
  // search all journeys in our database
  // in each journey search all the nextBlockId
  // if nextBlockId is null and there is a sibling after it
  // update nextBlockId to sibling after
  const journeys = await prisma.journey.findMany({
    include: {
      blocks: true
    }
  })

  function updateNextBlockId(journey): void {
    console.log('journey', journey)
  }
  // iterate through journeys and find all step blocks
  const steps = journeys.map((journey) =>
    journey.blocks.find((block) => block.typename === 'StepBlock')
  )

  // await.prisma.journey.upsert({})

  console.log('steps', steps)
}
