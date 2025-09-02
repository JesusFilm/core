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

test.describe.fixme('Publisher page - Single Template', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login('admin') // login as admin user
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
  })

  test('Verify the user able to move the single template from Active, archived, Trash page', async ({
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
})

test.describe.fixme('Publisher page - All Templates', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login('admin2') // login as admin user
    for (
      let templateCreationCount = 0;
      templateCreationCount < 3;
      templateCreationCount++
    ) {
      await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
      await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifying the created journey is updated in the active tab list
      await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
      await journeyPage.navigateToDiscoverPage() // navigating to discover page
    }
  })

  test('Verify the user able to move the all template from Active, archived, Trash page', async ({
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
})

test.describe.fixme('Publisher page', () => {
  test.beforeEach(
    'Create a journey and create a template from the existing journey',
    async ({ page }) => {
      const landingPage = new LandingPage(page)
      const loginPage = new LoginPage(page)
      const journeyPage = new JourneyPage(page)
      await landingPage.goToAdminUrl()
      await loginPage.login('admin3') // login as admin user
      await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
      await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifying the created journey is updated in the active tab list
      await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
      await journeyPage.navigateToDiscoverPage() // navigating to discover page
    }
  )

  // Discover page -> Create a new journey with one card -> Three dots on top right -> Create Template
  test('Create a template via newly created journey', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createANewCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplateFromNewJourney() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
  })

  // Discover page -> Create a new journey with one card -> Three dots on top right -> Create Template
  // This test got covered in BeforeAll hook
  test.skip('Create a template via existing journey', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.selectExistingJourney() // clicking existing journey in the journey list of discover page
    await journeyPage.setExistingJourneyNameToJourneyName() // setting the journey name
    await journeyPage.backIcon()
    await journeyPage.createAndVerifyTemplate() // Making the selecetd journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
  })

  // Verify the user able to display the publisher help window
  test('Verify the user able to display the publisher help window', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    const journeyLevelActions = new JourneyLevelActions(page)
    await publisherPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherPage.clickHelpBtn() // clicking on help button at top of the right corner
    await journeyLevelActions.verifyHelpWindowOpened() // verifying the help window is showing in the publisher page
  })

  //
  test('Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Metadata', async ({
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

  // Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories
  test('Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    const journeyPage = new JourneyPage(page)
    const templatesPage = new TemplatePage(page)
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifying the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
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
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Topics') // Verifying that the template with the added Topic filter is fetched by filtering the Topics.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Felt Needs') // Verifying that the template with the added 'Felt Needs' filter is fetched by filtering the 'Felt Needs'.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Holidays') // Verifying that the template with the added Holidays filter is fetched by filtering the Holidays.
    await publisherPage.verifyCreatedTemplatInEnteredFilterOption('Collections') // Verifying that the template with the added Collections filter is fetched by filtering the Collections.
    await publisherPage.verifyCreatedTemplatInEnteredFilter('Genre') // Verifying that the template with the added Genre filter is fetched by filtering the Genre.
    await publisherPage.verifyCreatedTemplatInEnteredFilter('Audience') // Verifying that the template with the added Audience filter is fetched by filtering the Audience.
  })

  // Publisher-> Select existing template -> Three dots on top right -> Template Settings -> About
  test('Publisher-> Select existing template -> Three dots on top right -> Template Settings -> About', async ({
    page
  }) => {
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
  })

  // Publisher-> Select existing template -> Three dots on top right -> Language
  test('Publisher-> Select existing template -> Three dots on top right -> Language', async ({
    page
  }) => {
    const publisherPage = new Publisher(page)
    const journeyLevelActions = new JourneyLevelActions(page)
    await publisherPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherPage.getExistingTemplateName() // getting name of existing template
    await publisherPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage('Edit Details') // clicking Language option from the three dot options
    await journeyLevelActions.enterLanguage('Abau') // selecting language in the edit language popup
    await publisherPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
    await publisherPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherPage.clickTheDotOptionsInEditTemplatePage('Edit Details') // clicking Language option from the three dot options
    await journeyLevelActions.verifySelectedLanguageInLanguagePopup() // verify selecetd language is upadetd in the edit language popup
    await journeyLevelActions.enterLanguage('English') //  clicking on save button in the 'edit language' popup
    await publisherPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
  })
})

