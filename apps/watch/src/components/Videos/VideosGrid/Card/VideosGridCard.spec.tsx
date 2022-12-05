import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { render } from '@testing-library/react'
import { videos } from '../../testData'
import { VideosGridCard } from '.'

describe('VideosGridCard', () => {
  describe('card', () => {
    it('should display video', async () => {
      const { getByText } = render(
        <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
          <VideosGridCard
            video={videos[0]}
            routePrefix="jesus"
            routeSuffix="english"
          />
        </ThemeProvider>
      )
      expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
    })
    it('should link to video url', async () => {
      const { getByRole } = render(
        <VideosGridCard
          video={videos[0]}
          routePrefix="jesus"
          routeSuffix="english"
        />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/jesus/${videos[0].variant?.slug as string}`
      )
    })
  })
})
