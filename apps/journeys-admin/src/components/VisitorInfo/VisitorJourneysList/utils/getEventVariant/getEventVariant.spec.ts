import { TypographyVariant } from '../../../../../../__generated__/globalTypes'

import { EventVariant, getEventVariant } from '.'

describe('getEventVariant', () => {
  const defaultResult = {
    textAlign: undefined,
    durationColor: 'text.secondary',
    valueColor: 'text.secondary',
    iconColor: 'secondary.light',
    durationVariant: TypographyVariant.caption,
    activityVariant: 400,
    valueVariant: TypographyVariant.body2
  }

  it('should default variant', () => {
    const result = getEventVariant(EventVariant.default)
    expect(result).toEqual(defaultResult)
  })

  it('should featured variant', () => {
    const result = getEventVariant(EventVariant.featured)
    expect(result).toEqual({
      ...defaultResult,
      valueColor: 'text.primary',
      activityVariant: 600,
      valueVariant: TypographyVariant.subtitle1
    })
  })

  it('should chat variant', () => {
    const result = getEventVariant(EventVariant.chat)
    expect(result).toEqual({
      ...defaultResult,
      durationColor: 'primary.main',
      valueColor: 'primary.main',
      iconColor: 'primary.main',
      valueVariant: TypographyVariant.subtitle1,
      activityVariant: 600
    })
  })

  it('should title variant', () => {
    const result = getEventVariant(EventVariant.title)
    expect(result).toEqual({
      ...defaultResult,
      textAlign: 'center',
      valueColor: 'text.primary',
      durationVariant: TypographyVariant.body2,
      valueVariant: TypographyVariant.h3
    })
  })

  it('should start variant', () => {
    const result = getEventVariant(EventVariant.start)
    expect(result).toEqual({
      ...defaultResult,
      valueColor: 'text.primary',
      valueVariant: TypographyVariant.subtitle1
    })
  })
})