test.describe.fixme('Template page - Journey from Template', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login('admin4') // login as admin user
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
  })

  // Templates-> Select existing template -> Use This Template
  test('create a new journey via use this template button', async ({
    page
  }) => {
    const templatesPage = new TemplatePage(page)
    const journeyPage = new JourneyPage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.clickUseThisTemplateButton() // clilcking on 'use this template' button
    await templatesPage.selectTeamInAddJourneyToTeamPopup() // selecting team in the 'add journey to team' popup
    await templatesPage.clickAddBtnInPopup() // clicking add button in the 'add journey to team' popup
    await templatesPage.verifySelectedTemplateInCustomJourneyPage() // verifying the page is navigated to the custom journey page for selected template
    await journeyPage.clickOnJourneyCard() // clicking on the card
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickTextBtnInAddBlockDrawer() // clicking on text button in add block drawer
    await journeyPage.verifyJourneyCreatedViaTemplate() // creating the journey of selected template and verifying the created journey is updated in the journey list
  })
})

test.describe.fixme('Template page', () => {
  test.beforeEach('Login > Create a journey and template', async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login('admin5') // login as admin user
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifying the created journey is updated in the active tab list
    await journeyPage.createAndVerifyTemplate() // Making the created journey as template by clicking on 'Create Template' option and verifying the journey is updated in the template list of publisher page
    await journeyPage.navigateToDiscoverPage() // navigating to discover page
  })

  // Templates-> Select existing template -> Preview
  test.skip('preview a template from the journey template page', async ({
    page,
    context
  }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.setBrowserContext(context) // setting browser context
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.verifyPreviewTemplateInJourneyTemplate() //  clicking on the preview button beside the 'use this template' button and verifying the template is loaded on the preview tab
  })

  // Templates-> Select existing template -> Edit
  test('Edit a template', async ({ page, context }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + testInfo.timeout)
    const templatesPage = new TemplatePage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await cardLevelActionPage.getJourneyName() // getting journey name
    await templatesPage.setBrowserContext(context) // setting browser context
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template in template page
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page
    await templatesPage.clickEditInJourneyTemplatePage() // clicking on the edit button beside the 'preview' button
    await templatesPage.verifySelectedTemplateInCustomJourneyPage() // verifying the page is navigated to the custom journey page of selected template
    await cardLevelActionPage.clickOnJourneyCard() // clicking on the card
    await cardLevelActionPage.editTextInJourneysTypographyField() // editing the typography content in the card
    await journeyPage.backIcon() // clicking back icon
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectExistingTemplate() // clicking on existing template in template page
    await templatesPage.verifySelectedTemplatePage() // verifying the page is navigated to selected template page

    await test.step('Verify the template is edited', async () => {
      await templatesPage.verifyTemplateIsEdited(journeyName) // verifying the template is edited
    })
  })

  // Templates-> Help button on top right
  test('verify Help window displays via button on top right of the page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.clickHelpBtn() // clicking on help button at top of the right corner
    await journeyLevelActions.verifyHelpWindowOpened() // verifying the help window is showing in the publisher page
  })

  // Filter: Topics, holidays, felt needs, collections
  // Skipped because this filter test is already covered in the 'Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories' test.
  test.skip('Filter: Topics, holidays, felt needs, collections', async ({
    page
  }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTemplatePage() // navigating to templates page
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
  })

  // Filter: Audience
  // Skipped because this filter test is already covered in the 'Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories' test.
  test.skip('Filter: Audience', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.clickDropDownOpenIconForFilters('Audience') // clicking on the dropdown open icon
    await templatesPage.selectCheckBoxForFilters() // selecting the checkbox of the Audience filters
    await templatesPage.clickDropDownCloseIconForFilters('Audience') // clicking on the dropdown close icon
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Audience templates are fetched by filtering the Audience.
    await templatesPage.filterClearIcon() // clicking on X icon in the filter field
  })

  // Filter: Genre
  // Skipped because this filter test is already covered in the 'Publisher-> Select existing template -> Three dots on top right -> Template Settings -> Categories' test.
  test.skip('Filter: Genre', async ({ page }) => {
    const templatesPage = new TemplatePage(page)
    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.clickDropDownOpenIconForFilters('Genre') // clicking on the dropdown open icon
    await templatesPage.selectCheckBoxForFilters() // selecting the checkbox of the Genre filters
    await templatesPage.clickDropDownCloseIconForFilters('Genre') // licking on the dropdown close icon
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Genre templates are fetched by filtering the Genre.
    await templatesPage.filterClearIcon() // clicking on X icon in the filter field
  })

  // Filter: Acceptance, Depression
  test('Filter: Acceptance, Depression', async ({ page }) => {
    const filterOptions = ['Acceptance', 'Depression'] // filter options
    const templatesPage = new TemplatePage(page)
    const publisherAndTemplatesPage = new Publisher(page)
    const journeyPage = new JourneyPage(page)

    await publisherAndTemplatesPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherAndTemplatesPage.getExistingTemplateName() // getting name of existing template
    await publisherAndTemplatesPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherAndTemplatesPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherAndTemplatesPage.clickTheDotOptionsInEditTemplatePage(
      'Template Settings'
    ) // clicking Template Settings option from the three dot options
    await publisherAndTemplatesPage.clickTabInTemplateSettingPopup('Categories') // clicking on the Categories tab in the Template setting popup
    await publisherAndTemplatesPage.setTemplateCategoriesInTemplateSettingPopup(
      'Felt Needs',
      filterOptions
    ) // setting the template categories in the template setting popup
    await publisherAndTemplatesPage.clickSaveBtn() // clicking on the save btn
    await publisherAndTemplatesPage.verifyTemplateSettingSaveToastMessage() // verifying 'Template settings have been saved' toast message
    await journeyPage.backIcon() // clicking on the back Icon

    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectSlideFilters(filterOptions[0]) // clicking on Acceptance slide filter
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Acceptance templates are fetched by clicking the Acceptance slide filter.
    await templatesPage.selectSlideFilters(filterOptions[1]) // clicking on Depression slide filter
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that Depression templates are fetched by clicking the Depression slide filter.
  })

  // Filter: Jesus Film, NUA
  test('Filter: Jesus Film, NUA', async ({ page }) => {
    const filterOptions = ['Jesus Film', 'NUA'] // filter options
    const templatesPage = new TemplatePage(page)
    const publisherAndTemplatesPage = new Publisher(page)
    const journeyPage = new JourneyPage(page)

    await publisherAndTemplatesPage.navigateToPublisherPage() // navigating to the publisher page
    await publisherAndTemplatesPage.getExistingTemplateName() // getting name of existing template
    await publisherAndTemplatesPage.clickOnTemplateInPublisherPage() // clicking on existing template
    await publisherAndTemplatesPage.clickThreeDotInEditTempletePage() // clicking on the three dot at top right corner of the edit template page
    await publisherAndTemplatesPage.clickTheDotOptionsInEditTemplatePage(
      'Template Settings'
    ) // clicking Template Settings option from the three dot options
    await publisherAndTemplatesPage.clickTabInTemplateSettingPopup('Categories') // clicking on the Categories tab in the Template setting popup
    await publisherAndTemplatesPage.setTemplateCategoriesInTemplateSettingPopup(
      'Collections',
      filterOptions
    ) // setting the template categories in the template setting popup
    await publisherAndTemplatesPage.clickSaveBtn() // clicking on the save btn
    await publisherAndTemplatesPage.verifyTemplateSettingSaveToastMessage() // verifying 'Template settings have been saved' toast message
    await journeyPage.backIcon() // clicking on the back Icon

    await templatesPage.navigateToTemplatePage() // navigating to templates page
    await templatesPage.selectFilterBtnBelowSlideFilters(filterOptions[0]) // clicking on 'Jesus Film' filter button
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that 'Jesus Film' templates are fetched by clicking the 'Jesus Film' filter button.
    await templatesPage.selectFilterBtnBelowSlideFilters(filterOptions[1]) // clicking on 'NUA' filter button
    await templatesPage.verifyTheTemplateOfSelectedFilterOption() // Verifying that 'NUA' templates are fetched by clicking the 'Jesus Film' filter button.
  })
})
