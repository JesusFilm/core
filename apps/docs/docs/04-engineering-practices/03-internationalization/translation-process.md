import CrowdinTranslations from './crowdin-translations.png'
import LanguageTranslated from './language-translated.png'

# Translation Process

## Crowdin

After your files have been committed and your pull request (PR) has been merged into production, our [Crowdin GitHub integration](https://support.crowdin.com/github-integration/) will initiate. This process involves uploading any changes to the `locales/en` directory.

### DeepL

We have incorporated [DeepL](https://www.deepl.com/en/translator), an AI-powered machine translation engine, into our workflow. When Crowdin receives new texts for translation, DeepL automatically translates them. Upon detecting these new translations, Crowdin will automatically synchronize with GitHub and generate a new PR containing the translated texts. This procedure typically requires a minimum of 5 to 10 minutes.

<img src={CrowdinTranslations} height="650" width="900"/>

Developers are required to assign themselves to the PR created by Crowdin if it is relevant to their work. Additionally, developers should update the PR labels and seek a review from another team member as part of their responsibilities. Once the PR has been approved and reviewed successfully, developers are responsible for merging the changes into the production branch promptly.

Translations from DeepL may not accurately capture the intended context. DeepL is unable to discern context until a local user provides clarification. For now translations from DeepL will undergo verification by the users of our app. It's worth noting that DeepL does not support our entire list of translations, leading to instances where some translations returned may be in English.

## Adding New Languages

When introducing a new language to our system, it's important to follow a step-by-step process for a smooth integration and reliable multilingual support.

### Managing Translations With Crowdin

In our localization process, we collaborate with a translations manager from Jesus Film that oversees Crowdin. Their pivotal role is to ensure that all files are translated into our desired languages. Once the translations manager confirms the full translation of a language, the next step is to add support for that language within a project.

<img src={LanguageTranslated} height="50" width="900"/>

### 1. Update next i18n Configuration

Modify the `next-i18next.config.js` file of the desired project. Add the new locale by including the two-letter language code of the desired language (e.g., `ar` for Arabic) in the `locales` array.

If you're targeting a specific variant, such as Chinese Simplified (e.g., `zh-Hans-CN`), include both the full locale or `code-script-region` of the variant and the two-letter language code. This dual inclusion ensures a fallback language for users. Consider the specific use case for which you are adding it.

Update the fallback language array to support the added locales. Crowdin provides the language locale in the format of `code-region`. This format supports specific language variants. Note that if a locale already has a folder under the global `libs/locales`, there is no need to add a fallback language for it.

```jsx
import path from 'path'

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'es', // Spanish
      'ar', // Arabic
      'zh', // Two-letter version for Chinese (Simplified)
      // Add the new locale here with two-letter language code and specific variants when needed
      'zh-Hans-CN' // Chinese (Simplified) with a specific variant
    ],
    fallbackLng: {
      default: ['en'],
      ar: ['ar-SA'],
      es: ['es-ES'],
      // Ensure that specific variants are also included in fallbackLng
      zh: ['zh-Hans-CN'] // Mapping the two-letter code to the right folder
    },
    localePath: path.resolve('./libs/locales')
  }
}

export default i18nConfig
```

### 2. Update Supported Locales in Middleware

Ensure the middleware file is updated if your project includes one, reflecting the recent changes.

```jsx
const supportedLocales = [
  'en', // English
  'es', // Spanish
  'ar', // Arabic
  'zh', // Include the two-letter version for Chinese (Simplified)
  'zh-Hans-CN' // Include the new locale with variant here
]
```

By following these steps, you ensure clarity in adding both the two-letter language code and specific variants directly in the `locales` array. Additionally, when adding a specific variant, always define its two-letter version for consistency and proper fallback handling. This allows for seamless integration of new translations while maintaining a standardized approach.
