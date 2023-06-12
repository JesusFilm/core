import { ReactElement, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Box from '@mui/material/Box'
import { ChatOption } from './ChatOption'
import { PlatformDetails } from './ChatOption/ChatOption'
import { ChatButton, Platform } from './utils/types' // TODO: replace with generated type
import { getByPlatform, getChatButton, stateSetter } from './utils'
import { HelperInfo } from './HelperInfo'

const defaultValues: PlatformDetails = {
  id: '',
  title: '',
  linkValue: '',
  chatIcon: undefined,
  active: false,
  type: 'link'
}

export function Chat(): ReactElement {
  const [facebook, setFacebook] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Facebook Messenger',
    chatIcon: Platform.facebook,
    helperInfo:
      'A text block containing a link with information on how the user can extract the correct link to Messenger chat.'
  })
  const [whatsApp, setWhatsApp] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'WhatsApp',
    chatIcon: Platform.whatsApp,
    helperInfo:
      'A text block containing a link with information on how the user can extract the correct link to WhatsApp chat.'
  })
  const [telegram, setTelegram] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Telegram',
    chatIcon: Platform.telegram
  })
  const [custom, setCustom] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Custom',
    chatIcon: undefined,
    enableIconSelect: true
  })

  // TODO: replace with gql query
  const [chatButtons, setChatButtons] = useState<ChatButton[]>([
    {
      id: '1',
      chatLink: 'link1',
      chatIcon: Platform.facebook
    },
    {
      id: '2',
      chatLink: 'link2',
      chatIcon: Platform.tikTok
    }
  ])

  function setValues(): void {
    const [facebookButton, whatsAppButton, telegramButton, customButton] = [
      Platform.facebook,
      Platform.whatsApp,
      Platform.telegram,
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
  }, [chatButtons, setChatButtons])

  function handleUpdate(): void {
    const toUpdate = chatButtons.forEach((button) => {
      const chatButton = getChatButton(button.id, [
        facebook,
        whatsApp,
        telegram,
        custom
      ])
      if (chatButton != null) {
        return chatButton
      }
    })
    // TODO: replace with gql mutation
    toUpdate != null && setChatButtons(toUpdate)
  }

  function handleToggle(id: string, checked: boolean): void {
    let toUpdate: ChatButton[]
    const newChatButton = getChatButton(id, [
      facebook,
      whatsApp,
      telegram,
      custom
    ])
    if (checked && chatButtons.length < 2 && newChatButton != null) {
      // TODO: replace with gql create mutation
      toUpdate = [...chatButtons, newChatButton]
    } else {
      // TODO: replace with gql delete mutation
      toUpdate = chatButtons.filter((button) => button.id !== id)
    }
    // TODO: remove
    setChatButtons(toUpdate)
  }

  return (
    <>
      <ChatOption
        value={facebook}
        disableSelection={chatButtons.length >= 2}
        setValue={setFacebook}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={whatsApp}
        disableSelection={chatButtons.length >= 2}
        setValue={setWhatsApp}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={telegram}
        disableSelection={chatButtons.length >= 2}
        setValue={setTelegram}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={custom}
        disableSelection={chatButtons.length >= 2}
        setValue={setCustom}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <Box sx={{ px: 6, py: 2, mt: 5 }}>
        <HelperInfo value="You can add no more than two chat platforms" />
      </Box>
    </>
  )
}
