import { Button } from '@react-email/components'
import { ReactElement } from 'react'

interface ActionButtonProps {
  buttonText: string
  url: string
  style?: string
}

export function ActionButton({
  buttonText,
  url,
  style
}: ActionButtonProps): ReactElement {
  const className =
    style != null
      ? style
      : 'bg-[#26262D] rounded-lg text-white text-[16px] font-semibold no-underline text-center px-5 py-3'

  return (
    <Button
      className={className}
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
