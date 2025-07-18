import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

interface JourneyVisitorFilter {
  journeyId: string
  hasChatStarted?: boolean | null
  hasPollAnswers?: boolean | null
  hasTextResponse?: boolean | null
  hasIcon?: boolean | null
  hideInactive?: boolean | null
  countryCode?: string | null
}

export class VisitorService {
  generateJourneyVisitorWhere(
    filter: JourneyVisitorFilter
  ): Prisma.JourneyVisitorWhereInput {
    return omitBy(
      {
        journeyId: filter.journeyId,
        lastChatStartedAt:
          filter?.hasChatStarted === true ? { not: null } : undefined,
        lastRadioQuestion:
          filter?.hasPollAnswers === true ? { not: null } : undefined,
        lastTextResponse:
          filter?.hasTextResponse === true ? { not: null } : undefined,
        activityCount: filter?.hideInactive === true ? { gt: 0 } : undefined,
        visitor:
          filter?.hasIcon === true || filter?.countryCode != null
            ? omitBy(
                {
                  status: filter?.hasIcon === true ? { not: null } : undefined,
                  countryCode:
                    filter?.countryCode != null
                      ? { contains: filter.countryCode }
                      : undefined
                },
                isNil
              )
            : undefined
      },
      isNil
    )
  }
}
