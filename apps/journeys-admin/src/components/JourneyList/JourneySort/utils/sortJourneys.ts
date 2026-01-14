import orderBy from 'lodash/orderBy'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { SortOrder } from '../JourneySort'

import { getRecentlyOpenedJourney } from './trackRecentlyOpenedJourney'

export function sortJourneys(
  journeys: Journey[],
  sortOrder?: SortOrder
): Journey[] {
  const recentlyOpened = getRecentlyOpenedJourney()
  const recentlyOpenedJourneyId = recentlyOpened?.journeyId

  // Separate recently opened journey from others
  const recentlyOpenedJourney =
    recentlyOpenedJourneyId != null
      ? journeys.find((j) => j.id === recentlyOpenedJourneyId)
      : null
  const otherJourneys =
    recentlyOpenedJourneyId != null
      ? journeys.filter((j) => j.id !== recentlyOpenedJourneyId)
      : journeys

  let sortedOtherJourneys: Journey[]

  if (sortOrder === SortOrder.TITLE) {
    sortedOtherJourneys = orderBy(
      otherJourneys,
      [
        ({ title }) => {
          return title.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase()
        }
      ],
      ['asc']
    )
  } else if (sortOrder === SortOrder.CREATED_AT) {
    sortedOtherJourneys = orderBy(otherJourneys, ({ createdAt }) =>
      new Date(createdAt as string).getTime()
    ).reverse()
  } else {
    sortedOtherJourneys = orderBy(otherJourneys, ({ updatedAt }) =>
      new Date(updatedAt as string).getTime()
    ).reverse()
  }

  // Put recently opened journey first, then the rest
  return recentlyOpenedJourney != null
    ? [recentlyOpenedJourney, ...sortedOtherJourneys]
    : sortedOtherJourneys
}
