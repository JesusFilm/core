import { builder } from '../../builder'

export const JourneysReportTypeEnum = builder.enumType('JourneysReportType', {
  values: [
    'multipleFull',
    'multipleSummary',
    'singleFull',
    'singleSummary'
  ] as const
})
