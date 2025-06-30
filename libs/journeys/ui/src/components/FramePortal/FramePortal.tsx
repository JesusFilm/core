import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef
} from 'react'
import { createPortal } from 'react-dom'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

// Import the globals.css to ensure Tailwind styles are available
import '../../globals.css'

interface ContentProps {
  children: ReactNode
  document: Document
}

function Content({ children, document }: ContentProps): ReactElement {
  const cache = useMemo(() => {
    // Copy the parent document's head content completely
    document.head.innerHTML = window.document.head.innerHTML

    // Add the Google Fonts link if not already present
    const googleFontsHref =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&family=El+Messiri:wght@400;600;700&display=swap'
    if (!document.querySelector(`link[href="${googleFontsHref}"]`)) {
      const googleFontsLink = document.createElement('link')
      googleFontsLink.href = googleFontsHref
      googleFontsLink.rel = 'stylesheet'
      document.head.appendChild(googleFontsLink)
    }

    // Find and boost Tailwind utility specificity to override MUI
    const tailwindBoostStyle = document.createElement('style')
    tailwindBoostStyle.setAttribute('data-tailwind-boost', 'true')

    // Create CSS that gives Tailwind utilities higher specificity than MUI
    let boostCSS = `
      /* Boost Tailwind utility specificity to override MUI CSS-in-JS */
      /* Background utilities */
    `

    // Find all Tailwind background utilities in the copied styles
    const allStyles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent || '')
      .join('\n')

    // Extract background utilities and boost their specificity
    const bgMatches = allStyles.match(/\.bg-[a-zA-Z0-9-]+\s*{[^}]+}/g) || []
    bgMatches.forEach((rule) => {
      const className = rule.match(/\.bg-[a-zA-Z0-9-]+/)?.[0]
      if (className) {
        boostCSS += `
          .MuiButton-root${className},
          .MuiBox-root${className},
          .MuiTypography-root${className},
          [class*="Mui"]${className} {
            ${rule.replace(/\.bg-[a-zA-Z0-9-]+\s*{/, '').replace('}', '')}
            background-image: none !important;
          }
        `
      }
    })

    // Extract text utilities and boost their specificity
    const textMatches = allStyles.match(/\.text-[a-zA-Z0-9-]+\s*{[^}]+}/g) || []
    textMatches.forEach((rule) => {
      const className = rule.match(/\.text-[a-zA-Z0-9-]+/)?.[0]
      if (className) {
        boostCSS += `
          .MuiButton-root${className},
          .MuiBox-root${className},
          .MuiTypography-root${className},
          [class*="Mui"]${className} {
            ${rule.replace(/\.text-[a-zA-Z0-9-]+\s*{/, '').replace('}', '')}
          }
        `
      }
    })

    // Extract other common utilities (padding, margin, flex, etc.)
    const otherUtilities = [
      /\.p-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.m-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.px-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.py-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.mx-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.my-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.flex\s*{[^}]+}/g,
      /\.font-[a-zA-Z0-9-]+\s*{[^}]+}/g,
      /\.rounded[a-zA-Z0-9-]*\s*{[^}]+}/g
    ]

    otherUtilities.forEach((regex) => {
      const matches = allStyles.match(regex) || []
      matches.forEach((rule) => {
        const className = rule.match(/\.[a-zA-Z0-9-]+/)?.[0]
        if (className) {
          boostCSS += `
            .MuiButton-root${className},
            .MuiBox-root${className},
            .MuiTypography-root${className},
            [class*="Mui"]${className} {
              ${rule.replace(/\.[a-zA-Z0-9-]+\s*{/, '').replace('}', '')}
            }
          `
        }
      })
    })

    tailwindBoostStyle.textContent = boostCSS
    document.head.appendChild(tailwindBoostStyle)

    // Create the Emotion cache that will work with the iframe document
    const iframeCache = createCache({
      key: 'iframe',
      container: document.head,
      prepend: false, // Don't prepend, let it append after existing styles
      stylisPlugins: document.dir === 'rtl' ? [prefixer, rtlPlugin] : []
    })

    return iframeCache
  }, [document])

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
  }, [document])

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

const StyledFrame = styled('iframe')(() => ({
  border: 0
}))

interface FrameProps
  extends Omit<ComponentProps<typeof StyledFrame>, 'children'> {
  children: ((props: { document: Document }) => ReactNode) | ReactNode
}

export const FramePortal = memo(
  forwardRef<HTMLIFrameElement, FrameProps>(function FramePortal(
    { children, dir, ...rest },
    ref
  ): ReactElement {
    const frameRef = useRef<HTMLIFrameElement>(null)
    useImperativeHandle(ref, () => frameRef.current as HTMLIFrameElement, [])
    // If we portal content into the iframe before the load event then that
    // content is dropped in firefox.
    const [iframeLoaded, dispatch] = useReducer(() => true, false)
    const document = frameRef.current?.contentDocument
    if (document != null) {
      document.dir = dir ?? ''
    }

    useEffect(() => {
      // When we hydrate the iframe then the load event is already dispatched
      // once the iframe markup is parsed (maybe later but the important part is
      // that it happens before React can attach event listeners).
      // We need to check the readyState of the document once the iframe is
      // mounted and "replay" the missed load event.
      // See https://github.com/facebook/react/pull/13862 for ongoing effort in
      // React (though not with iframes in mind).
      if (
        frameRef?.current?.contentDocument != null &&
        frameRef.current.contentDocument.readyState === 'complete' &&
        !iframeLoaded
      ) {
        dispatch()
      }
    }, [iframeLoaded])

    return (
      <>
        <StyledFrame onLoad={dispatch} ref={frameRef} {...rest} />
        {iframeLoaded &&
          document != null &&
          createPortal(
            <Content document={document}>
              {isFunction(children) ? children({ document }) : children}
            </Content>,
            document.body
          )}
      </>
    )
  })
)
