import orderBy from 'lodash/orderBy'
import { SortOrder } from '../JourneySort'
import { GetActiveJourneys_journeys as ActiveJourney } from '../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys_journeys as ArchivedJourney } from '../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys_journeys as TrashedJourney } from '../../../../../__generated__/GetTrashedJourneys'
import { GetActivePublisherTemplates_journeys as ActiveTemplate } from '../../../../../__generated__/GetActivePublisherTemplates'
import { GetArchivedPublisherTemplates_journeys as ArchivedTemplate } from '../../../../../__generated__/GetArchivedPublisherTemplates'
import { GetTrashedPublisherTemplates_journeys as TrashedTemplate } from '../../../../../__generated__/GetTrashedPublisherTemplates'

export function sortJourneys(
  journeys: Array<
    | ActiveJourney
    | ArchivedJourney
    | TrashedJourney
    | ActiveTemplate
    | ArchivedTemplate
    | TrashedTemplate
  >,
  sortOrder?: SortOrder
): Array<
  | ActiveJourney
  | ArchivedJourney
  | TrashedJourney
  | ActiveTemplate
  | ArchivedTemplate
  | TrashedTemplate
> {
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? orderBy(
          journeys,
          [
            ({ title }) => {
              const noSpecialCharacters = title.replace(/[^a-zA-Z0-9 ]/g, '')
              return noSpecialCharacters.toLowerCase()
            }
          ],
          ['asc']
        )
      : orderBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return sortedJourneys
}
