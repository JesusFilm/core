import { ReactElement } from 'react'
import { IntegrationsListItem } from './IntegrationsListItem'

export function IntegrationsList(): ReactElement {
  return (
    <>
      <div>IntegrationsList</div>
      <IntegrationsListItem
        imageSrc="https://source.unsplash.com/300x200/?growth"
        title="Growth Space"
        url=""
      />
    </>
  )
}
