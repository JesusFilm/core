import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
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
  const { id, align, color, settings } = block
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  // Returns the effective color for display, prioritizing a hex color from settings,
  // then falling back to the legacy enum color, and finally a default if both are missing.
  const getEffectiveColor = () => {
    if (settings?.color) return settings.color
    if (color) return color
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
    <>
      <Box
        data-testid="TypographyProperties"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box>
          <Accordion
            id={`${id}-typography-variant`}
            icon={<Type2Icon />}
            name={t('Text Variant')}
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
      </Box>
    </>
  )
}
