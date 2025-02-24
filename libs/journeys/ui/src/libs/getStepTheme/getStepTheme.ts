import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { CardFieldsFragment } from '../../components/Card/__generated__/cardFields'
import { StepFieldsFragment } from '../../components/Step/__generated__/stepFields'
import type { TreeBlock } from '../block'
import { JourneyFieldsFragment } from '../JourneyProvider/__generated__/journeyFields'

export function getStepTheme(
  block?: TreeBlock<StepFieldsFragment> | TreeBlock<CardFieldsFragment>,
  journey?: Pick<JourneyFieldsFragment, 'themeName' | 'themeMode'>
): { themeName: ThemeName; themeMode: ThemeMode } {
  const cardFromStep =
    block?.children != null &&
    block.children.length > 0 &&
    block.children[0].__typename === 'CardBlock'
      ? block.children[0]
      : undefined

  const card = block?.__typename === 'StepBlock' ? cardFromStep : block

  return {
    themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark
  }
}
