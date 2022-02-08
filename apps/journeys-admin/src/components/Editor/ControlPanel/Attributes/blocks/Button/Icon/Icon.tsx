import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement, useState, useEffect } from 'react'
import { useEditor, TreeBlock, Icon as CoreIcon } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { gql, useMutation } from '@apollo/client'
import {
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'
import { ButtonBlockStartIconUpdate } from '../../../../../../../../__generated__/ButtonBlockStartIconUpdate'
import { ButtonBlockEndIconUpdate } from '../../../../../../../../__generated__/ButtonBlockEndIconUpdate'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { ColorToggleGroup } from './ColorToggleGroup'
import { SizeToggleGroup } from './SizeToggleGroup'

interface IconProps {
  iconType: IconType
}

export enum IconType {
  start = 'start',
  end = 'end'
}

// icons is equivalent to IconName from global types"
const icons = [
  { value: IconName.ArrowForwardRounded, label: 'Arrow Forward' },
  { value: IconName.BeenhereRounded, label: 'Been Here' },
  { value: IconName.ChatBubbleOutlineRounded, label: 'Chat Bubblle' },
  { value: IconName.CheckCircleRounded, label: 'Check Circle' },
  { value: IconName.ChevronRightRounded, label: 'Chevron Right' },
  { value: IconName.ContactSupportRounded, label: 'Contact Support' },
  { value: IconName.FormatQuoteRounded, label: 'Format Quote' },
  { value: IconName.LiveTvRounded, label: 'Live Tv' },
  { value: IconName.LockOpenRounded, label: 'Lock Open' },
  { value: IconName.MenuBookRounded, label: 'Menu Book' },
  { value: IconName.PlayArrowRounded, label: 'Play Arrow' },
  {
    value: IconName.RadioButtonUncheckedRounded,
    label: 'Radio Button Uncheked'
  },
  { value: IconName.SendRounded, label: 'Send' },
  { value: IconName.SubscriptionsRounded, label: 'Subscription' },
  { value: IconName.TranslateRounded, label: 'Translate' }
]

export const START_ICON_UPDATE = gql`
  mutation ButtonBlockStartIconUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startIcon {
        name
      }
    }
  }
`
export const END_ICON_UPDATE = gql`
  mutation ButtonBlockEndIconUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      endIcon {
        name
      }
    }
  }
`

export function Icon({ iconType }: IconProps): ReactElement {
  const [buttonBlockStartIconUpdate] =
    useMutation<ButtonBlockStartIconUpdate>(START_ICON_UPDATE)
  const [buttonBlockEndIconUpdate] =
    useMutation<ButtonBlockEndIconUpdate>(END_ICON_UPDATE)

  const journey = useJourney()

  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const iconName =
    iconType === IconType.start
      ? selectedBlock?.startIcon?.name
      : selectedBlock?.endIcon?.name

  const [showProps, setShowProps] = useState(iconName != null)
  const [name, setName] = useState('')

  useEffect(() => {
    setShowProps(iconName != null)
    setName(iconName != null ? iconName : '')
  }, [iconName])

  async function updateIcon(name: IconName, type: IconType): Promise<void> {
    if (selectedBlock != null) {
      if (type === IconType.start) {
        await buttonBlockStartIconUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              startIcon: {
                name
              }
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'ButtonBlock',
              startIcon: {
                __typename: 'Icon',
                name
              }
            }
          }
        })
      } else {
        await buttonBlockEndIconUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              endIcon: {
                name
              }
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'ButtonBlock',
              endIcon: {
                __typename: 'Icon',
                name
              }
            }
          }
        })
      }
    }
  }

  async function removeIcon(type: IconType): Promise<void> {
    if (selectedBlock != null) {
      if (type === IconType.start) {
        await buttonBlockStartIconUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              startIcon: null
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'ButtonBlock',
              startIcon: null
            }
          }
        })
      } else {
        await buttonBlockEndIconUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              endIcon: null
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'ButtonBlock',
              endIcon: null
            }
          }
        })
      }
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const newName = event.target.value as IconName
    if (event.target.value === '') {
      await removeIcon(iconType)
    } else if (newName !== name) {
      await updateIcon(newName, iconType)
    }
    setName(newName)
    setShowProps(event.target.value !== '')
  }

  return (
    <>
      <FormControl fullWidth hiddenLabel sx={{ pt: 4, pb: 6, px: 6 }}>
        <Select
          labelId="icon-name-select"
          id="icon-name-select"
          value={name}
          onChange={handleChange}
          variant="filled"
          displayEmpty
          IconComponent={KeyboardArrowDownRoundedIcon}
          inputProps={{ 'aria-label': 'icon-name-select' }}
        >
          <MenuItem value="">Select an icon...</MenuItem>
          {icons.map(({ value, label }) => {
            return (
              <MenuItem key={`button-icon-name-${value}`} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CoreIcon
                    __typename={'Icon'}
                    name={value}
                    color={null}
                    size={IconSize.md}
                  />

                  <Typography sx={{ pl: 3 }}>{label}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      {showProps && (
        <Box>
          <Typography variant="subtitle2" sx={{ px: 6 }}>
            Color
          </Typography>
          <ColorToggleGroup type={iconType} />
          <Typography variant="subtitle2" sx={{ px: 6 }}>
            Size
          </Typography>
          <SizeToggleGroup type={iconType} />
        </Box>
      )}
    </>
  )
}
