import { ReactElement, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AccordionItem } from './AccordionItem'
import { ChatIcon, ChatPlatformSelection } from './AccordionItem/AccordionItem'

interface ChatItem {
  id: string
  chatLink: string
  chatIcon: ChatIcon
}

export function ChatWidget(): ReactElement {
  // GET DATA FROM API
  const [chatWidgets, setChatWidgets] = useState<ChatItem[]>([
    {
      id: '1',
      chatLink: 'link1',
      chatIcon: ChatIcon.facebook
    },
    {
      id: '2',
      chatLink: 'link2',
      chatIcon: ChatIcon.default
    }
  ])

  // SET INITIAL STATE
  const [facebook, setFacebook] = useState<ChatPlatformSelection>({
    id: uuidv4(),
    title: 'Facebook Messenger',
    linkValue: '',
    chatIcon: ChatIcon.facebook,
    active: false,
    type: 'link',
    enableScript: true,
    scriptValue: ''
  })
  const [whatsApp, setWhatsApp] = useState<ChatPlatformSelection>({
    id: uuidv4(),
    title: 'WhatsApp',
    linkValue: '',
    chatIcon: ChatIcon.whatsApp,
    active: false,
    type: 'link',
    scriptValue: ''
  })
  const [telegram, setTelegram] = useState<ChatPlatformSelection>({
    id: uuidv4(),
    title: 'Telegram',
    linkValue: '',
    chatIcon: ChatIcon.telegram,
    active: false,
    type: 'link',
    scriptValue: ''
  })
  const [line, setLine] = useState<ChatPlatformSelection>({
    id: uuidv4(),
    title: 'LINE',
    linkValue: '',
    chatIcon: ChatIcon.line,
    active: false,
    type: 'link',
    scriptValue: ''
  })
  const [custom, setCustom] = useState<ChatPlatformSelection>({
    id: uuidv4(),
    title: 'Custom',
    linkValue: '',
    chatIcon: ChatIcon.default,
    active: false,
    type: 'link',
    scriptValue: '',
    enableIconSelect: true
  })

  // UPDATE STATES FROM API
  function setValues(chatWidgets: ChatItem[]): void {
    chatWidgets.forEach((chatWidget) => {
      switch (chatWidget.chatIcon) {
        case ChatIcon.facebook:
          setFacebook((prevFacebook) => ({
            ...prevFacebook,
            id: chatWidget.id,
            linkValue: chatWidget.chatLink,
            active: true
          }))
          break
        case ChatIcon.whatsApp:
          setWhatsApp((prevWhatsApp) => ({
            ...prevWhatsApp,
            id: chatWidget.id,
            linkValue: chatWidget.chatLink,
            active: true
          }))
          break
        case ChatIcon.telegram:
          setTelegram((prevTelegram) => ({
            ...prevTelegram,
            linkValue: chatWidget.chatLink,
            active: true
          }))
          break
        case ChatIcon.line:
          setLine((prevLine) => ({
            ...prevLine,
            id: chatWidget.id,
            linkValue: chatWidget.chatLink,
            active: true
          }))
          break
        default:
          setCustom((prevCustom) => ({
            ...prevCustom,
            id: chatWidget.id,
            linkValue: chatWidget.chatLink,
            chatIcon: chatWidget.chatIcon,
            active: true
          }))
          break
      }
    })
  }

  useEffect(() => {
    setValues(chatWidgets)
  }, [chatWidgets])

  // MUTATE DATA
  function handleUpdate(): void {
    const toUpdate = chatWidgets.map((widget) => {
      switch (widget.id) {
        case facebook.id:
          return {
            id: facebook.id,
            chatLink: facebook.linkValue,
            chatIcon: facebook.chatIcon
          }
        case whatsApp.id:
          return {
            id: whatsApp.id,
            chatLink: whatsApp.linkValue,
            chatIcon: whatsApp.chatIcon
          }
        case telegram.id:
          return {
            id: telegram.id,
            chatLink: telegram.linkValue,
            chatIcon: telegram.chatIcon
          }
        case line.id:
          return {
            id: line.id,
            chatLink: line.linkValue,
            chatIcon: line.chatIcon
          }
        default:
          return {
            id: custom.id,
            chatLink: custom.linkValue,
            chatIcon: custom.chatIcon
          }
      }
    })
    setChatWidgets(toUpdate)
  }

  function handleToggle(): void {}

  return (
    <>
      <AccordionItem
        value={facebook}
        setValue={setFacebook}
        handleUpdate={handleUpdate}
      />
      <AccordionItem
        value={whatsApp}
        setValue={setWhatsApp}
        handleUpdate={handleUpdate}
      />
      <AccordionItem
        value={telegram}
        setValue={setTelegram}
        handleUpdate={handleUpdate}
      />
      <AccordionItem
        value={line}
        setValue={setLine}
        handleUpdate={handleUpdate}
      />
      <AccordionItem
        value={custom}
        setValue={setCustom}
        handleUpdate={handleUpdate}
      />
    </>
  )
}
