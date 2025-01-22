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
      : sortOrder === SortOrder.UPDATED_AT
        ? orderBy(journeys, ({ updatedAt }) =>
            new Date(updatedAt as string).getTime()
          ).reverse()
        : orderBy(journeys, ({ createdAt }) =>
            new Date(createdAt as string).getTime()
          ).reverse()

  return sortedJourneys
}
