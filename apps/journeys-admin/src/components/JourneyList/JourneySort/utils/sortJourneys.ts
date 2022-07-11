import orderBy from 'lodash/orderBy'
import { SortOrder } from '../JourneySort'
import { GetActiveJourneys_journeys as ActiveJourneys } from '../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys_journeys as ArchivedJourneys } from '../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys_journeys as TrashedJourneys } from '../../../../../__generated__/GetTrashedJourneys'

export function sortJourneys(
  journeys: Array<ActiveJourneys | ArchivedJourneys | TrashedJourneys>,
  sortOrder?: SortOrder
): Array<ActiveJourneys | ArchivedJourneys | TrashedJourneys> {
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
