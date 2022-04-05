import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { gql, useMutation } from '@apollo/client'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import BeenhereRounded from '@mui/icons-material/BeenhereRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import {
  IconColor,
  IconName
} from '../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../libs/context'
import { IconFields } from '../../../../../../__generated__/IconFields'
import { IconBlockNameUpdate } from '../../../../../../__generated__/IconBlockNameUpdate'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/GetJourney'
import { Color } from './Color'

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
type IconParentBlock<T = TreeBlock<ButtonBlock>> = T

interface IconProps extends Pick<TreeBlock<IconFields>, 'id'> {}

export function Icon({ id }: IconProps): ReactElement {
  const [iconBlockNameUpdate] = useMutation<IconBlockNameUpdate>(
    ICON_BLOCK_NAME_UPDATE
  )
  const journey = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as IconParentBlock

  // Get updated iconBlock, passing via props doesn't update as selectedBlock doesn't change
  const iconBlock = selectedBlock?.children.find(
    (block) => block.id === id
  ) as TreeBlock<IconFields>
  const iconName = iconBlock?.iconName ?? ''

  async function iconUpdate(name: IconName | null): Promise<void> {
    await iconBlockNameUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: {
          name
        }
      },
      optimisticResponse: {
        iconBlockUpdate: {
          __typename: 'IconBlock',
          id,
          name
        }
      }
    })
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const newName = event.target.value as IconName
    if (event.target.value === '') {
      await iconUpdate(null)
    } else if (newName !== iconName) {
      await iconUpdate(newName)
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

      {iconName !== '' && (
        <Box>
          <Typography variant="subtitle2" sx={{ px: 6 }}>
            Color
          </Typography>
          <Color id={id} iconColor={iconBlock.iconColor ?? IconColor.inherit} />
        </Box>
      )}
    </>
  )
}
