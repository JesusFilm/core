import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import Type2Icon from '@core/shared/ui/icons/Type2'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { ColorDisplayIcon } from '../../controls/ColorDisplayIcon'

import { Align } from './Align'
import { Color } from './Color'
import { Variant } from './Variant'

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant, settings } = block
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  // Get the effective color - prioritize settings.color (hex) over legacy color (enum)
  const getEffectiveColor = () => {
    // First check if there's a valid hex color in settings
    if (settings?.color && settings.color.trim() !== '') {
      return settings.color
    }
    // If settings is empty {} or settings.color is empty/null, fall back to legacy enum color
    if (color) {
      return color
    }
    // When both are null (new blocks), return default color for display
    return '#FEFEFE'
  }

  const effectiveColor = getEffectiveColor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-typography-variant`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="TypographyProperties">
      <Accordion
        id={`${id}-typography-variant`}
        icon={<Type2Icon />}
        name={t('Text Variant')}
        value={capitalize(
          lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
        )}
      >
        <Variant />
      </Accordion>

      <Accordion
        id={`${id}-typography-color`}
        icon={<ColorDisplayIcon color={effectiveColor} />}
        name={t('Color')}
        value={
          effectiveColor?.toString().startsWith('#')
            ? effectiveColor.toString().toUpperCase()
            : capitalize(effectiveColor?.toString() ?? ' ')
        }
      >
        <Color />
      </Accordion>

      <Accordion
        id={`${id}-typography-alignment`}
        icon={<AlignLeftIcon />}
        name={t('Text Alignment')}
        value={capitalize(align?.toString() ?? 'Left')}
      >
        <Align />
      </Accordion>
    </Box>
  )
}
