# Internationalization

We make use of [react-i18next](https://react.i18next.com/), a powerful internationalization framework for React / React Native which is based on [i18next](http://i18next.com/). In certain projects we also use:

- [next-i18next](https://github.com/isaachinman/next-i18next)
- [i18next-parser](https://github.com/i18next/i18next-parser)

In order to understand how this repository implements i18n, it is important to understand how these libraries work. The remainder of this document assumes a working knowledge of these libraries.

## Adding i18n to your project

1. add i18next-parser.config.js to project root.

```JS
const i18nextParserConfigBase = require('../../i18next-parser.config.base') // this file is located in the workspace root

module.exports = {
  ...i18nextParserConfigBase,
  input: ['src/**/*.{js,jsx,ts,tsx}']
}
```

2. add extract-translations command to targets object and implicitDependencies to base object in project.json. You must replace PROJECT_PATH with your project path e.g. `apps/journeys`.

```JSON
{
  ...
  "implicitDependencies": ["locales"],
  "targets": {
    "extract-translations": {
      "executor": "@nx/workspace:run-commands",
      "options": {
        "commands": [
          {
            "command": "npx i18next --config PROJECT_PATH/i18next-parser.config.js"
          }
        ]
      }
    }
    ...

  }
}
```

3. update your components to make use of useTranslation hooks, appWithTranslation HOCs, Trans components etc in order to indicate to the parser that there is a string available for translation.

**It is very important that you include a namespace**. This namespace should be a dashed version of your project path. For example `apps/journeys` would become `apps-journeys` or `libs/journeys/ui` would become `libs-journeys-ui`.

```JSX
import { useTranslation } from 'next-i18next'

function Component() {
  const { t } = useTranslation('libs-journeys-ui') // must include namespace
  return <div>{t('hello world')}</div>
}
```

4. run nx command `extract-translations` for the project you are working on. This should pull all of the strings requiring translations into a namespaced file for example `locales/en/libs-journeys-ui.json` ready for translation. This needs to be committed and kept up to date. This is tested in CI so will fail if not correctly updated.

## Next.js configuration

1. update input in i18next-parser.config.js located in the project root

```JS
const i18nextParserConfigBase = require('../../i18next-parser.config.base')

module.exports = {
  ...i18nextParserConfigBase,
  input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}']
}
```

2. add next-i18next.config.js to the project root

```JS
const path = require('path')

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localePath: path.resolve('./libs/locales')
  }
}

module.exports = i18nConfig
```

3. update next.config.js

```JS
const { i18n } = require('./next-i18next.config')

const nextConfig = {
  i18n,
  ...
}
```

4. update pages/\_app.tsx to use appWithTranslation HOC

```JS
import { appWithTranslation } from 'next-i18next'
import i18nConfig from '../next-i18next.config'

// your _app component
function CustomApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithTranslation(JourneysApp, i18nConfig)
```

5. add async function on your page-level components, via either [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) or [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) (depending on your use case)

```JS
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import i18nConfig from '../next-i18next.config' // project root

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'], // namespaces your components make use of
        i18nConfig
      ))
    },
  };
}
```

6. (Optional) Add a middleware to detect user's preferred language by creating a `middleware.ts` file in the project root. This middleware will:

- Detect and manage user language preferences using browser settings and cookies
- Handle redirects for language-specific routes
- Use cookie fingerprinting to version language preferences

Basic implementation example:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LOCALE = 'en'
const SUPPORTED_LOCALES = ['en', 'es', 'fr'] // Add your supported locales
// Fingerprint is used to version cookies and may be referenced by other components
// (e.g., LanguageSwitcher)
const COOKIE_FINGERPRINT = '00001' // Increment when updating cookie logic

export function middleware(req: NextRequest): NextResponse | undefined {
  // Skip internal paths and static files
  if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.includes('/api/') || /\.(.*)$/.test(req.nextUrl.pathname)) {
    return
  }

  // Get stored language preference with fingerprint
  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value
  const [fingerprint, storedLocale] = localeCookie?.split('---') ?? []

  // If no valid fingerprinted cookie exists, get browser preference
  const preferredLanguage = (fingerprint === COOKIE_FINGERPRINT ? storedLocale : null) ?? req.headers.get('accept-language')?.split(',')[0] ?? DEFAULT_LOCALE

  // Redirect to appropriate language path if needed
  if (preferredLanguage !== req.nextUrl.locale) {
    const response = NextResponse.redirect(new URL(`/${preferredLanguage}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url))
    response.cookies.set('NEXT_LOCALE', `${COOKIE_FINGERPRINT}---${preferredLanguage}`)
    return response
  }

  return NextResponse.next()
}
```

> **Important Notes:**
>
> - Update `SUPPORTED_LOCALES` with your project's supported languages
> - Increment the `COOKIE_FINGERPRINT` when updating cookie logic to invalidate old preferences
>   - Note that this fingerprint may be referenced in other components like `LanguageSwitcher`
>   - For more information, read about Cookie Versioning
> - Adjust the locale detection logic based on your needs
> - Consider adding language fallbacks for regional variants (e.g., 'en-US' → 'en')
