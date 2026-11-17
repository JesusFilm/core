import { editInput } from './editContract'
import {
  blockAddCommand,
  deriveSubmitRole,
  presentationCommand,
  presentationPatch
} from './presentationContract'

describe('mounted content commands', () => {
  it.each([
    {
      type: 'button_set',
      blockId: 'button',
      label: 'Read\nmore',
      variant: 'outlined',
      color: 'secondary',
      size: 'large',
      alignment: 'right'
    },
    {
      type: 'button_icon_set',
      blockId: 'button',
      slot: 'end',
      name: null,
      color: 'inherit'
    },
    { type: 'spacer_set', blockId: 'spacer', spacing: 400 },
    {
      type: 'card_set',
      blockId: 'card',
      fullscreen: true,
      backgroundColor: '#12345680',
      backdropBlur: 25,
      themeMode: null
    },
    { type: 'card_chat_set', blockId: 'card', enabled: true, collapse: true }
  ])('accepts mounted values for $type', (command) => {
    expect(presentationCommand.parse(command)).toEqual(command)
  })

  it.each([
    { type: 'button_set', blockId: 'button', submitEnabled: true },
    { type: 'button_set', blockId: 'button', settings: { color: '#112233' } },
    { type: 'button_set', blockId: 'button', color: '#112233' },
    { type: 'button_set', blockId: 'button', label: '<b>HTML</b>' },
    {
      type: 'button_icon_set',
      blockId: 'button',
      slot: 'start',
      iconId: 'foreign',
      name: 'Home4'
    },
    {
      type: 'button_icon_set',
      blockId: 'button',
      slot: 'start',
      size: 'large'
    },
    {
      type: 'button_icon_set',
      blockId: 'button',
      slot: 'start',
      color: 'disabled'
    },
    { type: 'button_icon_set', blockId: 'button', slot: 'start', color: null },
    { type: 'spacer_set', blockId: 'spacer', spacing: 25 },
    { type: 'spacer_set', blockId: 'spacer', spacing: 410 },
    { type: 'card_set', blockId: 'card', backdropBlur: 26 },
    { type: 'card_set', blockId: 'card', opacity: 0.5 },
    { type: 'card_set', blockId: 'card', coverBlockId: 'foreign' },
    { type: 'card_set', blockId: 'card', themeName: 'custom' },
    { type: 'card_chat_set', blockId: 'card', enabled: null, collapse: true },
    { type: 'button_set', blockId: 'button' }
  ])('rejects API-only, arbitrary, excluded and invalid input', (command) => {
    expect(presentationCommand.safeParse(command).success).toBe(false)
  })

  it('records only changed fields, preserves legacy settings and maps chat and theme gestures', () => {
    expect(
      presentationPatch(
        {
          label: 'Keep',
          settings: { alignment: 'left', color: '#123456', legacy: true }
        },
        {
          type: 'button_set',
          blockId: 'button',
          label: 'Keep',
          alignment: 'center'
        }
      )
    ).toEqual({
      patch: {
        settings: { alignment: 'center', color: '#123456', legacy: true }
      },
      fields: [
        {
          field: 'settings.alignment',
          before: 'left',
          after: 'center',
          beforePresent: true
        }
      ]
    })
    expect(
      presentationPatch(
        { showAssistant: null, expandChatByDefault: null },
        {
          type: 'card_chat_set',
          blockId: 'card',
          enabled: false,
          collapse: false
        }
      ).patch
    ).toEqual({ showAssistant: false, expandChatByDefault: true })
    expect(
      presentationPatch(
        { themeMode: 'dark', themeName: 'base' },
        {
          type: 'card_set',
          blockId: 'card',
          themeMode: null
        }
      ).patch
    ).toEqual({ themeMode: null, themeName: null })
    expect(() =>
      presentationPatch(
        { settings: ['legacy'] },
        {
          type: 'button_set',
          blockId: 'button',
          alignment: 'left'
        }
      )
    ).toThrow('VALIDATION_FAILED')
  })

  it('derives submit semantics for complete creation and each duplication context', () => {
    const form = [{ typename: 'MultiselectBlock' }]
    expect(deriveSubmitRole('create', form)).toBe(true)
    expect(
      deriveSubmitRole('create', [{ typename: 'TextResponseBlock' }])
    ).toBe(true)
    expect(
      deriveSubmitRole('create', [
        ...form,
        { typename: 'ButtonBlock', submitEnabled: true }
      ])
    ).toBe(false)
    expect(deriveSubmitRole('create', [])).toBe(false)
    expect(deriveSubmitRole('duplicate-content', form, true)).toBe(false)
    expect(deriveSubmitRole('duplicate-step', form, true)).toBe(true)
    expect(deriveSubmitRole('duplicate-step', form, false)).toBe(false)
  })

  it('requires complete typed creation and rejects caller-owned child IDs and font URLs', () => {
    const add = {
      type: 'block_add',
      key: 'cta',
      cardId: 'card',
      placement: { position: 'end' },
      block: { kind: 'button', label: 'Next', startIcon: { name: 'Home4' } }
    }
    expect(blockAddCommand.parse(add)).toEqual(add)
    for (const block of [
      { ...add.block, startIconId: 'foreign' },
      { ...add.block, submitEnabled: true },
      { kind: 'signup' },
      {
        kind: 'typography',
        content: 'Heading',
        fontUrl: 'https://example.test/font.woff'
      }
    ])
      expect(blockAddCommand.safeParse({ ...add, block }).success).toBe(false)
    expect(
      editInput.safeParse({
        journeyId: 'journey',
        expectedRevision: '0',
        idempotencyKey: 'a-sufficiently-long-key',
        commands: [
          {
            type: 'typography_set',
            blockId: 'text',
            content: '<script>alert(1)</script>'
          }
        ]
      }).success
    ).toBe(false)
  })
})
