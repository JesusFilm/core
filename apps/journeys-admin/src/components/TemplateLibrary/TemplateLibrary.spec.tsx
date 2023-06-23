import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
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
    query: GET_ADMIN_JOURNEYS,
    variables: {
      template: true
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
