import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { render } from '@testing-library/react'
import { videos } from '../../../Videos/testData'
import { HomeVideoCard, FilmType } from '.'

describe('HomeVideoCard', () => {
  describe('card', () => {
    it('should display video', async () => {
      const { getByText } = render(
        <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
          <HomeVideoCard video={videos[0]} />
        </ThemeProvider>
      )
      expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
      expect(getByText(FilmType[videos[0].label])).toBeInTheDocument()
    })
    it('should link to video url', async () => {
      const { getByRole } = render(<HomeVideoCard video={videos[0]} />)
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/${videos[0].variant?.slug as string}`
      )
    })
  })
})
