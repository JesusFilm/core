import orderBy from 'lodash/orderBy'
import { SortOrder } from '../JourneySort'
import { GetActiveJourneys_journeys as ActiveJourney } from '../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys_journeys as ArchivedJourney } from '../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys_journeys as TrashedJourney } from '../../../../../__generated__/GetTrashedJourneys'

export function sortJourneys(
  journeys: Array<ActiveJourney | ArchivedJourney | TrashedJourney>,
  sortOrder?: SortOrder
): Array<ActiveJourney | ArchivedJourney | TrashedJourney> {
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? orderBy(
          journeys,
          [({ title }) => title.toLowerCase()[0], ({ title }) => title],
          ['asc', 'asc']
        )
      : orderBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return sortedJourneys
}
