import { useTheme } from '@mui/material/styles'
import Script from 'next/script'
import { ReactElement } from 'react'

export function HelpScoutBeacon(): ReactElement {
  const { breakpoints } = useTheme()

  return (
    <>
      <Script
        id="help-scout"
        className="help-scout"
        strategy="afterInteractive"
      >{`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}</Script>
      <Script
        id="help-scout-init"
        className="help-scout-init"
        strategy="afterInteractive"
      >{`
window.Beacon('init', '4f0abc47-b29c-454a-b618-39b34fd116b8')`}</Script>
      <style>{`
        #beacon-container {
          z-index: 1500;
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
