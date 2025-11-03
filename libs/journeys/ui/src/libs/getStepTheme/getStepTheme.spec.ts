import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { CardFields } from '../../components/Card/__generated__/CardFields'
import { StepFields } from '../../components/Step/__generated__/StepFields'
import type { TreeBlock } from '../block'

import { getStepTheme } from '.'

describe('getStepTheme', () => {
  const stepBlock: TreeBlock<StepFields> = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: null,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }

  const cardBlock: TreeBlock<CardFields> = {
    __typename: 'CardBlock',
    id: 'card',
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    parentOrder: 0,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    children: []
  }

  const journey = {
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
  }

  it('should return default base dark theme if no journey or card theme', () => {
    const theme = getStepTheme(stepBlock, undefined)
    expect(theme).toMatchObject({
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    })
  })

  it('should return the journey theme if no card theme is set from a StepBlock', () => {
    const theme = getStepTheme(stepBlock, journey)
    expect(theme).toMatchObject({
      themeName: ThemeName.base,
      themeMode: ThemeMode.light
    })
  })

  it('should return the journey theme if no card theme is set from a CardBlock', () => {
    const theme = getStepTheme(cardBlock, journey)
    expect(theme).toMatchObject({
      themeName: ThemeName.base,
      themeMode: ThemeMode.light
    })
  })

  it('should return the card theme from a StepBlock', () => {
    const theme = getStepTheme(
      {
        ...stepBlock,
        children: [
          {
            ...cardBlock,
            themeName: ThemeName.base,
            themeMode: ThemeMode.dark
          }
        ]
      },
      journey
    )
    expect(theme).toMatchObject({
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    })
  })

  it('should return card theme from a Cardblock with custom theme', () => {
    const theme = getStepTheme(
      {
        ...cardBlock,
        themeName: ThemeName.base,
        themeMode: ThemeMode.dark
      },
      journey
    )
    expect(theme).toMatchObject({
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    })
  })
})
