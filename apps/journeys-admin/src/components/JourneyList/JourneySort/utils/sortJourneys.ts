import orderBy from 'lodash/orderBy'
import { SortOrder } from '../JourneySort'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'

export function sortJourneys(
  journeys: Journey[],
  sortOrder?: SortOrder
): Journey[] {
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? orderBy(
          journeys,
          [
            ({ title }) => {
              return title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase()
            }
          ],
          ['asc']
        )
      : orderBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return sortedJourneys
}
