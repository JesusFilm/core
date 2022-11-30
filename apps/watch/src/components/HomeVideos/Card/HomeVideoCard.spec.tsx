import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { render } from '@testing-library/react'
import { videos } from '../videosData'
import { data } from '../testData'
import { HomeVideoCard } from '.'

describe('HomeVideoCard', () => {
  describe('card', () => {
    it('should display video', async () => {
      const { getByText } = render(
        <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
          <HomeVideoCard video={data[0]} designation={videos[0].designation} />
        </ThemeProvider>
      )
      expect(getByText(data[0].title[0].value)).toBeInTheDocument()
      expect(getByText(videos[0].designation)).toBeInTheDocument()
    })
    it('should link to video url', async () => {
      const { getByRole } = render(
        <HomeVideoCard video={data[0]} designation={videos[0].designation} />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/${data[0].slug[0].value}`
      )
    })
  })
})
