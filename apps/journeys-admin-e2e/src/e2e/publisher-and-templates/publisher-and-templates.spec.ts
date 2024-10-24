/* eslint-disable playwright/no-skipped-test */
/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { CardLevelActionPage } from '../../pages/card-level-actions'
import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Publisher } from '../../pages/publisher-and-templates-page'
import { TemplatePage } from '../../pages/template-page'

test.describe('Publisher page functionality', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login() // login as admin user
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
  })

  // Skip flaky test
  // Discover page -> Create a new journey with one card -> Three dots on top right -> Create Template
  test.skip('Create a template via newly created journey', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
  })

  // Discover page -> Create a new journey with one card -> Three dots on top right -> Create Template
  test.fixme('Create a template via existing journey', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.selectExistingJourney() // clicking existing journey in the journey list of discover page
    await journeyPage.setExistingJourneyNameToJourneyName() // setting the journey name
    await journeyPage.createAndVerifyTemplate() // Making the selecetd journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
  })

  // Skip flaky test
  test.skip('Verify the user able to move the single template from Active, archived, Trash page', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    // Verify the user able to navigate to template admin page through Publisher link
    await publisherPage.navigateToPublisherPage()
    // Verify the user able to move the single template from Active to archived page
    await publisherPage.verifyTemplateMovedToArchivedTab()
    // Verify the user able to move the single template from Archived to Trash page
    await publisherPage.verifyTemplateMovedToTrashTab()
    // Verify the user able to restore the template from Trash to active page
    await publisherPage.verifyTemplateRestoredToActiveTab()
    // Verify the user able to move the template from Active to Trash page
    await publisherPage.verifyTemplateMovedToTrashTab()
    // Verify the user able to delete the single file permanently in templates admin page
    await publisherPage.verifyTemplateDetetedForever()
    await publisherPage.clickActiveTab()
    await publisherPage.verifyTemplateMovedToArchivedTab()
    // Verify the user able to unarchive the template from Archived to active page
    await publisherPage.verifyTemplateMovedUnarchivedToActiveTab()
  })

  test.skip('Verify the user able to move the all template from Active, archived, Trash page', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    await publisherPage.navigateToPublisherPage()
    // Verify the user able to move the all journeys from Active to archived page
    await publisherPage.verifyAllTemplateMovedActiveToArchivedTab()
    // Verify the user able to unarchive the all journeys from Archived to active page
    await publisherPage.verifyAllTemplateMovedUnarchieToActiveTab()
    await publisherPage.getTemplateListOfActiveTab()
    // Verify the user able to move the all journeys from Active to Trash page
    await publisherPage.verifyAllJourneysMovedToTrash()
    await publisherPage.getTemplateListOfTrashTab()
    // Verify the user able to restore the all journeys from Trash to active page
    await publisherPage.verifyAllTemplateRestoredToActiveTab()
    await publisherPage.verifyAllTemplateMovedActiveToArchivedTab()
    await publisherPage.getTemplateListOfArchivedTab()
    // Verify the user able to move the all journeys from Archived to Trash page
    await publisherPage.verifyAllJourneysMovedToTrash()
    // Verify the user able to delete the all file permanently in templates admin page
    await publisherPage.verifyAlltemplateDeletedForeverFromTrashTab()
  })

  // Verify the user able to display the publisher help window
  test.fixme(
    'Verify the user able to display the publisher help window',
    async ({ page }) => {
      const publisherPage = new Publisher(page)
      const journeyLevelActions = new JourneyLevelActions(page)
      await publisherPage.navigateToPublisherPage() // navigating to the publisher page
      await journeyLevelActions.clickHelpBtn() // clicking on help button at top of the right corner
      await journeyLevelActions.verifyHelpWindowOpened() // verifying the help window is showing in the publisher page
    }
  )

  // Skip flaky test
  test.skip('Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Metadata', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    await publisherPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherPage.getExistingTemplateName() // getting name of existing template
    await publisherPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage(
      'Template Settings'
    ) // clicking Template Settings option from the three dot options
    await publisherPage.verifyTheTitileBelowMetaDataTab() // In Template setting popup, verifying the title field value is matched with corresponding template title
    await publisherPage.verifyDescriptionBelowMetaDataTab() // In Template setting popup, verifying the Description field value is matched with corresponding template Description
    await publisherPage.verifyLanguageOfTemplateBelowMetaDataTab() // In Template setting popup, verifying the Language field value is matched with corresponding template Language
    await publisherPage.clickSaveBtn() // clicking on the save btn
    await publisherPage.verifyTemplateSettingSaveToastMessage() // verifying 'Template settings have been saved' toast message
  })

  // Skip flaky test
  // Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories
  test.skip('Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    const journeyPage = new JourneyPage(page)
    const templatesPage = new TemplatePage(page)
    await publisherPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherPage.getExistingTemplateName() // getting name of existing template
    await publisherPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage(
      'Template Settings'
    ) // clicking Template Settings option from the three dot options
    await publisherPage.clickTabInTemplateSettingPopup('Categories') // clicking on the Categories tab in the Template setting popup
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Topics'
    ) // added filter on the Topics filter field for the template
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Felt Needs'
    ) // added filter on the 'Felt Needs' filter field for the template
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Holidays'
    ) // added filter on the Holidays filter field for the template
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Audience'
    ) // added filter on the Audience filter field for the template
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Genre'
    ) // added filter on the Genre filter field for the template
    await publisherPage.setFilterBelowCategoriesTabInTemplateSettingPopup(
      'Collections'
    ) // added filter on the Collections filter field for the template
    await publisherPage.clickSaveBtn() // clicking on save button
    await publisherPage.verifyTemplateSettingSaveToastMessage() // verifying 'Template settings have been saved' toast message
    await journeyPage.backIcon() // clicking on the back Icon
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Topics') // Verifying that the template with the added Topic filter is fetched by filtering the Topics.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Felt Needs') // Verifying that the template with the added 'Felt Needs' filter is fetched by filtering the 'Felt Needs'.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Holidays') // Verifying that the template with the added Holidays filter is fetched by filtering the Holidays.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Collections') // Verifying that the template with the added Collections filter is fetched by filtering the Collections.
    await publisherPage.verifyCreatedTemplatInEnteredFilter('Genre') // Verifying that the template with the added Genre filter is fetched by filtering the Genre.
    await publisherPage.verifyCreatedTemplatInEnteredFilter('Audience') // Verifying that the template with the added Audience filter is fetched by filtering the Audience.
  })

  // TODO: fix failing test
  // Publisher-> Select existing template -> Three dots on top right -> Template Settings -> About
  test.fixme(
    'Publisher-> Select existing template -> Three dots on top right -> Template Settings -> About',
    async ({ page }) => {
      const publisherPage = new Publisher(page)
      const cardLevelActionPage = new CardLevelActionPage(page)
      await publisherPage.navigateToPublisherPage() // navigating to the publisher page
      await publisherPage.getExistingTemplateName() // getting name of existing template
      await publisherPage.clickOnTemplateInPublisherPage() // clicking on existing template
      await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
      await publisherPage.clickTheDotOptionsInEditTemplatePage(
        'Template Settings'
      ) // clicking Template Settings option from the three dot options
      await publisherPage.clickTabInTemplateSettingPopup('About') // clicking on the About tab in the Template setting popup
      await publisherPage.enterCreatorDescription() // entering value on the description field
      await publisherPage.getImgScrUnderAboutTab() // gettimg the image field scr value
      await publisherPage.clickImageUploadPlusIcon() // clicking on the image uplaod plus icon
      await cardLevelActionPage.clickImageSelectionTab('Custom') // clicking on the Custom tab in the image popup
      await cardLevelActionPage.uploadImageInCustomTab() // uploading an image in the Custom tab
      await publisherPage.verifyImageUploaded() // verifying image got uploaded in the 'Template Settings' popup
      await publisherPage.clickSaveBtn() // clicking on the save button
      await publisherPage.verifyTemplateSettingSaveToastMessage() // verifying 'Template settings have been saved' toast message
    }
  )

  // Skip flaky test
  // Publisher-> Select existing template -> Three dots on top right -> Language
  test.skip('Publisher-> Select existing template -> Three dots on top right -> Language', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    const journeyLevelActions = new JourneyLevelActions(page)
    await publisherPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherPage.getExistingTemplateName() // getting name of existing template
    await publisherPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage('Language') // clicking Language option from the three dot options
    await journeyLevelActions.enterLanguage('Aklanon') // selecting language in the edit language popup
    await publisherPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage('Language') // clicking Language option from the three dot options
    await journeyLevelActions.verifySelectedLanguageInLanguagePopup() // verify selecetd language is upadetd in the edit language popup
    await journeyLevelActions.enterLanguage('Balangao') //  clicking on save button in the 'edit language' popup
    await publisherPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
  })
})

