import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import _ from 'lodash'
import { GetJourneyForEdit_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
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
          <Paper sx={{ borderRadius: 1000, overflow: 'hidden' }}>
            <Box
              data-testid="backgroundColorIcon"
              sx={{
                width: 25,
                height: 25,
                m: 1,
                borderRadius: 1000,
                backgroundColor: (theme) => color ?? theme.palette.text.primary
              }}
            />
          </Paper>
        }
        name="Color"
        value={_.capitalize(color?.toString()) ?? 'None'}
        description="Text Color"
        // onClick open drawer
      />
      <Attribute
        id={`${id}-font-variant`}
        icon={<TextFieldsRoundedIcon />}
        name="Font Variant"
        value={
          _.upperFirst(
            _.lowerCase(variant?.toString()).replace('h', 'header')
          ) ?? 'None'
        }
        description="Font Variant"
        // onClick open drawer
      />
      <Attribute
        id={`${id}-text-alignment`}
        icon={<FormatAlignLeftRoundedIcon />}
        name="Text Alignment"
        value={_.capitalize(align?.toString()) ?? 'None'}
        description="Text Alignment"
        // onClick open drawer
      />
    </>
  )
}
