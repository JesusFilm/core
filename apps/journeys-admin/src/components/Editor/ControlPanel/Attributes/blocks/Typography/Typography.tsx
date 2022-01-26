import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'

export function Typography({
  id,
  align,
  color,
  variant
}: TreeBlock<TypographyBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-text-color`}
        icon={
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
        }
        name="Color"
        value={capitalize(color?.toString() ?? 'primary')}
        description="Text Color"
        // onClick open drawer
      />
      <Attribute
        id={`${id}-font-variant`}
        icon={<TextFieldsRoundedIcon />}
        name="Font Variant"
        value={capitalize(
          lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
        )}
        description="Font Variant"
        // onClick open drawer
      />
      <Attribute
        id={`${id}-text-alignment`}
        icon={<FormatAlignLeftRoundedIcon />}
        name="Text Alignment"
        value={capitalize(align?.toString() ?? 'Left')}
        description="Text Alignment"
        // onClick open drawer
      />
    </>
  )
}
