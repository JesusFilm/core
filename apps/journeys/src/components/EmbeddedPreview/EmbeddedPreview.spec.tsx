import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../__generated__/GetJourney'
import { basic } from '../../libs/testData/storyData'
import { EmbeddedPreview } from './EmbeddedPreview'

describe('EmbeddedPreview', () => {
  it('renders first block', () => {
    const { getByText } = render(
      <MockedProvider>
        <EmbeddedPreview blocks={basic} />
      </MockedProvider>
    )
    expect(
      getByText((basic[0].children[0].children[0] as TypographyBlock).content)
    ).toBeInTheDocument()
  })
})
