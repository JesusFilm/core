import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { StyledListRadioOption } from '../../RadioOption/ListVariant'
import { getPollOptionBorderStyles } from '../utils/getPollOptionBorderStyles'

const StyledListRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
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
      },
      '& .MuiButtonGroup-firstButton': {
        ...getPollOptionBorderStyles(theme)
      },
      '& .MuiButtonGroup-middleButton': {
        ...getPollOptionBorderStyles(theme)
      },
      '& .MuiButtonGroup-lastButton': {
        ...getPollOptionBorderStyles(theme)
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
  const { t } = useTranslation('apps-journeys-ui')
  return (
    <StyledListRadioQuestion data-testid={`JourneysRadioQuestion-${blockId}`}>
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
              sx={(theme) => ({
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                ...getPollOptionBorderStyles(theme, { important: true })
              })}
            >
              <Typography variant="body1">{t('Add Option')}</Typography>
            </StyledListRadioOption>
          </Box>
        )}
      </ButtonGroup>
    </StyledListRadioQuestion>
  )
}
