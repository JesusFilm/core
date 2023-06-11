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

  function findChatPlatform(platform?: ChatIcon): ChatItem | undefined {
    let res
    if (platform == null) {
      res = chatWidgets.find(
        (chatWidget) =>
          chatWidget.chatIcon !== ChatIcon.facebook &&
          chatWidget.chatIcon !== ChatIcon.whatsApp &&
          chatWidget.chatIcon !== ChatIcon.telegram &&
          chatWidget.chatIcon !== ChatIcon.line
      )
    } else {
      res = chatWidgets.find((chatWidget) => chatWidget.chatIcon === platform)
    }
    return res
  }

  // UPDATE STATES FROM API
  function setValues(): void {
    const facebookWidget = findChatPlatform(ChatIcon.facebook)
    const whatsAppWidget = findChatPlatform(ChatIcon.whatsApp)
    const telegramWidget = findChatPlatform(ChatIcon.telegram)
    const lineWidget = findChatPlatform(ChatIcon.line)
    const customWidget = findChatPlatform()

    if (facebookWidget != null) {
      setFacebook((prevValue) => ({
        ...prevValue,
        id: facebookWidget.id,
        linkValue: facebookWidget.chatLink,
        active: true
      }))
    } else {
      setFacebook((prevValue) => ({
        ...prevValue,
        active: false
      }))
    }
    if (whatsAppWidget != null) {
      setWhatsApp((prevValue) => ({
        ...prevValue,
        id: whatsAppWidget.id,
        linkValue: whatsAppWidget.chatLink,
        active: true
      }))
    } else {
      setWhatsApp((prevValue) => ({
        ...prevValue,
        active: false
      }))
    }
    if (telegramWidget != null) {
      setTelegram((prevValue) => ({
        ...prevValue,
        id: telegramWidget.id,
        linkValue: telegramWidget.chatLink,
        active: true
      }))
    } else {
      setTelegram((prevValue) => ({
        ...prevValue,
        active: false
      }))
    }
    if (lineWidget != null) {
      setLine((prevValue) => ({
        ...prevValue,
        id: lineWidget.id,
        linkValue: lineWidget.chatLink,
        active: true
      }))
    } else {
      setLine((prevValue) => ({
        ...prevValue,
        active: false
      }))
    }
    if (customWidget != null) {
      setCustom((prevValue) => ({
        ...prevValue,
        id: customWidget.id,
        linkValue: customWidget.chatLink,
        active: true
      }))
    } else {
      setCustom((prevValue) => ({
        ...prevValue,
        active: false
      }))
    }
  }

  useEffect(() => {
    //  should only run when mutations are fired
    setValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatWidgets, setChatWidgets])

  function findWidget(id: string): ChatItem {
    switch (id) {
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
  }

  // MUTATE DATA
  function handleUpdate(): void {
    const toUpdate = chatWidgets.map((widget) => findWidget(widget.id))
    setChatWidgets(toUpdate)
  }

  function handleToggle(id: string, checked: boolean): void {
    let toUpdate: ChatItem[]
    if (checked && chatWidgets.length < 2) {
      toUpdate = [...chatWidgets, findWidget(id)]
    } else {
      toUpdate = chatWidgets.filter((widget) => widget.id !== id)
    }
    setChatWidgets(toUpdate)
  }

  return (
    <>
      <AccordionItem
        value={facebook}
        setValue={setFacebook}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <AccordionItem
        value={whatsApp}
        setValue={setWhatsApp}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <AccordionItem
        value={telegram}
        setValue={setTelegram}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <AccordionItem
        value={line}
        setValue={setLine}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
      <AccordionItem
        value={custom}
        setValue={setCustom}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    </>
  )
}
