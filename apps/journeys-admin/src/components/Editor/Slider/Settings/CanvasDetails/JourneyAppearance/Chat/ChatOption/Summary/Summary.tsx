import { Reference, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonCreate } from '../../../../../../../../../../__generated__/JourneyChatButtonCreate'
import { JourneyChatButtonRemove } from '../../../../../../../../../../__generated__/JourneyChatButtonRemove'

export const JOURNEY_CHAT_BUTTON_CREATE = gql`
  mutation JourneyChatButtonCreate(
    $journeyId: ID!
    $input: ChatButtonCreateInput
  ) {
    chatButtonCreate(journeyId: $journeyId, input: $input) {
      id
      link
      platform
      customizable
    }
  }
`

export const JOURNEY_CHAT_BUTTON_REMOVE = gql`
  mutation JourneyChatButtonRemove($chatButtonRemoveId: ID!) {
    chatButtonRemove(id: $chatButtonRemoveId) {
      id
    }
  }
`

interface SummaryProps {
  title: string
  active: boolean
  disableSelection: boolean
  journeyId?: string
  currentLink: string
  currentPlatform: MessagePlatform
  chatButtonId?: string
}

export function Summary({
  title,
  active,
  disableSelection,
  journeyId,
  currentLink,
  currentPlatform,
  chatButtonId
}: SummaryProps): ReactElement {
  const [journeyChatButtonCreate, { loading: createLoading }] =
    useMutation<JourneyChatButtonCreate>(JOURNEY_CHAT_BUTTON_CREATE)
  const [journeyChatButtonRemove, { loading: removeLoading }] =
    useMutation<JourneyChatButtonRemove>(JOURNEY_CHAT_BUTTON_REMOVE)
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()

  function handleToggle(event: ChangeEvent<HTMLInputElement>): void {
    if (createLoading || removeLoading) return

    if (event.target.checked && !disableSelection) {
      let createdButtonId: string | undefined

      add({
        parameters: {
          execute: { link: currentLink, platform: currentPlatform },
          undo: {}
        },
        execute({ link, platform }) {
          void journeyChatButtonCreate({
            variables: {
              journeyId,
              input: { link, platform }
            },
            update(cache, { data }) {
              if (data?.chatButtonCreate != null) {
                createdButtonId = data.chatButtonCreate.id
                cache.modify({
                  id: cache.identify({
                    __typename: 'Journey',
                    id: journeyId
                  }),
                  fields: {
                    chatButtons(existingChatButtons = []) {
                      const newChatButtonRef = cache.writeFragment({
                        data: data.chatButtonCreate,
                        fragment: gql`
                          fragment NewChatButton on ChatButton {
                            id
                          }
                        `
                      })
                      return [...existingChatButtons, newChatButtonRef]
                    }
                  }
                })
              }
            }
          })
        },
        undo() {
          if (createdButtonId == null) return
          const idToRemove = createdButtonId
          void journeyChatButtonRemove({
            variables: { chatButtonRemoveId: idToRemove },
            update(cache, { data }) {
              if (data?.chatButtonRemove != null) {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Journey',
                    id: journeyId
                  }),
                  fields: {
                    chatButtons(refs, { readField }) {
                      return refs.filter(
                        (ref: Reference) => idToRemove !== readField('id', ref)
                      )
                    }
                  }
                })
                cache.evict({ id: `ChatButton:${idToRemove}` })
              }
            }
          })
        }
      })
    } else {
      if (chatButtonId == null) return
      let currentButtonId = chatButtonId

      add({
        parameters: {
          execute: {},
          undo: { link: currentLink, platform: currentPlatform }
        },
        execute() {
          void journeyChatButtonRemove({
            variables: { chatButtonRemoveId: currentButtonId },
            update(cache, { data }) {
              if (data?.chatButtonRemove != null) {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Journey',
                    id: journeyId
                  }),
                  fields: {
                    chatButtons(refs, { readField }) {
                      return refs.filter(
                        (ref: Reference) =>
                          currentButtonId !== readField('id', ref)
                      )
                    }
                  }
                })
                cache.evict({ id: `ChatButton:${currentButtonId}` })
              }
            }
          })
        },
        undo({ link, platform }) {
          void journeyChatButtonCreate({
            variables: {
              journeyId,
              input: { link, platform }
            },
            update(cache, { data }) {
              if (data?.chatButtonCreate != null) {
                currentButtonId = data.chatButtonCreate.id
                cache.modify({
                  id: cache.identify({
                    __typename: 'Journey',
                    id: journeyId
                  }),
                  fields: {
                    chatButtons(existingChatButtons = []) {
                      const newChatButtonRef = cache.writeFragment({
                        data: data.chatButtonCreate,
                        fragment: gql`
                          fragment NewChatButton on ChatButton {
                            id
                          }
                        `
                      })
                      return [...existingChatButtons, newChatButtonRef]
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  }

  return (
    <Box sx={{ display: 'flex', px: 6, py: 2 }} data-testid="ChatOptionSummary">
      <Checkbox
        data-testid={`checkbox-${currentPlatform as string}`}
        checked={active}
        size="small"
        sx={{ p: 1, mr: 1 }}
        disabled={disableSelection && !active}
        onChange={handleToggle}
      />
      <Typography sx={{ my: 'auto' }}>{title}</Typography>
    </Box>
  )
}
