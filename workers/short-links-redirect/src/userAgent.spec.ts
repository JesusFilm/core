import { classifyUserAgent } from './userAgent'

describe('classifyUserAgent', () => {
  it.each([
    [
      'iPhone Safari',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      { deviceClass: 'mobile', os: 'iOS', browser: 'Safari' }
    ],
    [
      'iPhone Chrome',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/118.0.0.0 Mobile/15E148 Safari/604.1',
      { deviceClass: 'mobile', os: 'iOS', browser: 'Chrome' }
    ],
    [
      'iPad Safari',
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      { deviceClass: 'tablet', os: 'iOS', browser: 'Safari' }
    ],
    [
      'Android phone Chrome',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
      { deviceClass: 'mobile', os: 'Android', browser: 'Chrome' }
    ],
    [
      'Android tablet Chrome',
      'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      { deviceClass: 'tablet', os: 'Android', browser: 'Chrome' }
    ],
    [
      'Samsung Internet',
      'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
      { deviceClass: 'mobile', os: 'Android', browser: 'Samsung Internet' }
    ],
    [
      'Windows Edge',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46',
      { deviceClass: 'desktop', os: 'Windows', browser: 'Edge' }
    ],
    [
      'Windows Firefox',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
      { deviceClass: 'desktop', os: 'Windows', browser: 'Firefox' }
    ],
    [
      'macOS Safari',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      { deviceClass: 'desktop', os: 'macOS', browser: 'Safari' }
    ],
    [
      'macOS Opera',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 OPR/104.0.0.0',
      { deviceClass: 'desktop', os: 'macOS', browser: 'Opera' }
    ],
    [
      'Linux Chrome',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      { deviceClass: 'desktop', os: 'Linux', browser: 'Chrome' }
    ],
    [
      'ChromeOS',
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      { deviceClass: 'desktop', os: 'ChromeOS', browser: 'Chrome' }
    ],
    [
      'Googlebot',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'facebookexternalhit',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'Slackbot',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'Twitterbot',
      'Twitterbot/1.0',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'WhatsApp',
      'WhatsApp/2.23.20.0 A',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'link preview crawler',
      'Mozilla/5.0 (compatible; LinkPreview/1.0; +https://example.com/crawler)',
      { deviceClass: 'bot', os: 'unknown', browser: 'unknown' }
    ],
    [
      'unknown token soup',
      'curl/8.4.0',
      { deviceClass: 'unknown', os: 'unknown', browser: 'unknown' }
    ],
    ['empty', '', { deviceClass: 'unknown', os: 'unknown', browser: 'unknown' }]
  ])('classifies %s', (_label, userAgent, expected) => {
    expect(classifyUserAgent(userAgent)).toEqual(expected)
  })

  it('treats null as unknown', () => {
    expect(classifyUserAgent(null)).toEqual({
      deviceClass: 'unknown',
      os: 'unknown',
      browser: 'unknown'
    })
  })
})
