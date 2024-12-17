import { Button } from '@react-email/components'
import { ReactElement } from 'react'

interface ActionButtonProps {
  buttonText: string
  url: string
}

export function ActionButton({
  buttonText,
  url
}: ActionButtonProps): ReactElement {
  return (
    <Button
      className="bg-[#26262D] rounded-lg text-white text-[16px] font-semibold no-underline text-center px-5 py-3"
      style={{
        font: '16px "Open Sans", sans-serif'
      }}
      href={url}
    >
      {buttonText}
    </Button>
  )
}

export default ActionButton
