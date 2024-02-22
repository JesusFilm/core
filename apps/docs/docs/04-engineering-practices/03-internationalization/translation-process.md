import CrowdinTranslations from './crowdin-translations.png'

# Translation Process

## Crowdin

After your files have been committed and your pull request (PR) has been merged into production, our [Crowdin GitHub integration](https://support.crowdin.com/github-integration/) will initiate. This process involves uploading any changes to the `locales/en` directory.

### DeepL

We have incorporated [DeepL](https://www.deepl.com/en/translator), an AI-powered machine translation engine, into our workflow. When Crowdin receives new texts for translation, DeepL automatically translates them. Upon detecting these new translations, Crowdin will automatically synchronize with GitHub and generate a new PR containing the translated texts. This procedure typically requires a minimum of 5 to 10 minutes.

<img src={CrowdinTranslations} height="650" width="900"/>

Developers are required to assign themselves to the PR created by Crowdin if it is relevant to their work. Additionally, developers should update the PR labels and seek a review from another team member as part of their responsibilities. Once the PR has been approved and reviewed successfully, developers are responsible for merging the changes into the production branch promptly.

Translations from DeepL may not accurately capture the intended context. DeepL is unable to discern context until a local user provides clarification. For now translations from DeepL will undergo verification by the users of our app. It's worth noting that DeepL does not support our entire list of translations, leading to instances where some translations returned may be in English.
