export const Worker = jest.fn()
export const Queue = jest.fn().mockImplementation(() => ({
  add: jest.fn()
}))
