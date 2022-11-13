import { JourneyWithEvents } from '../transformVisitorEvents'
import { reducer } from './VisitorInfoProvider'

describe('VisitorInfoContext', () => {
  describe('reducer', () => {
    describe('SetJourneyAction', () => {
      const journey: JourneyWithEvents = {
        events: [],
        id: 'journeyId',
        subtitle: 'Hobbitish',
        title: 'Lord of the Rings',
        createdAt: '2022-11-02T03:20:26.368Z'
      }
      const state = {
        journey: undefined,
        open: false
      }

      it('should set journey', () => {
        expect(
          reducer(state, {
            type: 'SetJourneyAction',
            journey
          })
        ).toEqual({
          ...state,
          journey,
          open: true
        })
      })

      it('should set journey with open set to false', () => {
        expect(
          reducer(state, {
            type: 'SetJourneyAction',
            journey,
            open: false
          })
        ).toEqual({
          ...state,
          journey,
          open: false
        })
      })
    })

    describe('SetOpenAction', () => {
      it('should set open', () => {
        const state = {
          open: false
        }
        expect(
          reducer(state, {
            type: 'SetOpenAction',
            open: true
          })
        ).toEqual({
          ...state,
          open: true
        })
      })
    })
  })
})
