import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

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

const ThemeBuilderDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ThemeBuilderDialog" */
      './ThemeBuilderDialog'
    ).then((mod) => mod.ThemeBuilderDialog),
  { ssr: false }
)

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant } = block
  const { t } = useTranslation('apps-journeys-admin')
  const [openThemeBuilderDialog, setOpenThemeBuilderDialog] = useState(false)
  const { dispatch } = useEditor()

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

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          sx={{
            backgroundColor: 'background.default',
            height: 64,
            justifyContent: 'center'
          }}
        >
          <Button
            color="primary"
            sx={{
              p: 4,
              width: '100%',
              justifyContent: 'center',
              color: '#B42318',
              borderRadius: 0
            }}
            startIcon={<Type1Icon sx={{ color: '#B42318' }} />}
            onClick={() => setOpenThemeBuilderDialog(true)}
          >
            <MuiTypography variant="subtitle2">
              {t('Edit Font Theme')}
            </MuiTypography>
          </Button>
        </Stack>
      </Box>
      {openThemeBuilderDialog && (
        <ThemeBuilderDialog
          open={openThemeBuilderDialog}
          onClose={() => setOpenThemeBuilderDialog(false)}
        />
      )}
    </>
  )
}
