import { builder } from '../../../builder'

export enum MaxResolutionTierEnum {
  fhd = '1080p',
  qhd = '1440p',
  uhd = '2160p'
}

export const MaxResolutionTier = builder.enumType('MaxResolutionTier', {
  values: Object.keys(MaxResolutionTierEnum)
})
