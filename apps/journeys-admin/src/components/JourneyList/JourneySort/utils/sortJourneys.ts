import orderBy from 'lodash/orderBy'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { SortOrder } from '../JourneySort'

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
