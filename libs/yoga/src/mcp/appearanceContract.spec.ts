import { appearanceCommand, normalizeChatLink } from './appearanceContract'
import { editInput } from './editContract'

describe('closed mounted appearance commands', () => {
  it.each([
    { type: 'journey_social_set', seoTitle: 'a'.repeat(50) },
    { type: 'journey_social_set', seoDescription: 'a'.repeat(180) },
    { type: 'journey_fonts_set', headerFont: 'https://example.test/font' },
    { type: 'journey_fonts_set', bodyFont: 'Oswald' },
    { type: 'journey_fonts_set', labelFont: null },
    { type: 'journey_details_set', languageId: '' },
    { type: 'journey_details_set', title: '' },
    { type: 'journey_details_set' },
    { type: 'journey_appearance_set', hostId: null },
    { type: 'journey_appearance_set', showHosts: false },
    { type: 'journey_appearance_set', showLogo: false },
    { type: 'journey_appearance_set', showAssistant: true },
    { type: 'journey_details_set', creatorDescription: 'hidden' },
    { type: 'journey_details_set', title: 'Title', slug: 'public' },
    { type: 'menu_create', key: 'menu', menuStepBlockId: 'foreign' },
    { type: 'chat_button_add', key: 'chat', platform: 'foreign', link: '' },
    { type: 'chat_button_set', chatButtonId: 'chat', customizable: true },
    {
      type: 'chat_button_set',
      chatButtonId: 'chat',
      link: 'javascript:alert(1)'
    },
    { type: 'tracking_set', block: { id: 'card' }, eventLabel: 'arbitrary' }
  ])('rejects unsupported fields and boundary values: %j', (command) => {
    expect(appearanceCommand.safeParse(command).success).toBe(false)
    expect(
      editInput.safeParse({
        journeyId: 'journey',
        expectedRevision: '1',
        idempotencyKey: '0123456789abcdef',
        commands: [command]
      }).success
    ).toBe(false)
  })

  it.each([
    ['example.test/chat', 'https://example.test/chat'],
    [' hello@example.test ', 'mailto:hello@example.test'],
    ['tel:+15555550100', 'tel:+15555550100'],
    ['sms:+15555550100', 'sms:+15555550100'],
    ['', '']
  ])('normalizes mounted chat links %s', (input, expected) => {
    expect(normalizeChatLink(input)).toBe(expected)
  })

  it('accepts bounded empty social text and nullable mounted clears', () => {
    expect(
      appearanceCommand.parse({
        type: 'journey_social_set',
        seoTitle: 'a'.repeat(49),
        seoDescription: 'b'.repeat(179)
      })
    ).toBeDefined()
    expect(
      appearanceCommand.parse({
        type: 'journey_details_set',
        title: 'Title',
        description: null
      })
    ).toBeDefined()
    expect(
      appearanceCommand.parse({
        type: 'journey_appearance_set',
        displayTitle: null,
        menuButtonIcon: null
      })
    ).toBeDefined()
  })
})
