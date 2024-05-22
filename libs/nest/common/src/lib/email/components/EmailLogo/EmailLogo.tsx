import { Img } from '@react-email/components'
import { ReactElement } from 'react'

export function EmailLogo(): ReactElement {
  return (
    <>
      <Img
        className="light-img"
        src="https://your.nextstep.is/LogoHorizontal.png"
      />
      <Img
        className="dark-img"
        style={{
          display: 'none',
          overflow: 'hidden',
          float: 'left',
          width: '0px',
          maxHeight: '0px',
          maxWidth: '0px',
          lineHeight: '0px',
          visibility: 'hidden'
        }}
        src="https://your.nextstep.is/LogoHorizontalDark.png"
      />
    </>
  )
}

export default EmailLogo
