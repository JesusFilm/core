import { ReactElement, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { gql, useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { ChatPlatform } from '../../../__generated__/globalTypes'
import { GetJourneyChatButtons } from '../../../__generated__/GetJourneyChatButtons'
import { JourneyChatButtonCreate } from '../../../__generated__/JourneyChatButtonCreate'
import { JourneyChatButtonUpdate } from '../../../__generated__/JourneyChatButtonUpdate'
import { JourneyChatButtonRemove } from '../../../__generated__/JourneyChatButtonRemove'
import { PlatformDetails } from './ChatOption/ChatOption'
import { ChatOption } from './ChatOption'

import { getByPlatform, getChatButton, stateSetter } from './utils'

export const GET_JOURNEY_CHAT_BUTTONS = gql`
  query GetJourneyChatButtons($id: ID!, $idType: IdType) {
    journey(id: $id, idType: databaseId) {
      chatButtons {
        id
        link
        platform
      }
    }
  }
`

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

export const JOURNEY_CHAT_BUTTON_UPDATE = gql`
  mutation JourneyChatButtonUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ChatButtonUpdateInput!
  ) {
    chatButtonUpdate(
      id: $chatButtonUpdateId
      journeyId: $journeyId
      input: $input
    ) {
      id
      link
      platform
    }
  }
`

export const JOURNEY_CHAT_BUTTON_REMOVE = gql`
  mutation JourneyChatButtonRemove($id: ID!) {
    chatButtonRemove(id: $chatButtonRemoveId) {
      id
      link
      platform
    }
  }
`

interface Props {
  journeyId: string
}

// TODO: add translation
// TODO: add optimistic response

export function Chat({ journeyId }: Props): ReactElement {
  const defaultValues: PlatformDetails = {
    id: '',
    title: '',
    link: '',
    platform: null,
    active: false
  }
  const [facebook, setFacebook] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Facebook Messenger',
    platform: ChatPlatform.facebook,
    helperInfo:
      'A text block containing a link with information on how the user can extract the correct link to Messenger chat.'
  })
  const [whatsApp, setWhatsApp] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'WhatsApp',
    platform: ChatPlatform.whatsApp,
    helperInfo:
      'A text block containing a link with information on how the user can extract the correct link to WhatsApp chat.'
  })
  const [telegram, setTelegram] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Telegram',
    platform: ChatPlatform.telegram,
    helperInfo:
      'A text block containing a link with information on how the user can extract the correct link to Telegram chat.'
  })
  const [custom, setCustom] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Custom',
    enableIconSelect: true
  })

  const { data } = useQuery<GetJourneyChatButtons>(GET_JOURNEY_CHAT_BUTTONS, {
    variables: {
      id: journeyId
    }
  })
  const [journeyChatButtonCreate] = useMutation<JourneyChatButtonCreate>(
    JOURNEY_CHAT_BUTTON_CREATE
  )
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )
  const [journeyChatButtonRemove] = useMutation<JourneyChatButtonRemove>(
    JOURNEY_CHAT_BUTTON_REMOVE
  )
  const chatButtons = data?.journey?.chatButtons ?? []

  function setValues(): void {
    const [facebookButton, whatsAppButton, telegramButton, customButton] = [
      ChatPlatform.facebook,
      ChatPlatform.whatsApp,
      ChatPlatform.telegram,
      undefined
    ].map((platform) => getByPlatform(chatButtons, platform))

    stateSetter(setFacebook, facebookButton)
    stateSetter(setWhatsApp, whatsAppButton)
    stateSetter(setTelegram, telegramButton)
    stateSetter(setCustom, customButton)
  }

  useEffect(() => {
    //  should only run when the query and mutations run
    setValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    journeyChatButtonCreate,
    journeyChatButtonUpdate,
    journeyChatButtonRemove
  ])

  async function handleUpdate(id: string): Promise<void> {
    const toUpdate = getChatButton(id, [facebook, whatsApp, telegram, custom])
    toUpdate != null &&
      (await journeyChatButtonUpdate({
        variables: toUpdate
      }))
  }

  async function handleToggle(id: string, checked: boolean): Promise<void> {
    const newChatButton = getChatButton(id, [
      facebook,
      whatsApp,
      telegram,
      custom
    ])
    if (checked && chatButtons.length < 2 && newChatButton != null) {
      await journeyChatButtonCreate({
        variables: newChatButton
      })
    } else {
      await journeyChatButtonRemove({
        variables: { id }
      })
    }
  }

  const maxSelection = chatButtons.length >= 2

  return (
    <>
      <ChatOption
        value={facebook}
        disableSelection={maxSelection}
        setValue={setFacebook}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={whatsApp}
        disableSelection={maxSelection}
        setValue={setWhatsApp}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={telegram}
        disableSelection={maxSelection}
        setValue={setTelegram}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={custom}
        disableSelection={maxSelection}
        setValue={setCustom}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <Box
        sx={{
          display: maxSelection ? 'flex' : 'none',
          alignItems: 'center',
          px: 6,
          py: 2,
          mt: 5
        }}
      >
        <InfoOutlinedIcon sx={{ mr: 3 }} />
        <Typography variant="caption">
          You can add no more than two chat platforms
        </Typography>
      </Box>
    </>
  )
}
