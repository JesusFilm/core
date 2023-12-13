import Fab from '@mui/material/Fab'
import { useTheme } from '@mui/material/styles'
import Script from 'next/script'
import { ReactElement, useEffect, useState } from 'react'

interface EventObject {
  type: string
  url: string
  title: string
}

interface FormObject {
  name: string
  email: string
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
      ((fn: 'session-data', sessionObject: SessionObject) => void) &
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
  const [hasLoaded, setHasLoaded] = useState(false)

  console.log(userInfo)

  useEffect(() => {
    if (hasLoaded && window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        window.Beacon?.('prefill', {
          name: userInfo.name,
          email: userInfo.email
        })
      })
    }
  }, [hasLoaded, userInfo])

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
        {`window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8')`}
      </Script>
      <Fab
        aria-label="help"
        sx={{
          position: 'fixed',
          bottom: { xs: 13, md: 73 },
          zIndex: (theme) => theme.zIndex.drawer + 2,
          left: 9,
          width: 54,
          height: 54,
          backgroundColor: 'rgb(53, 53, 62)',
          '&:hover': {
            backgroundColor: 'rgb(45, 45, 54)'
          }
        }}
      >
        <svg width="16" height="24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.98785 17.5656L6.01976 15.4805C6.01976 14.9458 6.12612 14.5288 6.33882 14.2294C6.59407 13.652 7.03012 13.2243 7.64698 12.9463C8.2851 12.6469 9.0083 12.3154 9.81659 11.9519C10.8589 11.5669 11.6671 11.0216 12.2415 10.3159C12.8158 9.58879 13.1029 8.59437 13.1029 7.33264C13.1029 5.9212 12.635 4.81985 11.6991 4.02859C10.7631 3.21595 9.55071 2.80962 8.06175 2.80962C6.59407 2.80962 5.38164 3.10902 4.42445 3.70781C3.48854 4.3066 3.02058 5.26894 3.02058 6.59484H0.5C0.5 4.64877 1.17003 3.15179 2.51009 2.10391C3.87142 1.03464 5.7326 0.5 8.09366 0.5C9.60388 0.5 10.912 0.799396 12.0181 1.39819C13.1455 1.99698 14.0176 2.82032 14.6344 3.8682C15.2513 4.91608 15.5384 6.09228 15.4959 7.39679C15.4746 9.10763 15.0705 10.487 14.2835 11.5349C13.4964 12.5614 12.3372 13.3954 10.8057 14.037C10.1463 14.3364 9.64642 14.5716 9.30609 14.7427C8.96576 14.9138 8.73178 15.1062 8.60416 15.3201C8.47653 15.5126 8.40209 15.7799 8.38082 16.122C8.38082 16.4642 8.38082 16.9454 8.38082 17.5656H5.98785ZM7.16838 23.5C6.7217 23.5 6.32819 23.3396 5.98785 23.0188C5.66879 22.6767 5.50926 22.281 5.50926 21.8319C5.50926 21.3615 5.66879 20.9658 5.98785 20.645C6.32819 20.3243 6.7217 20.1639 7.16838 20.1639C7.61507 20.1639 7.99794 20.3243 8.317 20.645C8.63606 20.9658 8.80623 21.3615 8.8275 21.8319C8.8275 22.281 8.65734 22.6767 8.317 23.0188C7.99794 23.3396 7.61507 23.5 7.16838 23.5Z"
            fill="#FFF"
          />
        </svg>
      </Fab>
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
