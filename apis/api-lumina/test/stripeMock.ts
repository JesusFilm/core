import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import Stripe from 'stripe'

import { stripe } from '../src/lib/stripe'

jest.mock('../src/lib/stripe', () => ({
  __esModule: true,
  stripe: mockDeep<Stripe>()
}))

beforeEach(() => {
  mockReset(stripeMock)
})

export const stripeMock = stripe as DeepMockProxy<Stripe>
