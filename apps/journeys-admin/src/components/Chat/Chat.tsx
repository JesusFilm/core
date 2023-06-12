import { ReactElement, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatOption } from './ChatOption'
import { PlatformDetails } from './ChatOption/ChatOption'
import { ChatButton, Platform } from './utils/types' // TODO: replace with generated type
import { getByPlatform, getChatButton, stateSetter } from './utils'

const defaultValues: PlatformDetails = {
  id: '',
  title: '',
  linkValue: '',
  chatIcon: Platform.default,
  active: false,
  type: 'link'
  // enableScript: false,
  // scriptValue: ''
}

export function Chat(): ReactElement {
  const [facebook, setFacebook] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Facebook Messenger',
    chatIcon: Platform.facebook
  })
  const [whatsApp, setWhatsApp] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'WhatsApp',
    chatIcon: Platform.whatsApp
  })
  const [telegram, setTelegram] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Telegram',
    chatIcon: Platform.telegram
  })
  const [line, setLine] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'LINE',
    chatIcon: Platform.line
  })
  const [custom, setCustom] = useState<PlatformDetails>({
    ...defaultValues,
    id: uuidv4(),
    title: 'Custom',
    chatIcon: Platform.default,
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
      chatIcon: Platform.default
    }
  ])

  function setValues(): void {
    const [
      facebookButton,
      whatsAppButton,
      telegramButton,
      lineButton,
      customButton
    ] = [
      Platform.facebook,
      Platform.whatsApp,
      Platform.telegram,
      Platform.line,
      undefined
    ].map((platform) => getByPlatform(chatButtons, platform))

    stateSetter(setFacebook, facebookButton)
    stateSetter(setWhatsApp, whatsAppButton)
    stateSetter(setTelegram, telegramButton)
    stateSetter(setLine, lineButton)
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
        line,
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
      line,
      custom
    ])
    if (checked && chatButtons.length < 2 && newChatButton != null) {
      toUpdate = [...chatButtons, newChatButton]
    } else {
      toUpdate = chatButtons.filter((button) => button.id !== id)
    }
    // TODO: replace with gql mutation
    setChatButtons(toUpdate)
  }

  return (
    <>
      <ChatOption
        value={facebook}
        setValue={setFacebook}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={whatsApp}
        setValue={setWhatsApp}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={telegram}
        setValue={setTelegram}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={line}
        setValue={setLine}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <ChatOption
        value={custom}
        setValue={setCustom}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    </>
  )
}
