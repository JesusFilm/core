const apiKeyToDefaultPlatform: Record<string, string> = {
  '5273ff46e10e22.60007709': 'android', // 1H1D - Android
  '5273f83b15a101.30934783': 'ios', // 1N1D - iOS
  '533087a8ecebb9.52739407': 'web', // 4kworldmap.com
  '619d2269803138.91501701': 'web', // For the JFP Analytics team
  '58a1f7d44c43e8.69380629': 'android',
  '50105582a2e5a6.72068725': 'android', // Android API Key
  '585c561760c793.95483047': 'android',
  '3a21a65d4gf98hZ7': 'ios', // Application
  '5afad777cd17b6.18824161': 'android',
  '5afad740697018.61725255': 'ios',
  '5010acd51bc2d0.62701482': 'ios', // API Key for Arclight Utilities App
  '51a8a8f4cfee06.74733226': 'android', // Bible.is Android PreProd
  '51a8a8dfb80399.81469398': 'android', // Bible.is Android Prod
  '51a8a8c0671a87.03949361': 'ios', // Bible.is iOS PreProd
  '51a8a82970c7d7.66022447': 'ios', // Bible.is iOS Prod
  '580a44b3775b32.45023341': 'android', // C4TK - Oct2016 Hack - Android
  '580a444223f2d1.21974523': 'ios', // C4TK - Oct2016 Hack - iOS
  '580a44da6a4655.22089437': 'web', // C4TK - Oct2016 Hack - Web
  '55088da22fc360.94752181': 'web', // Call2All Web
  '555b6d0b8c7d61.04722343': 'ios', // Temporary api key for Code for the Kingdom Hackathon
  '52d40edd323002.56665774': 'android', // EkkoMobile App - Android
  '52d40eb916e4c2.91869274': 'ios', // EkkoMobile App - iOS
  '52d40e8ea235f0.82292686': 'web', // EkkoMobile App - Web
  '5266a820dfd249.67873545': 'web', // Find A Bible - Web
  '61eb19803e7510.81670351': 'android', // CGNTV - Fondant - android
  '61eb191b11a532.79477282': 'ios', // CGNTV - Fondant - iOS
  '61eec8e6312981.71380057': 'web', // CGNTV - Fondant - web
  '5c7d46ceb5fda0.96038706': 'web', // GCM - iShare Web App - using it for getting language info
  '55b7be1b85dce0.22907646': 'web', // Gloo Demo API Key
  '55f6e09eadeaf1.19492573': 'android', // 5fish Android API Key
  '5ab00c09f3e803.41594169': 'ios', // 5fish iOS API Key
  '5ab00c7dcc01a6.96340936': 'ios', // 5fish Web API Key
  '581cdecdc93907.85749425': 'web', // Gospel Media Resource Hub - Kirk Wilson (OM)
  '7Zh89fg4d56a12a3': 'ios', // General Heartbeat Process
  '559541cc102509.72089414': 'android', // IBRA - QuickGospel - Android
  '559541aa5ff4f3.94500583': 'ios', // IBRA - QuickGospel - iOS
  '5595415ab60719.94863510': 'web', // IBRA - QuickGospel - Web
  '5f861b850332d2.49955894': 'android',
  '5f86193a462bf7.30652706': 'ios',
  '5f861bbc3ffb32.10442136': 'web',
  '52b06248a3c6e8.12980089': 'web', // Inscript.org
  '58a1f7516337f3.28089549': 'ios',
  '585c557d846f52.04339341': 'ios',
  '50105546a541a8.91252593': 'ios', // For our iOS App
  '52d584b31c3940.93385414': 'web', // Jashow.org
  '59e4efb66176b3.60814718': 'web',
  '5715236f730906.19676983': 'web', // JesusFilm.org new rebranded website
  '50be5df382c257.99659932': 'web', // Using this for JesusFIlm.org web player links - to link to ApiSessionId generated
  '53d82dc379e466.90557886c': 'web', // JFM Engagement Tracker logging
  '53558c95eb5a96.63246274': 'android', // JFM Korean version - Android
  '53558c69144152.94716437': 'ios', // JFM Korean version - iOS
  '506237e1c06338.57472330': 'android', // Kolo Africa App - Android
  '5062376cc98b16.32565309': 'ios', // Kolo Africa App - iOS
  '5273f7412cfff7.74780849': 'android', // Kolo World App - Android
  '547f460a725533.12008072': 'ios', // Kolo World App - iOS
  '54ae91cad5e961.98283289': 'android', // Kolo World China - Android
  '54ae92ec9bb994.70776291': 'ios', // Kolo World China - iOS
  '563926da29d591.95279149': 'android', // Light of Life TV Android App
  '563926b5a88999.14449374': 'ios', // Light of Life TV iOS App
  '5639266f15a5a9.82196609': 'web', // Light of Life TV website
  '5af078c2e3c804.23014783': 'web', // Machine Learning Project R&D api key to help Jessie / Tim
  '5c507921d23a59.46006745': 'web',
  '55e0659429f8c6.36647605': 'web', // moreaboutjesuschrist.org website
  '581cbb52335943.42721754': 'android',
  '5818f0fbc09416.65623622': 'ios', // NewsOnChat iOS App
  '5b9fb031c9d1e4.29922276': 'web', // NextSteps / WTC / GS Web Api Key
  '616db012e9a951.51499299': 'web', // The new NextSteps journey builder
  '59149a66265a92.75068992': 'web',
  '5852cc0bf22446.11680205': 'web',
  '556f57842bc046.17527394': 'android', // PlayTheBible Android
  '556f56f93c4775.54040452': 'ios', // PlayTheBible iOS
  '556f57fe88fc30.10989622': 'web', // PlayTheBible Web
  '5b183f8b7b5f48.42010695': 'android',
  '5b183fb1d94cc0.68657785': 'ios',
  '5b183fcf1353d3.33708334': 'web',
  '560d40f92965e8.24003378': 'android', // Renew Outreach - Lightstream Reporting
  '5cee9795276c76.71690021': 'ios', // Use to connect Arclight API in Renew Pocket WifiBox Admin
  '573cbcce86a9e7.37723123': 'android', // run like a champion - Android
  '573cbd0218cd23.78048868': 'ios', // run like a champion - iOS
  '5c6423895ecc89.69924025': 'web',
  '586ff4f28bd3b1.25434678': 'web',
  '60a2b0bfcd9a05.93574057': 'android', // sil's android app
  '60a2b04c3e1769.93707175': 'ios', // sil - iOS app
  '60a2b0f07903c6.67425151': 'web', // sil's web app
  '5568cca8a01631.66016777': 'web', // SMS Digital Engagement Project
  '61eec7f41c9c31.99666760': 'web', // For OneHundredFold Inc organization
  '535586531e9875.51070243': 'android', // TWR360 - Android
  '52aa01f9ac52e6.29922389': 'web', // TWR360 - Web
  '564b40a1a796e2.92735151': 'android', // Voke - Android
  '564b406b5cc9e2.25458871': 'ios', // Voke - iOS
  '599f11b2cd4b46.20105134': 'android',
  '599f1179676b16.30775854': 'ios',
  '59e4eee579e573.80846090': 'web',
  '501055ccaff633.06007107': 'web', // JFM.org Web Key
  '585c5665957e02.60084565': 'web',
  '607f41540b2ca6.32427244': 'web', // Integrate Arclight content with WESS/Master Studio content
  '5b69f661b81d76.56677683': 'web',
  '5128df08c36a95.57582528': 'android', // YouVersion Prod Key
  '5128dee6887320.02901575': 'ios', // Prod API Key
  '5128df237ac5b6.38477856': 'web', // YouVersion Prod Key
  '63e5248f800a76.60707086': 'ios', // Majority of api calls will be via Google Sheets and Google Apps Script.
  '588bab67215ba1.54540072': 'android',
  '52dd93dfe4b771.97094749': 'android', // Фильм "Иисус" ("Jesus" Film) - Android
  '52dd92e3eb61c7.47205899': 'ios', // Фильм "Иисус" ("Jesus" Film) - iOS
  '52dd93b10bebe3.40936481': 'web' // Фильм "Иисус" ("Jesus" Film) - Web
}

/**
 * Gets the default platform for a given API key.
 * @param apiKey The API key string.
 * @returns The default platform string (e.g., 'ios', 'android', 'web') or undefined if not found.
 */
export function getPlatformForApiKey(apiKey?: string): string | undefined {
  if (!apiKey) {
    return undefined
  }
  return apiKeyToDefaultPlatform[apiKey]
}
