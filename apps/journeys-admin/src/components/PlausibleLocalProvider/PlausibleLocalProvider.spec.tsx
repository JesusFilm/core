import { PlausibleLocalState, reducer } from './PlausibleLocalProvider'

const SECOND = 1000
const WEEK = 6.048e8

const defaultState: PlausibleLocalState = {
  date: new Date(),
  period: '7d',
  comparison: undefined,
  matchDayOfWeek: true
}

describe('PlausibleLocalContext', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('reducer', () => {
    describe('SetPeriodAction', () => {
      it('should set period without date', () => {
        const state = Object.assign(defaultState, {})

        expect(
          reducer(state, {
            type: 'SetPeriodAction',
            period: 'day'
          })
        ).toEqual({
          ...state,
          period: 'day'
        })
      })

      it('should set period with date', () => {
        const state = Object.assign(defaultState, {})
        const newDate = new Date(state.date.getTime() + SECOND)

        expect(
          reducer(state, {
            type: 'SetPeriodAction',
            period: 'day',
            date: newDate
          })
        ).toEqual({
          ...state,
          period: 'day',
          date: newDate
        })
      })
    })
    describe('SetPeriodRangeAction', () => {
      it('should set from and to on period range', () => {
        const state = Object.assign(defaultState, {})
        const from = new Date()
        const to = new Date(from.getTime() + WEEK)

        expect(
          reducer(state, {
            type: 'SetPeriodRangeAction',
            range: {
              from,
              to
            }
          })
        ).toEqual({
          ...state,
          periodRange: {
            from,
            to
          }
        })
      })
      it('should set from on period range', () => {
        const state = Object.assign(defaultState, {})
        const from = new Date()

        expect(
          reducer(state, {
            type: 'SetPeriodRangeAction',
            range: {
              from
            }
          })
        ).toEqual({
          ...state,
          periodRange: {
            from,
            to: undefined
          }
        })
      })
    })
    describe('SetComparisonAction', () => {
      it('should set comparison', () => {
        const state = Object.assign(defaultState, {})

        expect(
          reducer(state, {
            type: 'SetComparisonAction',
            comparison: 'custom'
          })
        ).toEqual({
          ...state,
          comparison: 'custom'
        })
      })
    })
    describe('SetComparisonRangeAction', () => {
      it('should set from and to on comparison range', () => {
        const state = Object.assign(defaultState, {})
        const from = new Date()
        const to = new Date(from.getTime() + WEEK)

        expect(
          reducer(state, {
            type: 'SetComparisonRangeAction',
            range: {
              from,
              to
            }
          })
        ).toEqual({
          ...state,
          comparisonRange: {
            from,
            to
          }
        })
      })
      it('should set from on comparison range', () => {
        const state = Object.assign(defaultState, {})
        const from = new Date()

        expect(
          reducer(state, {
            type: 'SetComparisonRangeAction',
            range: {
              from
            }
          })
        ).toEqual({
          ...state,
          comparisonRange: {
            from,
            to: undefined
          }
        })
      })
    })
    describe('SetMatchDayOfWeekAction', () => {
      it('should set match day of week', () => {
        const state = Object.assign(defaultState, {})

        expect(
          reducer(state, {
            type: 'SetMatchDayOfWeekAction',
            matchDayOfWeek: false
          })
        ).toEqual({
          ...state,
          matchDayOfWeek: false
        })
      })
    })
  })
})
