import { ReactElement, useContext } from 'react'
import { TreeBlock, EditorContext } from '@core/journeys/ui'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { ThemeProvider } from '@core/shared/ui'
import { GetJourneyForEdit_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { Attribute } from '../..'
import { TextColor } from './TextColor'
import { TextAlign } from './TextAlign'
import { FontVariant } from './FontVariant'

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant } = block
  const { dispatch } = useContext(EditorContext)
  return (
    <>
      <Attribute
        id={`${id}-text-color`}
        icon={
          // update to use journey.themeMode
          <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
            <Paper
              sx={{
                borderRadius: 1000
              }}
            >
              <Box
                data-testid="backgroundColorIcon"
                sx={{
                  width: 20,
                  height: 20,
                  m: 1,
                  borderRadius: 1000,
                  backgroundColor: `${color ?? 'primary'}.main`
                }}
              />
            </Paper>
          </ThemeProvider>
        }
        name="Color"
        value={capitalize(color?.toString() ?? 'primary')}
        description="Text Color"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Color',
            mobileOpen: true,
            children: <TextColor id={id} color={color} />
          })
        }}
      />
      <Attribute
        id={`${id}-font-variant`}
        icon={<TextFieldsRoundedIcon />}
        name="Font Variant"
        value={capitalize(
          lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
        )}
        description="Font Variant"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Font Variant',
            mobileOpen: true,
            children: <FontVariant id={id} variant={variant} />
          })
        }}
      />
      <Attribute
        id={`${id}-text-alignment`}
        icon={<FormatAlignLeftRoundedIcon />}
        name="Text Alignment"
        value={capitalize(align?.toString() ?? 'Left')}
        description="Text Alignment"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Alignment',
            mobileOpen: true,
            children: <TextAlign {...block} />
          })
        }}
      />
    </>
  )
}
