import '@testing-library/jest-dom'
import './test/createMatchMedia'

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => {
    return 'Next image stub'
  }
}))
