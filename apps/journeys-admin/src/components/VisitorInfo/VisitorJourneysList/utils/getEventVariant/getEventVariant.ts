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
  valueColor: string
  iconColor: string
  durationVariant: TypographyVariant
  activityVariant: number
  valueVariant: TypographyVariant
}

export function getEventVariant(variant: EventVariant): EventVariantStyle {
  let res: EventVariantStyle = {
    textAlign: undefined,
    durationColor: 'text.secondary',
    valueColor: 'text.secondary',
    iconColor: 'secondary.light',
    durationVariant: TypographyVariant.caption,
    activityVariant: 400,
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
        valueColor: 'primary.main',
        iconColor: 'primary.main',
        activityVariant: 600,
        valueVariant: TypographyVariant.subtitle1
      }
      break
    case 'featured':
      res = {
        ...res,
        valueColor: 'text.primary',
        activityVariant: 600,
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
