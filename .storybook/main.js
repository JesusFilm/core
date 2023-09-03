const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-admin': [
    '../apps/journeys-admin/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/*.stories.mdx',
    '../apps/journeys-admin/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-ui': [
    '../libs/journeys/ui/src/**/**/*.stories.mdx',
    '../libs/journeys/ui/src/**/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'shared-ui': [
    '../libs/shared/ui/src/**/*.stories.mdx',
    '../libs/shared/ui/src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  watch: [
    '../apps/watch/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/watch/src/components/**/*.stories.mdx',
    '../apps/watch/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ]
  // Add new UI projects here and in allStories
}

const stories = [
  ...storiesForProject['journeys'],
  // ...storiesForProject['journeys-admin'],
  ...storiesForProject['journeys-ui'],
  ...storiesForProject['watch'],
  ...storiesForProject['shared-ui'],
  '../apps/journeys-admin/src/components/AccessAvatars/AccessAvatars.stories.tsx',
  '../apps/journeys-admin/src/components/AccessDialog/AddUserSection/EmailInviteForm/EmailInviteForm.stories.tsx',
  '../apps/journeys-admin/src/components/AccessDialog/AccessDialog.stories.tsx',
  '../apps/journeys-admin/src/components/CardPreview/CardPreview.stories.tsx',
  '../apps/journeys-admin/src/components/DynamicPowerBiReport/Report/Report.stories.tsx',
  '../apps/journeys-admin/src/components/DynamicPowerBiReport/Report/Report.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ActionsTable/ActionsTable.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ActionDetails/ActionDetails.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/Canvas/InlineEditWrapper/ButtonEdit/ButtonEdit.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Action/EmailAction/EmailAction.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Action/LinkAction/LinkAction.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Action/NavigateToBlockAction/NavigateToBlockAction.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Action/NavigateToJourneyAction/NavigateToJourneyAction.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Attribute/Attribute.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Button/Color/Color.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Button/Size/Size.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Button/Variant/Variant.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Button/Button.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Card/BackgroundColor/BackgroundColor.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Card/CardLayout/CardLayout.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Card/CardStyling/CardStyling.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Card/Card.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Footer/Chat/ChatOption/ChatOption.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Footer/HostSidePanel/HostSidePanel.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Image/Options/ImageOptions.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Image/Image.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/SignUp/SignUp.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Step/NextCard/NextCard.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Step/Step.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/TextResponse/TextResponseFields/TextResponseFields.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/TextResponse/TextResponse.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Typography/Align/Align.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Typography/Color/Color.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Typography/Variant/Variant.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Typography/Typography.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Video/Options/VideoOptions.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/blocks/Video/Video.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Icon/Icon.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/MoveBlockButtons/MoveBlockButtons.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/ToggleButtonGroup/ToggleButtonGroup.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/ToggleOption/ToggleOption.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Attributes/Attributes.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/BlocksTab/BlocksTab.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Button/Button.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/ColorDisplayIcon/ColorDisplayIcon.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/Fab/Fab.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ControlPanel/ControlPanel.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/Drawer/SocialShareAppearance/SocialShareAppearance.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/Drawer/Drawer.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/EditToolbar/Menu/Menu.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/EditToolbar/EditToolbar.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageBlockEditor/CustomImage/CustomImage.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageBlockEditor/UnsplashGallery/UnsplashGallery.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageBlockHeader/ImageBlockHeader.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageLibrary/ImageLibrary.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/ImageSource/ImageSource.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoBlockEditor/VideoBlockEditor.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoDetails/VideoDetails.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromCloudflare/CloudflareDetails/CloudflareDetails.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromCloudflare/VideoFromCloudflare.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromLocal/VideoFromLocal.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromYouTube/YouTubeDetails/YouTubeDetails.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoFromYouTube/VideoFromYouTube.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoLanguage/VideoLanguage.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoList/VideoListItem/VideoListItem.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoList/VideoList.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoSearch/VideoSearch.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/VideoLibrary/VideoLibrary.stories.tsx',
  '../apps/journeys-admin/src/components/Editor/Editor.stories.tsx',
  '../apps/journeys-admin/src/components/FramePortal/FramePortal.stories.tsx',
  '../apps/journeys-admin/src/components/HorizontalSelect/HorizontalSelect.stories.tsx',
  '../apps/journeys-admin/src/components/ImageThumbnail/ImageThumbnail.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyInvite/JourneyInvite.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/ActiveJourneyList/ActiveJourneyList.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/ArchivedJourneyList/ArchivedJourneyList.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DeleteJourneyDialog/DeleteJourneyDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/RestoreJourneyDialog/RestoreJourneyDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TrashJourneyDialog/TrashJourneyDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/StatusChip/StatusChip.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCard.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneySort/JourneySort.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/TrashedJourneyList/TrashedJourneyList.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyList/JourneyList.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/CardView/CardView.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/DatePreview/DatePreview.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/JourneyLink/EmbedJourneyDialog/EmbedJourneyDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/JourneyLink/SlugDialog/SlugDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/JourneyLink/JourneyLink.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/JourneyViewFab/JourneyViewFab.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Menu/DescriptionDialog/DescriptionDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Menu/LanguageDialog/LanguageDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Menu/TitleDialog/TitleDialog.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Menu/Menu.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Properties/JourneyDetails/Language/Language.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Properties/JourneyDetails/JourneyDetails.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/Properties/Properties.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/SocialImage/SocialImage.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/TitleDescription/TitleDescription.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyView/JourneyView.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/ClearAllButton/ClearAllButton.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/FilterDrawer.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyVisitorsList/VisitorCard/VisitorCard.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyVisitorsList/VisitorToolbar/VisitorToolbar.stories.tsx',
  '../apps/journeys-admin/src/components/JourneyVisitorsList/JourneyVisitorsList.stories.tsx',
  '../apps/journeys-admin/src/components/MediaListItem/MediaListItem.stories.tsx',
  '../apps/journeys-admin/src/components/MenuItem/MenuItem.stories.tsx',
  '../apps/journeys-admin/src/components/MultipleSummaryReport/MultipleSummaryReport.stories.tsx',
  '../apps/journeys-admin/src/components/NewPageWrapper/NavigationDrawer/NavigationListItem/NavigationListItem.stories.tsx',
  '../apps/journeys-admin/src/components/NewPageWrapper/NavigationDrawer/UserMenu/UserMenu.stories.tsx',
  '../apps/journeys-admin/src/components/NewPageWrapper/NavigationDrawer/NavigationDrawer.stories.tsx',
  '../apps/journeys-admin/src/components/NewPageWrapper/PageWrapper.stories.tsx',
  '../apps/journeys-admin/src/components/OnboardingPanelContent/OnboardingPanelContent.stories.tsx',
  '../apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/NavigationListItem/NavigationListItem.stories.tsx',
  '../apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/UserMenu/UserMenu.stories.tsx',
  '../apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/NavigationDrawer.stories.tsx',
  '../apps/journeys-admin/src/components/PageWrapper/PageWrapper.stories.tsx',
  '../apps/journeys-admin/src/components/PublisherInvite/PublisherInvite.stories.tsx',
  '../apps/journeys-admin/src/components/ReportsNavigation/NavigationButton/NavigationButton.stories.tsx',
  '../apps/journeys-admin/src/components/ReportsNavigation/ReportsNavigation.stories.tsx',
  '../apps/journeys-admin/src/components/StatusTabPanel/StatusTabPanel.stories.tsx',
  '../apps/journeys-admin/src/components/Team/CopyToTeamDialog/CopyToTeamDialog.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamAvatars/TeamAvatars.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamManageDialog/TeamManageDialog.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamMenu/TeamMenu.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamOnboarding/TeamOnboarding.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamSelect/TeamSelect.stories.tsx',
  '../apps/journeys-admin/src/components/Team/TeamUpdateDialog/TeamUpdateDialog.stories.tsx',
  '../apps/journeys-admin/src/components/Team/UserTeamInviteForm/UserTeamInviteForm.stories.tsx'
]

module.exports = {
  staticDirs: [
    './static',
    { from: '../apps/watch/public/fonts', to: '/watch/fonts' }
  ],
  stories,
  addons: [
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-apollo-client'
  ],

  features: {
    interactionsDebugger: true
  },

  resolve: {
    fallback: {
      util: require.resolve('util/')
    }
  },

  webpackFinal: async (config) => {
    const tsPaths = new TsconfigPathsPlugin({
      configFile: './tsconfig.base.json'
    })

    config.resolve.plugins
      ? config.resolve.plugins.push(tsPaths)
      : (config.resolve.plugins = [tsPaths])

    // TODO: Remove once Storybook supports Emotion 11.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/styled': require.resolve('@emotion/styled'),
      '@emotion/core': require.resolve('@emotion/react'),
      '@emotion-theming': require.resolve('@emotion/react'),
      '@emotion/react': require.resolve('@emotion/react'),
      '@emotion/cache': require.resolve('@emotion/cache')
    }

    return config
  },

  framework: {
    name: '@storybook/nextjs',
    options: {}
  },

  docs: {
    autodocs: false
  }
}
