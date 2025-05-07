import { ReactElement } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { Header } from '../../Header'
import { SimpleVideoHero } from '../SimpleVideoHero'

/**
 * VideoHero component for displaying featured video content.
 *
 * Renders a full-viewport video player with overlay controls and handles
 * fullscreen functionality. Integrates with the Header component to adjust
 * visibility based on player state.
 *
 * @param {VideoHeroProps} props - Component props.
 * @returns {ReactElement} Rendered VideoHero component.
 */
export function VideoHero(): ReactElement {
  return (
    <>
      <Header hideBottomAppBar hideSpacer themeMode={ThemeMode.dark} />
      <SimpleVideoHero />
    </>
  )
}
