import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useEditor, TreeBlock } from '@core/journeys/ui'
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
import { IconName } from '../../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../../__generated__/IconFields'
import {
  IconBlockCreate,
  IconBlockCreate_iconBlockCreate
} from '../../../../../../../../__generated__/IconBlockCreate'
import { IconBlockNameUpdate } from '../../../../../../../../__generated__/IconBlockNameUpdate'
import { ButtonBlockIconUpdate } from '../../../../../../../../__generated__/ButtonBlockIconUpdate'
import { ColorToggleGroup } from './ColorToggleGroup'
import { SizeToggleGroup } from './SizeToggleGroup'

// icons is equivalent to IconName from global types"
const icons = [
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
    label: 'Chat Bubblle',
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
// ---------- MUTATIONS ----------
export const ICON_BLOCK_CREATE = gql`
  mutation IconBlockCreate($input: IconBlockCreateInput!) {
    iconBlockCreate(input: $input) {
      id
      parentBlockId
      journeyId
      name
      color
      size
    }
  }
`

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

export const BUTTON_BLOCK_ICON_UPDATE = gql`
  mutation ButtonBlockIconUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startIconId
      endIconId
    }
  }
`

interface iconProps {
  iconBlock?: TreeBlock<IconFields>
  type: 'start' | 'end'
}

export function Icon({ iconBlock, type }: iconProps): ReactElement {
  const [iconBlockCreate] = useMutation<IconBlockCreate>(ICON_BLOCK_CREATE)
  const [iconBlockNameUpdate] = useMutation<IconBlockNameUpdate>(
    ICON_BLOCK_NAME_UPDATE
  )
  const [buttonBlockIconUpdate] = useMutation<ButtonBlockIconUpdate>(
    BUTTON_BLOCK_ICON_UPDATE
  )

  const journey = useJourney()

  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  // ---------- SET UP ----------
  const iconName = iconBlock != null ? iconBlock.iconName : ''

  const [showProps, setShowProps] = useState(iconName !== '')
  const [name, setName] = useState(iconName)

  // ---------- API CALLERS ----------
  async function iconCreate(
    name: IconName
  ): Promise<IconBlockCreate_iconBlockCreate | undefined> {
    if (selectedBlock != null) {
      const { data } = await iconBlockCreate({
        variables: {
          input: {
            parentBlockId: selectedBlock?.id,
            journeyId: journey.id,
            name
          }
        },
        update(cache, { data }) {
          if (data?.iconBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.iconBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
      return data?.iconBlockCreate
    }
  }

  async function iconUpdate(
    name: IconName,
    iconBlockId: string
  ): Promise<void> {
    if (selectedBlock != null) {
      await iconBlockNameUpdate({
        variables: {
          id: iconBlockId,
          journeyId: journey.id,
          input: {
            name
          }
        },
        optimisticResponse: {
          iconBlockUpdate: {
            __typename: 'IconBlock',
            id: iconBlockId,
            name
          }
        }
      })
    }
  }

  async function buttonIconUpdate(
    startIconId: string | null,
    endIconId: string | null
  ): Promise<void> {
    if (selectedBlock != null) {
      await buttonBlockIconUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: {
            startIconId,
            endIconId
          }
        },
        optimisticResponse: {
          buttonBlockUpdate: {
            __typename: 'ButtonBlock',
            id: selectedBlock.id,
            startIconId,
            endIconId
          }
        }
      })
    }
  }
  // async function updateIcon(name: IconName, type: IconType): Promise<void> {
  //   if (selectedBlock != null) {
  //     if (type === IconType.start) {
  //       await buttonBlockStartIconUpdate({
  //         variables: {
  //           id: selectedBlock.id,
  //           journeyId: journey.id,
  //           input: {
  //             startIcon: {
  //               name
  //             }
  //           }
  //         },
  //         optimisticResponse: {
  //           buttonBlockUpdate: {
  //             id: selectedBlock.id,
  //             __typename: 'ButtonBlock',
  //             startIcon: {
  //               __typename: 'Icon',
  //               name
  //             }
  //           }
  //         }
  //       })
  //     } else {
  //       await buttonBlockEndIconUpdate({
  //         variables: {
  //           id: selectedBlock.id,
  //           journeyId: journey.id,
  //           input: {
  //             endIcon: {
  //               name
  //             }
  //           }
  //         },
  //         optimisticResponse: {
  //           buttonBlockUpdate: {
  //             id: selectedBlock.id,
  //             __typename: 'ButtonBlock',
  //             endIcon: {
  //               __typename: 'Icon',
  //               name
  //             }
  //           }
  //         }
  //       })
  //     }
  //   }
  // }

  // async function removeIcon(type: IconType): Promise<void> {
  //   if (selectedBlock != null) {
  //     if (type === IconType.start) {
  //       await buttonBlockStartIconUpdate({
  //         variables: {
  //           id: selectedBlock.id,
  //           journeyId: journey.id,
  //           input: {
  //             startIcon: null
  //           }
  //         },
  //         optimisticResponse: {
  //           buttonBlockUpdate: {
  //             id: selectedBlock.id,
  //             __typename: 'ButtonBlock',
  //             startIcon: null
  //           }
  //         }
  //       })
  //     } else {
  //       await buttonBlockEndIconUpdate({
  //         variables: {
  //           id: selectedBlock.id,
  //           journeyId: journey.id,
  //           input: {
  //             endIcon: null
  //           }
  //         },
  //         optimisticResponse: {
  //           buttonBlockUpdate: {
  //             id: selectedBlock.id,
  //             __typename: 'ButtonBlock',
  //             endIcon: null
  //           }
  //         }
  //       })
  //     }
  //   }
  // }

  // ---------- HANDLE CHANGE ----------
  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const newName = event.target.value as IconName
    if (event.target.value === '') {
      type === 'start'
        ? await buttonIconUpdate(null, selectedBlock?.endIconId ?? null)
        : await buttonIconUpdate(selectedBlock?.startIconId ?? null, null)
      // delete iconBlock
    } else if (newName !== iconName) {
      if (type === 'start') {
        if (typeof selectedBlock?.startIconId === 'string') {
          await iconUpdate(newName, selectedBlock.startIconId)
        } else {
          const newIcon = await iconCreate(newName)
          await buttonIconUpdate(
            newIcon?.id ?? null,
            selectedBlock?.endIconId ?? null
          )
        }
      } else {
        if (typeof selectedBlock?.endIconId === 'string') {
          await iconUpdate(newName, selectedBlock.endIconId)
        } else {
          const newIcon = await iconCreate(newName)
          await buttonIconUpdate(
            selectedBlock?.startIconId ?? null,
            newIcon?.id ?? null
          )
        }
      }
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
