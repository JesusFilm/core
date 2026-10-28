import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { hoverOnly } from '@core/shared/ui/hoverOnly'
import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { StyledListRadioOption } from '../../RadioOption/ListVariant'
import {
  getPollOptionBorderColors,
  getPollOptionBorderStyles
} from '../utils/getPollOptionBorderStyles'

const StyledListRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiButtonGroup-root': {
    boxShadow: 'none',
    gap: theme.spacing(2),
    '& .MuiButtonGroup-grouped': {
      border: 'none',
      borderBottom: 'none',
      borderRight: 'none',
      borderRadius: '12px',
      margin: '0 !important',
      '&:not(:last-of-type)': {
        borderBottom: 'none'
      }
    }
  }
}))

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

interface ListVariantProps {
  options: (ReactElement | false)[]
  addOption?: () => void
  blockId: string
}

export function ListVariant({
  options,
  addOption,
  blockId
}: ListVariantProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <StyledListRadioQuestion
      data-testid={`JourneysRadioQuestionList-${blockId}`}
    >
      <ButtonGroup orientation="vertical" variant="contained" fullWidth>
        {options}
        {addOption && (
          <Box>
            <StyledListRadioOption
              data-testid={`${blockId}-add-option`}
              variant="contained"
              fullWidth
              disableRipple
              startIcon={
                <AddSquare4Icon sx={{ color: `${adminPrimaryColor.main}` }} />
              }
              onClick={addOption}
              sx={(theme) => {
                const borderColors = getPollOptionBorderColors(theme, {
                  important: true
                })

                return {
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  ...getPollOptionBorderStyles(theme, { important: true }),
                  ...hoverOnly({ borderColor: borderColors.hover }),
                  '&:active': { borderColor: borderColors.active }
                }
              }}
            >
              <Typography variant="body1">{t('Add Option')}</Typography>
            </StyledListRadioOption>
          </Box>
        )}
      </ButtonGroup>
    </StyledListRadioQuestion>
  )
}
