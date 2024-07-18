import camelCase from 'lodash/camelCase'
import startCase from 'lodash/startCase'

import { setBeaconPageViewed } from '.'

describe('setBeaconPageViewed', () => {
  beforeEach(() => {
    window.Beacon = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should call window.Beacon with page-viewed event', () => {
    const route = 'testRoute'
    const expectedUrl = document.location.href
    const expectedTitle = `Clicked on ${route}`

    setBeaconPageViewed(route)

    expect(window.Beacon).toHaveBeenCalledWith('event', {
      type: 'page-viewed',
      url: expectedUrl,
      title: expectedTitle
    })
  })

  it('should set up window.Beacon on open event with search query', () => {
    const route = 'testRoute'
    const query = startCase(camelCase(route))

    setBeaconPageViewed(route)

    // Simulate the 'on' event callback
    const onOpenCallback = (window.Beacon as jest.Mock).mock.calls.find(
      (call) => call[0] === 'on' && call[1] === 'open'
    )?.[2]
    if (onOpenCallback != null) {
      onOpenCallback()
    }

    expect(window.Beacon).toHaveBeenCalledWith('search', query)
  })

  it('should not call window.Beacon if it is not defined', () => {
    window.Beacon = undefined
    const route = 'testRoute'

    setBeaconPageViewed(route)

    expect(window.Beacon).toBeUndefined()
  })
})
