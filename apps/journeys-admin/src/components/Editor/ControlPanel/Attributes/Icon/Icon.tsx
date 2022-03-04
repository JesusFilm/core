import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { TreeBlock } from '@core/journeys/ui'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { gql, useMutation } from '@apollo/client'
import {
  CheckCircleRounded,
  PlayArrowRounded,
  TranslateRounded,
  RadioButtonUncheckedRounded,
  FormatQuoteRounded,
  LockOpenRounded,
  ArrowForwardRounded,
  ChatBubbleOutlineRounded,
  LiveTvRounded,
  MenuBookRounded,
  ChevronRightRounded,
  BeenhereRounded,
  SendRounded,
  SubscriptionsRounded,
  ContactSupportRounded
} from '@mui/icons-material'
import { IconName } from '../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../libs/context'
import { IconFields } from '../../../../../../__generated__/IconFields'
import { IconBlockNameUpdate } from '../../../../../../__generated__/IconBlockNameUpdate'
import { ColorToggleGroup } from './ColorToggleGroup'
import { SizeToggleGroup } from './SizeToggleGroup'

// icons is equivalent to IconName from global types"
export const icons = [
  {
    value: IconName.ArrowForwardRounded,
    label: 'Arrow Forward',
    display: <ArrowForwardRounded />
  },
  {
    value: IconName.BeenhereRounded,
    label: 'Been Here',
    display: <BeenhereRounded />
  },
  {
    value: IconName.ChatBubbleOutlineRounded,
    label: 'Chat Bubble',
    display: <ChatBubbleOutlineRounded />
  },
  {
    value: IconName.CheckCircleRounded,
    label: 'Check Circle',
    display: <CheckCircleRounded />
  },
  {
    value: IconName.ChevronRightRounded,
    label: 'Chevron Right',
    display: <ChevronRightRounded />
  },
  {
    value: IconName.ContactSupportRounded,
    label: 'Contact Support',
    display: <ContactSupportRounded />
  },
  {
    value: IconName.FormatQuoteRounded,
    label: 'Format Quote',
    display: <FormatQuoteRounded />
  },
  {
    value: IconName.LiveTvRounded,
    label: 'Live Tv',
    display: <LiveTvRounded />
  },
  {
    value: IconName.LockOpenRounded,
    label: 'Lock Open',
    display: <LockOpenRounded />
  },
  {
    value: IconName.MenuBookRounded,
    label: 'Menu Book',
    display: <MenuBookRounded />
  },
  {
    value: IconName.PlayArrowRounded,
    label: 'Play Arrow',
    display: <PlayArrowRounded />
  },
  {
    value: IconName.RadioButtonUncheckedRounded,
    label: 'Radio Button Uncheked',
    display: <RadioButtonUncheckedRounded />
  },
  { value: IconName.SendRounded, label: 'Send', display: <SendRounded /> },
  {
    value: IconName.SubscriptionsRounded,
    label: 'Subscription',
    display: <SubscriptionsRounded />
  },
  {
    value: IconName.TranslateRounded,
    label: 'Translate',
    display: <TranslateRounded />
  }
]

export const ICON_BLOCK_NAME_UPDATE = gql`
  mutation IconBlockNameUpdate(
    $id: ID!
    $journeyId: ID!
    $input: IconBlockUpdateInput!
  ) {
    iconBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      name
    }
  }
`

interface iconProps {
  iconBlock: TreeBlock<IconFields>
}

export function Icon({ iconBlock }: iconProps): ReactElement {
  const [iconBlockNameUpdate] = useMutation<IconBlockNameUpdate>(
    ICON_BLOCK_NAME_UPDATE
  )

  const journey = useJourney()
  const [iconName, setIconName] = useState(iconBlock?.iconName ?? '')
  const [showProps, setShowProps] = useState(iconBlock?.iconName != null)

  useEffect(() => {
    setIconName(iconBlock?.iconName ?? '')
    setShowProps(iconBlock?.iconName != null)
  }, [iconBlock])

  async function iconUpdate(name: IconName | null): Promise<void> {
    await iconBlockNameUpdate({
      variables: {
        id: iconBlock?.id,
        journeyId: journey.id,
        input: {
          name
        }
      },
      optimisticResponse: {
        iconBlockUpdate: {
          __typename: 'IconBlock',
          id: iconBlock.id,
          name
        }
      }
    })
    setIconName(name ?? '')
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const newName = event.target.value as IconName
    if (event.target.value === '') {
      await iconUpdate(null)
      setShowProps(false)
    } else if (newName !== iconName) {
      await iconUpdate(newName)
      setShowProps(true)
    }
  }

  return (
    <>
      <FormControl fullWidth hiddenLabel sx={{ pt: 4, pb: 6, px: 6 }}>
        <Select
          labelId="icon-name-select"
          id="icon-name-select"
          value={iconName}
          onChange={handleChange}
          variant="filled"
          displayEmpty
          IconComponent={KeyboardArrowDownRoundedIcon}
          inputProps={{ 'aria-label': 'icon-name' }}
        >
          <MenuItem value="">Select an icon...</MenuItem>
          {icons.map(({ value, label, display }) => {
            return (
              <MenuItem key={`button-icon-name-${value}`} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {display}
                  <Typography sx={{ pl: 3 }}>{label}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      {showProps && iconBlock != null && (
        <Box>
          <Typography variant="subtitle2" sx={{ px: 6 }}>
            Color
          </Typography>
          <ColorToggleGroup iconBlock={iconBlock} />
          <Typography variant="subtitle2" sx={{ px: 6 }}>
            Size
          </Typography>
          <SizeToggleGroup iconBlock={iconBlock} />
        </Box>
      )}
    </>
  )
}
