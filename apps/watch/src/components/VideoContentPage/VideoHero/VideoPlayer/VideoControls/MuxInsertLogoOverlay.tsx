import Image from 'next/image'
import { useEffect, useState } from 'react'

import muxConfig from 'apps/watch/config/video-inserts.mux.json'

interface MuxInsertLogoOverlayProps {
  variantId?: string
}

/**
 * Check if the current video variant belongs to a mux insert
 */
function isMuxInsertVariant(variantId: string): boolean {
  // Mux insert variants have IDs like "welcome-start-variant"
  if (!variantId.endsWith('-variant')) return false

  const baseId = variantId.slice(0, -8) // Remove "-variant" suffix
  return muxConfig.inserts.some((insert) => insert.id === baseId)
}

export function MuxInsertLogoOverlay({
  variantId
}: MuxInsertLogoOverlayProps): JSX.Element | null {
  const [logoVisible, setLogoVisible] = useState(false)
  const [signVisible, setSignVisible] = useState(false)
  const [signMoved, setSignMoved] = useState(false)
  const [signFillAnimated, setSignFillAnimated] = useState(false)
  const [signZoomed, setSignZoomed] = useState(false)

  const isMuxInsert = variantId != null && isMuxInsertVariant(variantId)

  // Check if this specific insert has logo overlay enabled
  const currentInsert =
    variantId != null
      ? muxConfig.inserts.find((insert) => {
          const baseId = variantId.slice(0, -8) // Remove "-variant" suffix
          return insert.id === baseId
        })
      : null

  const hasLogoOverlay = currentInsert?.logo === true

  // Show logo overlay after 5 seconds for mux inserts
  useEffect(() => {
    if (isMuxInsert) {
      const timer = setTimeout(() => {
        setLogoVisible(true)
      }, 3300)

      return () => clearTimeout(timer)
    } else {
      setLogoVisible(false)
    }
  }, [isMuxInsert, hasLogoOverlay])

  // Show sign overlay after 2 seconds, move it after 3 seconds, and fade it out after 4.5 seconds for mux inserts
  useEffect(() => {
    if (isMuxInsert) {
      const showTimer = setTimeout(() => {
        setSignVisible(true)
      }, 2000)

      const zoomTimer = setTimeout(() => {
        setSignZoomed(true)
      }, 2000)

      const fillTimer = setTimeout(() => {
        setSignFillAnimated(true)
      }, 2500)

      const moveTimer = setTimeout(() => {
        setSignMoved(true)
      }, 3000)

      const fadeTimer = setTimeout(() => {
        setSignVisible(false)
      }, 3200)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(zoomTimer)
        clearTimeout(fillTimer)
        clearTimeout(moveTimer)
        clearTimeout(fadeTimer)
      }
    } else {
      setSignVisible(false)
      setSignMoved(false)
      setSignFillAnimated(false)
      setSignZoomed(false)
    }
  }, [isMuxInsert, hasLogoOverlay])

  if (!isMuxInsert || !hasLogoOverlay) {
    return null
  }

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: 'scale(1.25)',
        transformOrigin: 'center'
      }}
    >
      {/* Jesus Film Sign - appears after 2 seconds */}
      <div
        className={`absolute top-1/2 left-1/2 z-10 pointer-events-none transition-all duration-500 ease-in-out ${
          signVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: signMoved
            ? 'translate(calc(-50% - 90px), -50%)'
            : 'translate(-50%, -50%)'
        }}
      >
        <svg
          width="98"
          height="72"
          viewBox="0 0 49 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Jesus Film Sign"
          role="img"
          style={{
            transform: signZoomed ? 'scale(1)' : 'scale(2)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'center'
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M45.854 -0.000301361H2.34C1.048 -0.000301361 0 1.0467 0 2.3397V20.2427C0 21.2917 0.699 22.2137 1.709 22.4957L47.072 35.2077C47.636 35.3657 48.194 34.9417 48.194 34.3567V2.3397C48.194 1.0467 47.147 -0.000301361 45.854 -0.000301361Z"
            fill={signFillAnimated ? '#EF3340' : '#FFFFFF'}
            style={{
              transition: 'fill 0.5s ease-in-out'
            }}
          />
        </svg>
      </div>

      {/* Main Logo - appears after 5 seconds */}
      <div
        className={`relative z-20 pointer-events-none transition-opacity duration-500 ease-in-out ${
          logoVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="/assets/jesus-film-logo-full.svg"
          alt="Jesus Film"
          width={278}
          height={72}
        />
      </div>
    </div>
  )
}
