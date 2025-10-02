import { builder } from '../../../builder'

import { MaxResolutionTierEnum } from './maxResolutionTierEnum'

export const MaxResolutionTier = builder.enumType('MaxResolutionTier', {
  values: Object.keys(MaxResolutionTierEnum)
})