test.describe('Verify template page functionality', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login() // login as admin user
  })

  // Skip flaky test
  // Templates-> Select existing template -> Use This Template
  test.skip('create a new journey via use this template button', async ({
    page
  }) => {
    const templatesPage = new TemplatePage(page)
    const journeyPage = new JourneyPage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.clickUseThisTemplateButton() // clilcking on 'use this template' button
    await templatesPage.selectTeamInAddJourneyToTeamPopup() // selecting team in the 'add journey to team' popup
    await templatesPage.clickAddBtnInPopup() // clicking add button in the 'add journey to team' popup
    await templatesPage.verifySelectedTemplateInCustomJourneyPage() // verifying the page is navigated to the custom journey page for selected template
    await journeyPage.clickOnJourneyCard() // clicking on the card
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Text') // clicking on text button in add block drawer
    await journeyPage.verifyJourneyCreatedViaTemplate() // creating the journey of selected template and verifying the created journey is updated in the journey list
  })

  // Templates-> Select existing template -> Preview
  test.fixme(
    'preview a template from the journey template page',
    async ({ page, context }) => {
      const templatesPage = new TemplatePage(page)
      await templatesPage.setBrowserContext(context) // setting browser context
      await templatesPage.navigateToTempalatePage() // navigating to templates page
      await templatesPage.selectExistingTemplate() // clicking on existing template
      await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
      await templatesPage.verifyPreviewTemplateInJourneyTemplate() //  clicking on the preview button beside the 'use this template' button and verifying the template is loaded on the preview tab
    }
  )

  // TODO: Skipping for now as template publishing taking about 5-7 mins to take effect
  // Templates-> Select existing template -> Edit
  test.skip('Edit a template', async ({ page, context }) => {
    const templatesPage = new TemplatePage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await cardLevelActionPage.getJourneyName() // getting journey name
    await templatesPage.setBrowserContext(context) // setting browser context
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template in template page
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.clickEditInJourneyTemplatePage() // clicking on the edit button beside the 'preview' button
    await templatesPage.verifySelectedTemplateInCustomJourneyPage() // verifying the page is navigated to the custom journey page of selected template
    await cardLevelActionPage.clickOnJourneyCard() // clicking on the card
    await cardLevelActionPage.editTextInJourneysTypographyField() // editing the typography content in the card
    await journeyPage.backIcon() // clicking back icon
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template in template page
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.verifyTemplateIsEdited(journeyName) // verifying the template is edited
  })

  // Templates-> Help button on top right
  test.skip('verify Help window displays via button on top right of the page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await journeyLevelActions.clickHelpBtn() // clicking on help button at top of the right corner
    await journeyLevelActions.verifyHelpWindowOpened() // verifying the help window is showing in the publisher page
  })

  // Filter: Topics, holidays, felt needs, collections
  test.fixme(
    'Filter: Topics, holidays, felt needs, collections',
    async ({ page }) => {
      const templatesPage = new TemplatePage(page)
      await templatesPage.navigateToTempalatePage() // navigating to templates page
      await templatesPage.verifyFilterOfTopicsAndHolidaysAndFeltNeedsAndCollections(
        'Topics'
      ) // Verifying that Topics templates are fetched by filtering the Topics.
      await templatesPage.verifyFilterOfTopicsAndHolidaysAndFeltNeedsAndCollections(
        'Holidays'
      ) // Verifying that holiday templates are fetched by filtering the holidays.
      await templatesPage.verifyFilterOfTopicsAndHolidaysAndFeltNeedsAndCollections(
        'Felt Needs'
      ) // Verifying that 'Felt Needs' templates are fetched by filtering the 'Felt Needs'.
      await templatesPage.verifyFilterOfTopicsAndHolidaysAndFeltNeedsAndCollections(
        'Collections'
      ) // Verifying that Collections templates are fetched by filtering the Collections.
    }
  )

  // Filter: Audience
  test.fixme('Filter: Audience', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.clickDropDownOpenIconForFilters('Audience') // clicking on the dropdown open icon
    await templatesPage.selectCheckBoxForFilters() // selecting the checkbox of the Audience filters
    await templatesPage.clickDropDownCloseIconForFilters('Audience') // clicking on the dropdown close icon
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Audience templates are fetched by filtering the Audience.
    await templatesPage.filterClearIcon() // clicking on X icon in the filter field
  })

  // Filter: Genre
  test.fixme('Filter: Genre', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.clickDropDownOpenIconForFilters('Genre') // clicking on the dropdown open icon
    await templatesPage.selectCheckBoxForFilters() // selecting the checkbox of the Genre filters
    await templatesPage.clickDropDownCloseIconForFilters('Genre') // licking on the dropdown close icon
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Genre templates are fetched by filtering the Genre.
    await templatesPage.filterClearIcon() // clicking on X icon in the filter field
  })

  // Filter: Acceptance, Depression
  test.fixme('Filter: Acceptance, Depression', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.selectSlideFilters('Acceptance') // clicking on Acceptance slide filter
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Acceptance templates are fetched by clicking the Acceptance slide filter.
    await templatesPage.selectSlideFilters('Depression') // clicking on Depression slide filter
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Depression templates are fetched by clicking the Depression slide filter.
  })

  // Filter: Jesus Film, NUA
  test.fixme('Filter: Jesus Film, NUA', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTempalatePage() // navigating to templates page
    await templatesPage.selectFilterBtnBelowSlideFilters('Jesus Film') // clicking on 'Jesus Film' filter button
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that 'Jesus Film' templates are fetched by clicking the 'Jesus Film' filter button.
    await templatesPage.selectFilterBtnBelowSlideFilters('NUA') // clicking on 'NUA' filter button
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that 'NUA' templates are fetched by clicking the 'Jesus Film' filter button.
  })
})
