const rootMain = require('../../../../.storybook/main')

module.exports = {
  ...rootMain,

  stories: [
    ...rootMain.stories,
    '../../../../apps/journeys/src/app/*.stories.tsx',
    '../../../../apps/journeys/src/components/**/*.stories.tsx',
    '../../../../apps/myapp/src/app/*.stories.tsx'
  ],
  addons: [...rootMain.addons, '@nrwl/react/plugins/storybook'],
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType })
    }

    // add your own webpack tweaks if needed

    return config
  }
}
