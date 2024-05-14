/**
 * NavigateToJourneyAction is being removed. This script is to convert all
 * usages of the property to the LinkAction instead.
 */
import { Journey, PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

function urlFromJourneySlug(journey: Journey | null): string {
  if (journey?.slug == null) throw new Error('Journey slug is missing!')

  return `https://your.nextstep.is/${journey.slug}`
}

async function remediateNavigateToJourney(): Promise<void> {
  let offset = 0
  while (true) {
    const actions = await prisma.action.findMany({
      take: 100,
      skip: offset,
      include: { journey: true },
      where: { journeyId: { not: null } }
    })

    await Promise.all(
      actions.map(async (action) => {
        console.log(
          `transform NavigateToJourneyAction (parentBlockId: ${
            action.parentBlockId
          }, journeyId: ${
            action.journey?.id
          }) to LinkAction with url ${urlFromJourneySlug(action.journey)}`
        )
        return await prisma.action.update({
          where: { parentBlockId: action.parentBlockId },
          data: {
            gtmEventName: 'LinkAction',
            journeyId: null,
            url: urlFromJourneySlug(action.journey),
            target: null
          }
        })
      })
    )

    if (actions.length === 0) break

    offset += 100
  }
}

async function main(): Promise<void> {
  await remediateNavigateToJourney()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
