import tracer from './tracer'

describe('tracer', () => {
  it('retuns a datadog tracer', () => {
    expect(Object.keys(tracer)).toEqual([
      '_tracer',
      'appsec',
      'default',
      'tracer'
    ])
  })
})
