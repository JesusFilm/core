import { gql, useMutation } from '@apollo/client'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { init, t } from 'i18next'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import ArrowLeftContained2 from '@core/shared/ui/icons/ArrowLeftContained2'
import ArrowRightContained2 from '@core/shared/ui/icons/ArrowRightContained2'
import Bible from '@core/shared/ui/icons/Bible'
import CheckContained from '@core/shared/ui/icons/CheckContained'
import Globe1 from '@core/shared/ui/icons/Globe1'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import Home4 from '@core/shared/ui/icons/Home4'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import Mail1 from '@core/shared/ui/icons/Mail1'
import Marker2 from '@core/shared/ui/icons/Marker2'
import MessageChat1 from '@core/shared/ui/icons/MessageChat1'
import MessageSquare from '@core/shared/ui/icons/MessageSquare'
import MessageText2 from '@core/shared/ui/icons/MessageText2'
import Note2 from '@core/shared/ui/icons/Note2'
import Phone from '@core/shared/ui/icons/Phone'
import Play1 from '@core/shared/ui/icons/Play1'
import Play3 from '@core/shared/ui/icons/Play3'
import Send2 from '@core/shared/ui/icons/Send2'
import UserProfile2 from '@core/shared/ui/icons/UserProfile2'
import UsersProfiles3 from '@core/shared/ui/icons/UsersProfiles3'
import Volume5 from '@core/shared/ui/icons/Volume5'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName
} from '../../../../../../../../../__generated__/globalTypes'
import {
  IconBlockNameUpdate,
  IconBlockNameUpdateVariables
} from '../../../../../../../../../__generated__/IconBlockNameUpdate'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'

import { Color } from './Color'

void init({ defaultNS: 'apps-journeys-admin', fallbackLng: 'en' })

