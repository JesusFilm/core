import { gql, useMutation } from '@apollo/client'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import BeenhereRounded from '@mui/icons-material/BeenhereRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { init, t } from 'i18next'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconBlockNameUpdate } from '../../../../../../../../../__generated__/IconBlockNameUpdate'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import {
  IconColor,
  IconName
} from '../../../../../../../../../__generated__/globalTypes'

import { Color } from './Color'

void init({ defaultNS: 'apps-journeys-admin', fallbackLng: 'en' })

// icons is equivalent to IconName from global types"
export const icons = [
  {
    value: IconName.ArrowForwardRounded,
    label: t('Arrow Right'),
    display: <ArrowForwardRounded />
  },
  {
    value: IconName.ArrowBackRounded,
    label: t('Arrow Left'),
    display: <ArrowBackRounded />
  },
  {
    value: IconName.BeenhereRounded,
    label: t('Been Here'),
    display: <BeenhereRounded />
  },
  {
    value: IconName.ChatBubbleOutlineRounded,
    label: t('Chat Bubble'),
    display: <ChatBubbleOutlineRounded />
  },
  {
    value: IconName.CheckCircleRounded,
    label: t('Check Circle'),
    display: <CheckCircleRounded />
  },
  {
    value: IconName.ChevronRightRounded,
    label: t('Chevron Right'),
    display: <ChevronRightRounded />
  },
  {
    value: IconName.ChevronLeftRounded,
    label: t('Chevron Left'),
    display: <ChevronLeftRounded />
  },
  {
    value: IconName.ContactSupportRounded,
    label: t('Contact Support'),
    display: <ContactSupportRounded />
  },
  {
    value: IconName.FormatQuoteRounded,
    label: t('Format Quote'),
    display: <FormatQuoteRounded />
  },
  {
    value: IconName.LiveTvRounded,
    label: t('Live Tv'),
    display: <LiveTvRounded />
  },
  {
    value: IconName.LockOpenRounded,
    label: t('Lock Open'),
    display: <LockOpenRounded />
  },
  {
    value: IconName.MenuBookRounded,
    label: t('Menu Book'),
    display: <MenuBookRounded />
  },
  {
    value: IconName.PlayArrowRounded,
    label: t('Play Arrow'),
    display: <PlayArrowRounded />
  },
  {
    value: IconName.RadioButtonUncheckedRounded,
    label: t('Radio Button Uncheked'),
    display: <RadioButtonUncheckedRounded />
  },
  {
    value: IconName.SendRounded,
    label: t('Send'),
    display: <SendRounded />
  },
  {
    value: IconName.SubscriptionsRounded,
    label: t('Subscription'),
    display: <SubscriptionsRounded />
  },
  {
    value: IconName.TranslateRounded,
    label: t('Translate'),
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
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as IconParentBlock

  // Get updated iconBlock, passing via props doesn't update as selectedBlock doesn't change
  const iconBlock = selectedBlock?.children.find(
    (block) => block.id === id
  ) as TreeBlock<IconFields>
  const iconName = iconBlock?.iconName ?? ''

  async function iconUpdate(name: IconName | null): Promise<void> {
    if (journey == null) return

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

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <FormControl
        fullWidth
        hiddenLabel
        sx={{ p: 4, pt: 0 }}
        data-testid="IconSelect"
      >
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
          <MenuItem value="">{t('Select an icon...')}</MenuItem>
          {icons.map(({ value, label, display }) => {
            return (
              <MenuItem key={`button-icon-name-${value}`} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {display}
                  <Typography sx={{ pl: 3 }}>{t(label)}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      {iconName !== '' && (
        <Box>
          <Typography variant="subtitle2" sx={{ p: 4, pt: 0 }}>
            {t('Color')}
          </Typography>
          <Color id={id} iconColor={iconBlock.iconColor ?? IconColor.inherit} />
        </Box>
      )}
    </>
  )
}
