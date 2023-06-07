import { ReactElement } from 'react'
import { noop } from 'lodash'
import { AccordionItem } from './AccordionItem'

export function ChatWidget(): ReactElement {
  return (
    <>
      <AccordionItem
        title="Facebook Messenger"
        handleAction={noop}
        active={false}
        enableScript
        type="link"
      />
      <AccordionItem title="WhatsApp" handleAction={noop} active={false} />
      <AccordionItem title="Telegram" handleAction={noop} active={false} />
      <AccordionItem title="Custom" handleAction={noop} active={false} />
    </>
  )
}
