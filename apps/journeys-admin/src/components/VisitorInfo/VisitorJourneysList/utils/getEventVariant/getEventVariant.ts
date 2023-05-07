import { TypographyVariant } from '../../../../../../__generated__/globalTypes'

export enum EventVariant {
  default = 'default',
  featured = 'featured',
  chat = 'chat',
  title = 'title',
  start = 'start'
}

interface EventVariantStyle {
  textAlign: string | undefined
  durationColor: string
  activityColor: string
  valueColor: string
  iconColor: string
  durationVariant: TypographyVariant
  activityVariant: TypographyVariant
  valueVariant: TypographyVariant
}

export function getEventVariant(variant: EventVariant): EventVariantStyle {
  let res: EventVariantStyle = {
    textAlign: undefined,
    durationColor: 'text.secondary',
    activityColor: 'text.secondary',
    valueColor: 'text.secondary',
    iconColor: 'secondary.light',
    durationVariant: TypographyVariant.caption,
    activityVariant: TypographyVariant.body2,
    valueVariant: TypographyVariant.body2
  }

  switch (variant) {
    case 'title':
      res = {
        ...res,
        textAlign: 'center',
        valueColor: 'text.primary',
        durationVariant: TypographyVariant.body2,
        valueVariant: TypographyVariant.h3
      }
      break
    case 'chat':
      res = {
        ...res,
        durationColor: 'primary.main',
        activityColor: 'primary.main',
        valueColor: 'primary.main',
        iconColor: 'primary.main',
        valueVariant: TypographyVariant.subtitle1
      }
      break
    case 'featured':
      res = {
        ...res,
        valueColor: 'text.primary',
        activityVariant: TypographyVariant.body2,
        valueVariant: TypographyVariant.subtitle1
      }
      break
    case 'start':
      res = {
        ...res,
        valueColor: 'text.primary',
        valueVariant: TypographyVariant.subtitle1
      }
      break
  }

  return res
}
