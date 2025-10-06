import CrowdinTranslations from './crowdin-translations.png'

# Translations Implementation Guide

This document provides a detailed guide on the process of adding a new language to a project in Core. This assumes that you have knowledge of how to set up internationalization for a project.

## Understanding Locales

### What is a Locale?

A locale is a combination of language and region settings that define a user's language, region, and cultural preferences. It can be thought of as a digital passport that tells the application on how to present information to users from different parts of the world.

For example, users from different regions might expect:

- Different date formats (MM/DD/YYYY vs DD/MM/YYYY)
- Different translations for the same language (UK English vs US English)

### Locale Structure and Standards

A locale identifier follows the (`language-SCRIPT-REGION`) format, using standardized ISO codes:

```
language-SCRIPT-REGION
   |       |      |
   |       |      └─ Country/Region code (ISO 3166-1): US, GB, CN
   |       └─ Script code (ISO 15924): Hans (Simplified), Hant (Traditional)
   └─ Language code (ISO 639-1): en, es, zh
```

**ISO Standards Used:**

- **ISO 639-1**: Two-letter language codes
  - Example: 'en' for English, 'zh' for Chinese
  - Identifies the base language

- **ISO 15924**: Four-letter script codes
  - Example: 'Hans' for Simplified Chinese, 'Arab' for Arabic
  - Identifies how the language is written

- **ISO 3166-1**: Two-letter country/region codes
  - Example: 'US' for United States, 'CN' for China
  - Identifies specific regional variants

> **Note**: While we use the language-script-region format, locale identifiers can be constructed in various ways depending on your needs. For a comprehensive guide on locale codes and standards, see [MDN's guide on locale codes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).

## Translation Workflow

### 1. Crowdin Integration

[Crowdin](https://support.crowdin.com/github-integration/) is our translation management platform that automates the translation process. Here's how it works:

1. **Source Upload**:
   - Developer merges changes containing English text into production
   - Changes in `locales/en` directory trigger Crowdin
   - Crowdin extracts new or modified text for translation

2. **Translation Process**:
   - Crowdin detects new content
   - DeepL automatically generates initial translations
   - Translation team reviews translations (optional)
   - Crowdin automatically creates a GitHub PR with new translations
     - This is configured in our crowdin.yml file
     - For more information see [Crowdin GitHub Integration](https://support.crowdin.com/github-integration/) and [Crowdin Configuration File](https://support.crowdin.com/developer/configuration-file/)

> **Important**: Crowdin will create and push Pull Requests with translations automatically, regardless of whether the translation team has reviewed them. This ensures continuous deployment but means that manual review of translations should be done post-deployment if needed.

### 2. DeepL Machine Translation

[DeepL](https://www.deepl.com) is our AI-powered translation service that provides initial translations.

**Advantages:**

- Quick initial translations (5-10 minutes)
- High-quality machine translation
- Supports many major languages

**Limitations:**

- May miss contextual nuances
- Not all languages supported
- Some translations remain in English
- Requires human verification

## Adding New Languages

### Prerequisites

**Translation Readiness Check**:

- When new translations are ready, Crowdin will automatically create a Pull Request containing the translated files
  <img src={CrowdinTranslations} height="650" width="900"/>
- The PR will contain all new translations that have been completed, either by translators or AI
- If you can't find the translations you need, connect with a translation manager or a developer who has access to Crowdin

### Implementation Steps

#### 1. Update next-i18next Configuration

The `next-i18next.config.js` file handles language support and fallback behavior for translations. Understanding how next-i18next and Crowdin work together is essential for proper configuration:

- **next-i18next** reads from folders that match the language codes defined in your locales list (e.g., locales: [`ar`, `es`])

- **Crowdin** by default we set it to return the folders in the `%locale%` (language-region) format (e.g., `ar-SA`, `es-ES`):
  - This format can be configured differently, but we chose this to support different variants that may come from a language
  - Example: `es-ES` for European Spanish, `es-MX` for Mexican Spanish

To connect these formats, we configure fallbacks to map between them. When the application looks for translations in `ar/`, we set the fallback to check Crowdin's format `ar-SA/`:

```javascript
const i18nConfig = {
  i18n: {
    locales: ['ar'],
    fallbackLng: {
      ar: ['ar-SA'] // Maps 'ar' to look in 'ar-SA' folder
    }
  }
}
```

There are two approaches to handling locales, depending on whether you need to support multiple variants of a language.

### Case 1: Single Variant Languages

For languages that don't require variant support (e.g., French, Spanish), use the simpler `language-REGION` format:

```javascript
const i18nConfig = {
  i18n: {
    locales: [
      'en', // English (required)
      'fr', // French (generic)
      'es' // Spanish (generic)
    ],
    fallbackLng: {
      default: ['en'],
      fr: ['fr-FR'], // French falls back to France French
      es: ['es-ES'] // Spanish falls back to Spain Spanish
    }
  }
}
```

### Case 2: Multiple Variant Languages

For languages that have multiple variants (e.g., Chinese with Simplified and Traditional), use the full `language-SCRIPT-REGION` format:

**Setup Steps:**

1. First, in Crowdin:
   - Go to Language Mapping settings
   - Add custom codes for each variant
   - Example for Chinese:
     ```
     Chinese Simplified → zh-Hans-CN
     Chinese Traditional → zh-Hant-TW
     ```

2. Then, in next-i18next:
   ```javascript
   const i18nConfig = {
     i18n: {
       locales: [
         'en', // English (required)
         'es', // Spanish (generic)
         'fr', // French (generic)
         'zh', // Generic Chinese
         'zh-Hans-CN', // Simplified Chinese
         'zh-Hant-TW' // Traditional Chinese
       ],
       fallbackLng: {
         default: ['en'],
         es: ['es-ES'], // Spanish falls back to Spain Spanish
         fr: ['fr-FR'], // French falls back to France French
         zh: ['zh-Hans-CN'], // Generic Chinese defaults to Simplified
         'zh-Hant-TW': ['zh', 'en'] // Traditional falls back to generic, then English
       }
     }
   }
   ```

> **Important Notes:**
>
> - For single variant languages, use simple language-REGION format
> - For multiple variants, set up custom codes in Crowdin first
> - Always test fallback behavior after configuration
> - Maintain consistency between Crowdin settings and next-i18next config

#### 2. Update Middleware Configuration

If your project uses middleware for routing or locale detection, update the supported locales list:

```javascript
const supportedLocales = [
  'en', // English (required)
  'es', // Spanish (generic)
  'ar', // Arabic (generic)
  'zh', // Chinese (generic)
  'zh-Hans-CN' // Chinese Simplified (specific variant)
]
```
