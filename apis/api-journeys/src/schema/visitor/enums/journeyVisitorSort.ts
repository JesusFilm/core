import { builder } from '../../builder'

export const JourneyVisitorSort = builder.enumType('JourneyVisitorSort', {
  values: ['date', 'duration', 'activity'] as const
})
