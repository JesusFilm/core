import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import { defaultTemplate } from './TemplateListData'

import { TemplateLibrary } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const activeTemplatesMock = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true
      }
    }
  },
  result: {
    data: {
      journeys: [defaultTemplate]
    }
  }
}

describe('TemplateLibrary', () => {
  it('should render templates', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[activeTemplatesMock]}>
        <TemplateLibrary />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Default Template Heading')).toBeInTheDocument()
    })
  })
})
