import { reducer } from './PageWrapperProvider'

describe('PageContext', () => {
  describe('reducer', () => {
    describe('SetMobileDrawerOpenAction', () => {
      it('should set mobileDrawerOpen', () => {
        const state = {
          mobileDrawerOpen: false
        }
        expect(
          reducer(state, {
            type: 'SetMobileDrawerOpenAction',
            mobileDrawerOpen: true
          })
        ).toEqual({
          ...state,
          mobileDrawerOpen: true
        })
      })
    })
  })
})
