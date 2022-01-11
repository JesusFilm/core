import { render, fireEvent, waitFor } from '@testing-library/react'
import { AccessAvatars, AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'
import { useBreakpoints } from '@core/shared/ui'

jest.mock('../../../../../../../libs/shared/ui/src', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

describe('AccessAvatars', () => {
  describe('Desktop', () => {
    beforeAll(() => {
      const useBreakpointsMock = useBreakpoints as jest.Mock
      useBreakpointsMock.mockReturnValue({
        xs: false,
        sm: false,
        md: true,
        lg: false,
        xl: false
      })
    })
    it('should render avatars', () => {
      const props: AccessAvatarsProps = {
        users: [user1]
      }
      render(<AccessAvatars users={props.users} />)
    })

    it('should use first name as image alt', () => {
      const props: AccessAvatarsProps = {
        users: [user1]
      }
      const { getByAltText } = render(<AccessAvatars users={props.users} />)
      expect(getByAltText('Amin')).toBeInTheDocument()
    })

    it('should use first name and last as tooltip', () => {
      const props: AccessAvatarsProps = {
        users: [user1]
      }
      const { getByLabelText } = render(<AccessAvatars users={props.users} />)
      expect(getByLabelText('Amin One')).toBeInTheDocument()
    })

    it('should render overflow avatar with correct details', async () => {
      const props: AccessAvatarsProps = {
        users: [user1, user2, user3, user4, user5, user6]
      }

      const { getByRole, getByText } = render(
        <AccessAvatars users={props.users} />
      )
      expect(getByText('+2')).toBeInTheDocument()
      fireEvent.focus(getByText('+2'))
      await waitFor(() => {
        expect(getByRole('tooltip')).toBeInTheDocument()
        expect(getByText('Janelle Five')).toBeInTheDocument()
        expect(getByText('Drake Six')).toBeInTheDocument()
      })
    })
    it('should display 5 avatars max', () => {
      const props: AccessAvatarsProps = {
        users: [user1, user2, user3, user4, user5]
      }
      const { getAllByRole } = render(<AccessAvatars users={props.users} />)
      expect(getAllByRole('img')).toHaveLength(5)
    })
  })

  describe('Mobile', () => {
    beforeAll(() => {
      const useBreakpointsMock = useBreakpoints as jest.Mock
      useBreakpointsMock.mockReturnValue({
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false
      })
    })
    it('should display 3 avatars max', () => {
      const props: AccessAvatarsProps = {
        users: [user1, user2, user3]
      }
      const { getAllByRole } = render(<AccessAvatars users={props.users} />)
      expect(getAllByRole('img')).toHaveLength(3)
    })
  })
})
