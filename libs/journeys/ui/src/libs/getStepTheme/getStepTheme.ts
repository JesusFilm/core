import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { CardFields } from '../../components/Card/__generated__/CardFields'
import { StepFields } from '../../components/Step/__generated__/StepFields'
import type { TreeBlock } from '../block'
import { JourneyFields } from '../JourneyProvider/__generated__/JourneyFields'

export function getStepTheme(
  block: TreeBlock<StepFields> | TreeBlock<CardFields>,
  journey?: Pick<JourneyFields, 'themeName' | 'themeMode'>
): { themeName: ThemeName; themeMode: ThemeMode } {
  const cardFromStep =
    block?.children.length > 0 && block.children[0].__typename === 'CardBlock'
      ? block.children[0]
      : undefined

  const card = block?.__typename === 'StepBlock' ? cardFromStep : block

  return {
    themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark
  }
}
