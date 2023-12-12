import { useTheme } from '@mui/material/styles'
import Script from 'next/script'
import { ReactElement, useEffect } from 'react'

interface EventObject {
  type: string
  url: string
  title: string
}

interface SessionObject {
  journeyPreview: string
  team: string
}

declare global {
  interface Window {
    Beacon?: ((fn: 'init', id: string) => void) &
      ((
        fn: 'config',
        config: { mode: 'askFirst'; enableFabAnimation: boolean }
      ) => void) &
      ((fn: 'open') => void) &
      ((fn: 'event', eventObject: EventObject) => void) &
      ((fn: 'search', value: string) => void) &
      ((fn: 'on', eventType: string, callback: () => void) => void) &
      ((fn: 'session-data', sessionObject: SessionObject) => void)
  }
}

export function HelpScoutBeacon(): ReactElement {
  const { breakpoints, zIndex } = useTheme()

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.Beacon != null) {
        clearInterval(intervalId)
        window.Beacon('on', 'open', () => {
          console.log('I have been clicked')
          const urlParam = new URLSearchParams(window.location.search)
          const param = urlParam.get('param')
          console.log(param)

          if (urlParam.has('param') && param === 'social') {
            window.Beacon?.('search', 'social')
          }
        })
      }
    }, 1000)
  }, [])

  return (
    <>
      <Script
        id="beacon"
        className="beacon"
        strategy="lazyOnload"
      >{`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}</Script>
      <Script id="init" className="init" strategy="lazyOnload">{`
        window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8')`}</Script>
      <style>{`
        #beacon-container {
          z-index: ${zIndex.drawer + 2};
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
          .hsds-beacon .BeaconContainer.is-configDisplayLeft {
            height: 100%;
            border-radius: 0px;
            left: 0px;
            max-height: 100%;
            right: 0px;
            top: 40px;
            width: 100%;
          }
        }

        ${breakpoints.up('md')} {
          .hsds-beacon .BeaconFabButtonFrame.is-configDisplayLeft,
          .hsds-beacon .BeaconFabButtonFrame--left {
            bottom: 70px !important;
          }
          .hsds-beacon .BeaconContainer.is-configDisplayLeft {
            bottom: 140px;
          }
        }
      `}</style>
    </>
  )
}