// icons is equivalent to IconName from global types"
export const icons = [
  {
    value: IconName.ArrowBackRounded,
    label: t('Arrow Left'),
    display: <ArrowBackRounded />,
    deprecated: false
  },
  {
    value: IconName.ArrowForwardRounded,
    label: t('Arrow Right'),
    display: <ArrowForwardRounded />,
    deprecated: false
  },
  {
    value: IconName.ArrowLeftContained2,
    label: t('Arrow Circle Left'),
    display: <ArrowLeftContained2 />,
    deprecated: false
  },
  {
    value: IconName.ArrowRightContained2,
    label: t('Arrow Circle Right'),
    display: <ArrowRightContained2 />,
    deprecated: false
  },
  {
    value: IconName.ChevronLeftRounded,
    label: t('Chevron Left'),
    display: <ChevronLeftRounded />,
    deprecated: false
  },
  {
    value: IconName.ChevronRightRounded,
    label: t('Chevron Right'),
    display: <ChevronRightRounded />,
    deprecated: false
  },
  {
    value: IconName.MenuBookRounded,
    label: t('Bible'),
    display: <Bible />,
    deprecated: false
  },
  {
    value: IconName.ChatBubbleOutlineRounded,
    label: t('Chat'),
    display: <MessageSquare />,
    deprecated: false
  },
  {
    value: IconName.FormatQuoteRounded,
    label: t('Chat Text'),
    display: <MessageText2 />,
    deprecated: false
  },
  {
    value: IconName.MessageChat1,
    label: t('Chats Square'),
    display: <MessageChat1 />,
    deprecated: false
  },
  {
    value: IconName.CheckCircleRounded,
    label: t('Check'),
    display: <CheckContained />,
    deprecated: false
  },
  {
    value: IconName.ContactSupportRounded,
    label: t('Help Circle'),
    display: <HelpCircleContained />,
    deprecated: false
  },
  {
    value: IconName.Home4,
    label: t('Home'),
    display: <Home4 />,
    deprecated: false
  },
  {
    value: IconName.TranslateRounded,
    label: t('Globe'),
    display: <Globe1 />,
    deprecated: false
  },
  {
    value: IconName.Launch,
    label: t('Launch'),
    display: <LinkExternal />,
    deprecated: false
  },
  {
    value: IconName.LinkAngled,
    label: t('Link'),
    display: <LinkAngled />,
    deprecated: false
  },
  {
    value: IconName.SendRounded,
    label: t('Send'),
    display: <Send2 />,
    deprecated: false
  },
  {
    value: IconName.BeenhereRounded,
    label: t('Location'),
    display: <Marker2 />,
    deprecated: false
  },
  {
    value: IconName.MailOutline,
    label: t('Mail'),
    display: <Mail1 />,
    deprecated: false
  },
  {
    value: IconName.Phone,
    label: t('Phone'),
    display: <Phone />,
    deprecated: false
  },
  {
    value: IconName.UserProfile2,
    label: t('Person'),
    display: <UserProfile2 />,
    deprecated: false
  },
  {
    value: IconName.UsersProfiles3,
    label: t('People'),
    display: <UsersProfiles3 />,
    deprecated: false
  },
  {
    value: IconName.PlayArrowRounded,
    label: t('Play'),
    display: <Play3 />,
    deprecated: false
  },
  {
    value: IconName.SubscriptionsRounded,
    label: t('Play Square'),
    display: <Play1 />,
    deprecated: false
  },
  {
    value: IconName.Volume5,
    label: t('Sound'),
    display: <Volume5 />,
    deprecated: false
  },
  {
    value: IconName.Note2,
    label: t('Music'),
    display: <Note2 />,
    deprecated: false
  },
  // ===== DEPRECATED ICONS =====
  // Kept for backward compatibility - these will display in the select value
  // when selected (shown in the select input) but are
  // hidden from the dropdown menu options
  {
    value: IconName.LiveTvRounded,
    label: t('Live Tv'),
    display: <LiveTvRounded />,
    deprecated: true
  },
  {
    value: IconName.LockOpenRounded,
    label: t('Lock Open'),
    display: <LockOpenRounded />,
    deprecated: true
  },
  {
    value: IconName.RadioButtonUncheckedRounded,
    label: t('Radio Button Unchecked'),
    display: <RadioButtonUncheckedRounded />,
    deprecated: true
  }
]

export const ICON_BLOCK_NAME_UPDATE = gql`
  mutation IconBlockNameUpdate($id: ID!, $name: IconName) {
    iconBlockUpdate(id: $id, input: { name: $name }) {
      id
      name
    }
  }
`
type IconParentBlock<T = TreeBlock<ButtonBlock>> = T

interface IconProps extends Pick<TreeBlock<IconFields>, 'id'> {}

export function Icon({ id }: IconProps): ReactElement {
  const [iconBlockNameUpdate] = useMutation<
    IconBlockNameUpdate,
    IconBlockNameUpdateVariables
  >(ICON_BLOCK_NAME_UPDATE)
  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as IconParentBlock

  // Get updated iconBlock, passing via props doesn't update as selectedBlock doesn't change
  const iconBlock = selectedBlock?.children.find(
    (block) => block.id === id
  ) as TreeBlock<IconFields>
  const iconName = iconBlock?.iconName ?? ''

  function iconUpdate(name: IconName | null): void {
    add({
      parameters: {
        execute: { name },
        undo: { name: iconName === '' ? null : iconName }
      },
      execute({ name }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })

        void iconBlockNameUpdate({
          variables: {
            id,
            name
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
    })
  }

  function handleChange(event: SelectChangeEvent): void {
    const newName = event.target.value as IconName
    if (event.target.value === '') {
      iconUpdate(null)
    } else if (newName !== iconName) {
      iconUpdate(newName)
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
          <MenuItem value="">{t('None')}</MenuItem>
          {icons.map(({ value, label, display, deprecated }) => {
            return (
              <MenuItem
                key={`button-icon-name-${value}`}
                value={value}
                sx={{ display: deprecated === true ? 'none' : 'flex' }}
              >
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
