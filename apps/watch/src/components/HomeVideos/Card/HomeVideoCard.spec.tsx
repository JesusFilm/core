import { render, waitFor } from '@testing-library/react'
import { videos } from '../../../../pages'
import { data } from '../testData'
import { HomeVideoCard } from './HomeVideoCard'

describe('HomeVideoCard', () => {
  describe('card', () => {
    it('should display video', async () => {
      const { getByText } = render(
        <HomeVideoCard video={data[0]} designation={videos[0].designation} />
      )
      await waitFor(() => {
        expect(getByText(data[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[0].designation)).toBeInTheDocument()
      })
    })
  })
})
