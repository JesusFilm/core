import orderBy from 'lodash/orderBy'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { SortOrder } from '../JourneySort'

export function sortJourneys(
  journeys: Journey[],
  sortOrder?: SortOrder
): Journey[] {
  if (sortOrder === SortOrder.TITLE) {
    return orderBy(
      journeys,
      [
        ({ title }) => {
          return title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase()
        }
      ],
      ['asc']
    )
  } else if (sortOrder === SortOrder.CREATED_AT) {
    return orderBy(journeys, ({ createdAt }) =>
      new Date(createdAt as string).getTime()
    ).reverse()
  } else {
    return orderBy(journeys, ({ updatedAt }) =>
      new Date(updatedAt as string).getTime()
    ).reverse()
  }
}
