import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import { treeBlocksVar } from '@core/journeys/ui/block'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../__generated__/GetJourney'
import { basic } from '../../libs/testData/storyData'

import { EmbeddedPreview } from './EmbeddedPreview'

// jest.mock('swiper/modules', () => ({
//   Navigation: (props) => null,
//   Pagination: (props) => null,
//   Scrollbar: (props) => null,
//   A11y: (props) => null
// }))

// jest.mock('swiper/react', () => ({
//   Swiper: ({ children }) => <div data-testid="swiper-testid">{children}</div>,
//   SwiperSlide: ({ children }) => (
//     <div data-testid="swiper-slide-testid">{children}</div>
//   ),
//   SwiperClass: {}
// }))

// jest.mock('swiper/css', () => jest.fn())
// jest.mock('swiper/css/pagination', () => jest.fn())

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('EmbeddedPreview', () => {
  it('renders first block', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    treeBlocksVar(basic)
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_VIEW_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'step1.id',
                  value: 'Step 1'
                }
              }
            },
            result: {
              data: {
                stepViewEventCreate: {
                  id: 'uuid',
                  __typename: 'StepViewEvent'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <EmbeddedPreview blocks={basic} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        getByText((basic[0].children[0].children[0] as TypographyBlock).content)
      ).toBeInTheDocument()
    })
  })
})
