import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { ReactElement, useEffect, useRef, useState } from 'react'

import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'

interface EventObject {
  type: string
  url: string
  title: string
}

interface FormObject {
  name: string
  email: string
}
declare global {
  interface Window {
    Beacon?: ((fn: 'init', id: string) => void) &
      ((
        fn: 'config',
        config: { mode: 'askFirst'; enableFabAnimation: boolean }
      ) => void) &
      ((fn: 'open') => void) &
      ((fn: 'close') => void) &
      ((fn: 'event', eventObject: EventObject) => void) &
      ((fn: 'session-data', sessionObject: SessionObject) => void) &
      ((fn: 'toggle') => void)
      ((fn: 'search', value: string) => void) &
      ((fn: 'on', eventType: string, callback: () => void) => void) &
      ((fn: 'prefill', formObject: FormObject) => void)
  }
}

interface HelpScoutBeaconProps {
  userInfo: FormObject
}

export function HelpScoutBeacon({
  userInfo
}: HelpScoutBeaconProps): ReactElement {
  const { breakpoints, zIndex } = useTheme()
  const router = useRouter()
  const previousUrlRef = useRef(router.asPath)
  const [hasLoaded, setHasLoaded] = useState(false)

  const handleClick = (): void => {
    if (window.Beacon != null) {
      window.Beacon('toggle')
    } else {
      void router.push('https://support.nextstep.is/')
    }
  }

  useEffect(() => {
    if (hasLoaded && window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        window.Beacon?.('prefill', {
          name: userInfo.name,
          email: userInfo.email
        })
      })
    }
    // close the beacon when the url changes if it's still open
    const handleRouteChange = (url): void => {
      if (url !== previousUrlRef.current) {
        window.Beacon?.('close')
        previousUrlRef.current = url
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [hasLoaded, router, userInfo])

  return (
    <>
      <Script id="beacon" className="beacon" strategy="lazyOnload">
        {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
      </Script>
      <Script
        id="init"
        className="init"
        strategy="lazyOnload"
        onReady={() => setHasLoaded(true)}
      >
        {`
        window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8');
        window.Beacon('config', {
          display: {
            style: 'manual',
            position: 'right',
            zIndex: ${zIndex.modal + 2},
          },
        });
        `}
      </Script>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="Help"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          top: { xs: 11.5, md: 11.5 },
          zIndex: zIndex.modal + 2,
          right: { xs: 10, md: 10 },
          width: 24,
          height: 24,
          backgroundColor: 'rgb(53, 53, 62)',
          '&:hover': {
            backgroundColor: 'rgb(45, 45, 54)'
          }
        }}
      >
        <HelpCircleContained sx={{ color: 'background.paper' }} />
      </IconButton>
      <style>{`
        #beacon-container {
          z-index: 999999999;
          position: sticky;
        }
        .hsds-beacon .BeaconFabButtonFrame.is-configDisplayLeft,
        .hsds-beacon .BeaconFabButtonFrame--left {
          left: 6px !important;
          bottom: 10px !important;
          transform: scale(0.9) !important;
        }

        .hsds-beacon .BeaconContainer.is-configDisplayLeft {
          left: 6px;
          bottom: 80px;
        }

        ${breakpoints.down('md')} {
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            height: 100%;
            border-radius: 0px;
            left: 0px;
            max-height: 100%;
            right: 0px;
            top: 40px;
            width: 100%;
          }
          .hsds-beacon .c-BeaconCloseButton {
            z-index: 9999999990999;
            top: -27px !important; /* Adjust as needed */
            right: 37px !important; /* Adjust as needed */
          }
        }

        ${breakpoints.up('md')} {
          .hsds-beacon .BeaconFabButtonFrame.is-configDisplayRight,
          .hsds-beacon .BeaconFabButtonFrame--right {
            bottom: 70px !important;
          }
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            top: 40px;
          }
          .hsds-beacon .c-BeaconCloseButton {
            top: -27px !important; /* Adjust as needed */
            right: 19px !important; /* Adjust as needed */
          }
        }
      `}</style>
    </>
  )
}
