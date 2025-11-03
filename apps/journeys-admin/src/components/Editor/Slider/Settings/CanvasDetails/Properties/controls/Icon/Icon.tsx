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
import Launch from '@mui/icons-material/Launch'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import MailOutline from '@mui/icons-material/MailOutline'
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

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

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
    label: t('Radio Button Unchecked'),
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
  },
  {
    value: IconName.Launch,
    label: t('Launch'),
    display: <Launch />
  },
  {
    value: IconName.MailOutline,
    label: t('Mail'),
    display: <MailOutline />
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
