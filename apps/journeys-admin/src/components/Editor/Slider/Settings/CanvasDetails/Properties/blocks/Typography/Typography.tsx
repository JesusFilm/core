import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiTypography from '@mui/material/Typography'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import Type1Icon from '@core/shared/ui/icons/Type1'
import Type2Icon from '@core/shared/ui/icons/Type2'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { ColorDisplayIcon } from '../../controls/ColorDisplayIcon'

import { Align } from './Align'
import { Color } from './Color'
import { Variant } from './Variant'

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant } = block
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-typography-variant`
    })
  }, [dispatch, id])

  return (
    <Box
      data-testid="TypographyProperties"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      <Box>
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
          icon={<ColorDisplayIcon color={color} />}
          name={t('Color')}
          value={capitalize(color?.toString() ?? 'primary')}
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

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          backgroundColor: 'background.default'
        }}
      >
        <Button
          color="primary"
          sx={{
            width: '100%',
            justifyContent: 'center',
            color: '#B42318'
          }}
          startIcon={<Type1Icon sx={{ color: '#B42318' }} />}
        >
          <MuiTypography variant="body2">{t('Edit Font Theme')}</MuiTypography>
        </Button>
      </Box>
    </Box>
  )
}
