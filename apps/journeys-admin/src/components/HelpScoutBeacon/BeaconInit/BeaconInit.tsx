import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { ReactElement, useEffect } from 'react'

import { FormObject } from '@core/journeys/ui/beaconHooks'

import {
  BEACON_ICON_DISPLAY,
  BEACON_STYLE,
  DESKTOP_APP_BAR_GAP,
  DESKTOP_CONTAINER_HEIGHT,
  DESKTOP_CONTAINER_MAX_HEIGHT,
  DESKTOP_CONTAINER_PADDING,
  DESKTOP_CONTAINER_WIDTH,
  MOBILE_APP_BAR_GAP,
  MOBILE_CONTAINER_HEIGHT,
  MOBILE_CONTAINER_MAX_HEIGHT,
  MOBILE_CONTAINER_WIDTH
} from './constants'

interface BeaconInitProps {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
  userInfo?: FormObject
}

export function BeaconInit({
  loaded,
  setLoaded,
  userInfo
}: BeaconInitProps): ReactElement {
  const { breakpoints, zIndex } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (loaded && window.Beacon != null) {
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
      window.Beacon?.('navigate', '/')
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [loaded, router, userInfo])

  return (
    <>
      <Script id="beacon" className="beacon" strategy="lazyOnload">
        {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
      </Script>
      <Script
        id="init"
        className="init"
        strategy="lazyOnload"
        onReady={() => setLoaded(true)}
      >
        {`
        window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8');
        window.Beacon('config', {
          display: {
            style: '${BEACON_STYLE}',
            position: 'right'
          },
        });
        `}
      </Script>
      <style>{`
        #beacon-container {
          z-index: ${zIndex.modal + 2} !important;
          position: sticky;
        }
        .BeaconFabButtonFrame {
          display: ${BEACON_ICON_DISPLAY};
        }
        .hsds-beacon .BeaconContainer.is-configDisplayRight {
          top: ${DESKTOP_APP_BAR_GAP};
          right: ${DESKTOP_CONTAINER_PADDING};
          width: ${DESKTOP_CONTAINER_WIDTH};
          height: ${DESKTOP_CONTAINER_HEIGHT};
          max-height: ${DESKTOP_CONTAINER_MAX_HEIGHT};
        }
        ${breakpoints.down('md')} {
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            top: ${MOBILE_APP_BAR_GAP};
            width: ${MOBILE_CONTAINER_WIDTH};
            height: ${MOBILE_CONTAINER_HEIGHT};
            max-height: ${MOBILE_CONTAINER_MAX_HEIGHT};
            border-radius: 0px;
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
        .hsds-beacon .BeaconFabButtonFrame.is-configDisplayRight,
        .hsds-beacon .BeaconFabButtonFrame--left {
          left: 6px !important;
          bottom: 10px !important;
          transform: scale(0.9) !important;
        }
        `}</style>
    </>
  )
}
