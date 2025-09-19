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
      className="rounded-lg bg-[#26262D] px-5 py-3 text-center text-[16px] font-semibold text-white no-underline"
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
