import { useTheme } from '@mui/material/styles'
// import useMediaQuery from '@mui/material/useMediaQuery'
import { useUser } from 'next-firebase-auth'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { BeaconButton } from './BeaconButton/BeaconButton'

interface HelpScoutBeaconProps {
  variant: 'iconButton' | 'menuItem'
  handleClick?: () => void
}

export function HelpScoutBeacon({
  variant,
  handleClick
}: HelpScoutBeaconProps): ReactElement {
  const user = useUser()
  const { breakpoints, zIndex } = useTheme()
  const router = useRouter()
  const previousUrlRef = useRef(router.asPath)
  // const mdUp = useMediaQuery(breakpoints.up('md'))
  const [hasLoaded, setHasLoaded] = useState(false)
  const [beaconOpen, setBeaconOpen] = useState(false)

  // const newUserPaths = [
  //   '/users/sign-in',
  //   '/users/terms-and-conditions',
  //   '/onboarding-form',
  //   '/teams/new'
  // ]

  const handleBeaconOpen = (): void => {
    if (window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        setBeaconOpen(true)
      })
      window.Beacon('on', 'close', () => {
        setBeaconOpen(false)
      })
      window.Beacon('toggle')
    } else {
      void router.push('https://support.nextstep.is/')
    }
    handleClick?.()
  }

  useEffect(() => {
    if (hasLoaded && window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        window.Beacon?.('prefill', {
          name: user?.displayName ?? '',
          email: user?.email ?? ''
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
  }, [hasLoaded, router, user])

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
            // icon shows close button on mobile more consistently
            style: 'icon',
            position: 'right',
            zIndex: ${zIndex.modal + 2},
          },
        });
        `}
      </Script>

      <BeaconButton
        variant={variant}
        onClick={handleBeaconOpen}
        beaconOpen={beaconOpen}
      />

      <style>{`
        #beacon-container {
          z-index: ${zIndex.modal + 2} !important;
          position: sticky;
        }
        .hsds-beacon .BeaconFabButtonFrame.is-configDisplayRight,
        .hsds-beacon .BeaconFabButtonFrame--left {
          left: 6px !important;
          bottom: 10px !important;
          transform: scale(0.9) !important;
        }
        .hsds-beacon .BeaconContainer.is-configDisplayRight {
          top: 47px;
          right: 0px;
          width: 327px;
          max-height: none;
          height: calc(100vh - 47px);
        }
        .hsds-beacon .dDhkLh {
          /* hides the icon */
          display: none !important;
        }
        ${breakpoints.down('md')} {
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            height: calc(100vh - 42px);
            border-radius: 0px;
            left: 0px;
            max-height: 100%;
            right: 0px;
            top: 40px;
            width: 100%;
          }
          .NotificationsFramecss__NotificationsFrameUI-sc-1ah8ai4-1 {
            // position: fixed !important;
            top: 10px !important;
            padding: 0px !important;
          }
        }        
        ${breakpoints.up('md')} {
          .NotificationsFramecss__NotificationsFrameUI-sc-1ah8ai4-1 {
            position: fixed !important;
            top: 30px !important;
            right: 25px !important;
            // width: 325px !important;
          }
        }
        `}</style>
    </>
  )
}
