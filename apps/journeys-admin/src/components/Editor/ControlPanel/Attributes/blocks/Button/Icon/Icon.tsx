import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import capitalize from 'lodash/capitalize'
import { Icon as CoreIcon } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import {
  IconColor,
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'
import { ButtonBlockStartIconUpdate } from '../../../../../../../../__generated__/ButtonBlockStartIconUpdate'
import { ButtonBlockEndIconUpdate } from '../../../../../../../../__generated__/ButtonBlockEndIconUpdate'
import { useJourney } from '../../../../../../../libs/context'
import { SizeToggleGroup } from './SizeToggleGroup'
import { ColorToggleGroup } from './ColorToggleGroup'

interface IconProps {
  id: string
  iconName?: IconName
  iconColor: IconColor | null | undefined
  iconSize: IconSize | null | undefined
  iconType: IconType
}

export enum IconType {
  start = 'start',
  end = 'end'
}

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

export function Icon({
  id,
  iconName,
  iconColor,
  iconSize,
  iconType
}: IconProps): ReactElement {
  const [buttonBlockStartIconUpdate] =
    useMutation<ButtonBlockStartIconUpdate>(START_ICON_UPDATE)
  const [buttonBlockEndIconUpdate] =
    useMutation<ButtonBlockEndIconUpdate>(END_ICON_UPDATE)

  const journey = useJourney()

  const [showProps, setShowProps] = useState(iconName != null)
  const [name, setName] = useState('')

  useEffect(() => {
    setShowProps(iconName != null)
    setName(iconName != null ? iconName : '')
  }, [iconName])

  async function updateIcon(name: string, type: IconType): Promise<void> {
    if (type === IconType.start) {
      await buttonBlockStartIconUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            startIcon: {
              name: name
            }
          }
        }
      })
    } else {
      await buttonBlockEndIconUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            endIcon: {
              name: name
            }
          }
        }
      })
    }
  }

  async function removeIcon(type: IconType): Promise<void> {
    if (type === IconType.start) {
      await buttonBlockStartIconUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            startIcon: null
          }
        }
      })
    } else {
      await buttonBlockEndIconUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            endIcon: null
          }
        }
      })
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const newName = event.target.value
    if (newName === '') {
      await removeIcon(iconType)
    } else if (newName !== name) {
      await updateIcon(newName, iconType)
    }
    setName(newName)
    setShowProps(newName !== '')
  }

  return (
    <Box sx={{ px: 6 }}>
      <Box sx={{ display: 'flex', pt: 4, flexDirection: 'column' }}>
        <Typography variant="subtitle2">Show Icon</Typography>
        <Typography variant="caption">Show/Hide Icon on Button</Typography>
      </Box>

      <FormControl fullWidth hiddenLabel sx={{ pt: 4, pb: 9 }}>
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
          {Object.values(IconName).map((name) => {
            return (
              <MenuItem key={`button-icon-name-${name}`} value={name}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CoreIcon
                    __typename={'Icon'}
                    name={name}
                    color={null}
                    size={IconSize.md}
                  />

                  <Typography sx={{ pl: 3 }}>{capitalize(name)}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      {showProps && (
        <Box>
          <ColorToggleGroup id={id} color={iconColor} type={iconType} />
          <SizeToggleGroup id={id} size={iconSize} type={iconType} />
        </Box>
      )}
    </Box>
  )
}
