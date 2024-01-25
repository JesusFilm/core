import Box from '@mui/system/Box'
import { useEffect, useState } from 'react'

import { ChatPlatform } from '../../../../../__generated__/globalTypes'
import { BaseChatButton } from '../BaseChatButton'
import { ChatButtonIcon } from '../ChatButtonIcon'

declare global {
  interface Window {
    fbAsyncInit: () => void
  }
}

declare let FB: FacebookStatic
interface FacebookStatic {
  /**
   * The method FB.init() is used to initialize and setup the SDK.
   *
   * @param params params for the initialization.
   */
  init: (params: InitParams) => void

  CustomerChat: {
    showDialog: () => void
    hideDialog: () => void
  }
}

interface InitParams {
  appId?: string | undefined
  version: string
  cookie?: boolean | undefined
  status?: boolean | undefined
  xfbml?: boolean | undefined
  frictionlessRequests?: boolean | undefined
  hideFlashCallback?: boolean | undefined
  autoLogAppEvents?: boolean | undefined
}

interface FBWidgetButtonProps {
  primary: boolean
  platform: ChatPlatform | null
}

export function FBWidgetButton({
  primary,
  platform
}: FBWidgetButtonProps): JSX.Element {
  const [show, setShow] = useState<boolean>(false)

  const handleClick = (): void => {
    show ? FB.CustomerChat.hideDialog() : FB.CustomerChat.showDialog()

    setShow((prev) => !prev)
  }

  const fbInitalized = (): boolean =>
    document.querySelector('script#facebook-jssdk') !== null

  const removeSDK = (ids: string[]): void => {
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el != null && el.parentNode != null) {
        el.parentNode.removeChild(el)
      }
    })
  }

  useEffect(() => {
    window.fbAsyncInit = () => {
      FB.init({
        xfbml: true,
        version: 'v19.0'
      })
    }

    if (!fbInitalized()) {
      ;(function (d, s: 'script', id: 'facebook-jssdk') {
        const js = d.createElement(s)
        js.id = id
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js'
        js.async = true
        js.defer = true
        js.crossOrigin = 'anonymous'
        document.body.appendChild(js)
      })(document, 'script', 'facebook-jssdk')
    }

    return () => {
      removeSDK(['fb-root', 'facebook-jssdk'])
    }
  }, [])

  return (
    <>
      <BaseChatButton primary={primary} onClick={handleClick}>
        <ChatButtonIcon platform={platform} primary={primary} />
      </BaseChatButton>
      <Box
        sx={{
          '& .fb-customerchat': {
            display: 'none !important'
          },
          '& .fb_dialog': { display: 'none !important' }
        }}
      >
        <div id="fb-root" />
        <div
          id="fb-customer-chat"
          className="fb-customerchat"
          page-id="193570130514065"
        />
      </Box>
    </>
  )
}
