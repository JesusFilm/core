import { Button, Html } from '@react-email/components'
import { ReactElement } from 'react'

interface EmailProps {
  url: string
}

function Email({ url }: EmailProps): ReactElement {
  return (
    <Html>
      <Button
        href={url}
        style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
      >
        Click me
      </Button>
    </Html>
  )
}

Email.PreviewProps = {
  url: 'https://example.com'
} satisfies EmailProps

export default Email
