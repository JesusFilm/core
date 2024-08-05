import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { ReactElement, useEffect, useState } from 'react'

import { FormObject } from '@core/journeys/ui/setBeaconPageViewed'

interface BeaconInitProps {
  userInfo?: FormObject
}

export function BeaconInit({ userInfo }: BeaconInitProps): ReactElement {
  const { breakpoints, zIndex } = useTheme()
  const router = useRouter()

  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (hasLoaded && window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        window.Beacon?.('prefill', {
          name: userInfo?.name ?? '',
          email: userInfo?.email ?? ''
        })
      })
    }
    // close the beacon when the url changes
    const handleRouteChange = (): void => {
      window.Beacon?.('close')
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
            // icon shows close button on mobile more consistently
            style: 'icon',
            position: 'right',
            hideFABOnMobile: true
          },
        });
        `}
      </Script>
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
          top: 65px;
          right: 16px;
          width: 327px;
          max-height: calc(100vh - 81px);
          height: calc(100vh - 65px);
        }
        .BeaconFabButtonFrame {
          /* hides the icon */
          display: none !important;
        }
        ${breakpoints.down('md')} {
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            height: calc(100vh - 42px);
            border-radius: 0px;
            left: 0px;
            max-height: 100svh;
            right: 0px;
            top: 40px;
            width: 100shv;
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
