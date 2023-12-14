// import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
// import useMediaQuery from '@mui/material/useMediaQuery'
import Script from 'next/script'
import { ReactElement } from 'react'

import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'

declare global {
  interface Window {
    Beacon?: ((fn: 'init', id: string) => void) &
      ((
        fn: 'config',
        config: { mode: 'askFirst'; enableFabAnimation: boolean }
      ) => void) &
      ((fn: 'open') => void) &
      ((fn: 'toggle') => void)
  }
}

export function HelpScoutBeacon(): ReactElement {
  const { breakpoints } = useTheme()
  const handleClick = (): void => {
    if (window.Beacon != null) {
      window.Beacon('toggle')
    }
  }

  return (
    <>
      <Script id="beacon" className="beacon" strategy="lazyOnload">
        {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
      </Script>
      <Script id="init" className="init" strategy="lazyOnload">
        {`
        window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8');
        window.Beacon('config', {
          display: {
            style: 'manual',
            position: 'right',
            zIndex: 999999999,
          },
        });
        `}
      </Script>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          top: { xs: 10, md: 10 },
          zIndex: (theme) => theme.zIndex.modal + 2,
          right: 10,
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
        }

        ${breakpoints.up('md')} {
          .hsds-beacon .BeaconFabButtonFrame.is-configDisplayRight,
          .hsds-beacon .BeaconFabButtonFrame--right {
            bottom: 70px !important;
          }
          .hsds-beacon .BeaconContainer.is-configDisplayRight {
            top: 40px;
          }
        }
      `}</style>
    </>
  )
}
