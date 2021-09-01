// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withTM = require('next-transpile-modules')(['@vime/core', '@vime/react'])

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  async redirects () {
    return [
      {
        source: '/',
        destination: '/example-1',
        permanent: false
      }
    ]
  }
}

module.exports = withTM(withNx(nextConfig))
