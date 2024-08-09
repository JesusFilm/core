import { Head as ReactEmailHead } from '@react-email/components'
import { ReactElement } from 'react'

export function Head(): ReactElement {
  return (
    <ReactEmailHead>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <style>
        {`
          @media (prefers-color-scheme: dark ) {
            /* Shows Dark Mode-Only Content, Like Images */
            .dark-img { display:block !important; width: auto !important; overflow: visible !important; float: none !important; max-height:inherit !important; max-width:inherit !important; line-height: auto !important; margin-top:0px !important; visibility:inherit !important; }
              
            /* Hides Light Mode-Only Content, Like Images */
            .light-img { display:none; display:none !important; }
            }

          /* Shows Dark Mode-Only Content, Like Images */
          [data-ogsc] .dark-img { display:block !important; width: auto !important; overflow: visible !important; float: none !important; max-height:inherit !important; max-width:inherit !important; line-height: auto !important; margin-top:0px !important; visibility:inherit !important; } 
          
          /* Hides Light Mode-Only Content, Like Images */
          [data-ogsc] .light-img { display:none; display:none !important; }
          }
        `}
      </style>
    </ReactEmailHead>
  )
}

export default Head
