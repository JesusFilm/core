import Box from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Ellipsis from '@core/shared/ui/icons/Ellipsis'
import Equals from '@core/shared/ui/icons/Equals'
import Grid1 from '@core/shared/ui/icons/Grid1'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import Menu1 from '@core/shared/ui/icons/Menu1'
import More from '@core/shared/ui/icons/More'

import { JourneyMenuButtonIcon } from '../../../../../../../../../__generated__/globalTypes'
import { useJourneyUpdateMutation } from '../../../../../../../../libs/useJourneyUpdateMutation'

type IconOptions = Array<{
  Icon: typeof SvgIcon
  value: JourneyMenuButtonIcon
}>

const Icons: IconOptions = [
  {
    Icon: ChevronDown,
    value: JourneyMenuButtonIcon.chevronDown
  },
  {
    Icon: Ellipsis,
    value: JourneyMenuButtonIcon.ellipsis
  },
  {
    Icon: Equals,
    value: JourneyMenuButtonIcon.equals
  },
  {
    Icon: Grid1,
    value: JourneyMenuButtonIcon.grid1
  },
  {
    Icon: Home3,
    value: JourneyMenuButtonIcon.home3
  },
  {
    Icon: Home4,
    value: JourneyMenuButtonIcon.home4
  },
  {
    Icon: Menu1,
    value: JourneyMenuButtonIcon.menu1
  },
  {
    Icon: More,
    value: JourneyMenuButtonIcon.more
  }
]

const getIconTestId = (
  iconValue: JourneyMenuButtonIcon
): string | undefined => {
  switch (iconValue) {
    case JourneyMenuButtonIcon.chevronDown:
      return 'ChevronDownIcon'
    case JourneyMenuButtonIcon.home4:
      return 'Home4Icon'
    case JourneyMenuButtonIcon.home3:
      return 'Home3Icon'
    case JourneyMenuButtonIcon.menu1:
      return 'Menu1Icon'
    case JourneyMenuButtonIcon.more:
      return 'MoreIcon'
    default:
      return undefined
  }
}

export function MenuIconSelect(): ReactElement {
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { t } = useTranslation('apps-journeys-admin')

  function iconUpdate(icon: JourneyMenuButtonIcon | null): void {
    if (journey == null) return

    const undoIcon = journey.menuButtonIcon ?? null
    add({
      parameters: {
        execute: { icon },
        undo: { icon: undoIcon }
      },
      execute({ icon }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              menuButtonIcon: icon
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              tags: [],
              menuButtonIcon: icon
            }
          }
        })
      }
    })
  }

  function handleChange(event: SelectChangeEvent): void {
    const newName = event.target.value as JourneyMenuButtonIcon
    if (event.target.value === '') {
      iconUpdate(null)
    } else if (newName !== journey?.menuButtonIcon) {
      iconUpdate(newName)
    }
  }

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      data-testid="MenuIconSelect"
    >
      <Typography variant="subtitle2" sx={{ color: 'secondary.light' }}>
        {t('Select Icon')}
      </Typography>
      <CardActionArea sx={{ width: 112 }}>
        <Select
          value={journey?.menuButtonIcon ?? ''}
          onChange={handleChange}
          displayEmpty
          IconComponent={ChevronDown}
          sx={{
            width: '100%',
            borderRadius: 2,
            '& .MuiSelect-icon': {
              color: 'primary.main',
              mr: 1.5
            },
            '&.MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider'
              },
              '&:hover fieldset': {
                borderColor: 'divider'
              },
              '&:hover.Mui-focused fieldset': {
                borderColor: 'primary.main'
              }
            }
          }}
          inputProps={{
            sx: {
              py: 2,
              pl: 2
            }
          }}
        >
          <MenuItem value="" key="empty">
            <Box
              sx={{
                height: 56,
                width: 56,
                borderRadius: 2,
                border: ({ palette }) =>
                  `3px dashed ${palette.background.default}`,
                display: 'grid',
                placeItems: 'center'
              }}
            />
          </MenuItem>
          {Icons.map(({ Icon, value }) => (
            <MenuItem value={value} key={value}>
              <Box
                sx={{
                  height: 56,
                  width: 56,
                  borderRadius: 2,
                  border: ({ palette }) => palette.background.default,
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <Icon data-testid={getIconTestId(value)} />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </CardActionArea>
    </Stack>
  )
}
