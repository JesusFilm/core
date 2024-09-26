import { Reference, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ChangeEvent, ReactElement } from 'react'

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
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleToggle(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    // Restricts mutations from running if loading for spam click protection, must be QA'd
    if (createLoading || removeLoading) return
    if (event.target.checked && !disableSelection) {
      try {
        await journeyChatButtonCreate({
          variables: {
            journeyId,
            input: {
              link: currentLink,
              platform: currentPlatform
            }
          },
          update(cache, { data }) {
            if (data?.chatButtonCreate != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journeyId }),
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
      } catch (error) {
        enqueueSnackbar(
          t('Error adding button, please reload and try again.'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
      }
    } else {
      if (chatButtonId != null) {
        try {
          await journeyChatButtonRemove({
            variables: { chatButtonRemoveId: chatButtonId },
            update(cache, { data }) {
              if (data?.chatButtonRemove != null) {
                cache.modify({
                  id: cache.identify({ __typename: 'Journey', id: journeyId }),
                  fields: {
                    chatButtons(refs, { readField }) {
                      return refs.filter(
                        (ref: Reference) =>
                          chatButtonId !== readField('id', ref)
                      )
                    }
                  }
                })
                cache.evict({ id: `ChatButton:${chatButtonId}` })
              }
            }
          })
        } catch (error) {
          enqueueSnackbar(
            t('Error removing button, please reload and try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
        }
      }
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
