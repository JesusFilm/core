import { editInput } from './editContract'
import {
  blockAddCommand,
  deriveSubmitRole,
  presentationCommand,
  presentationInverse,
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

describe('stored presentation inverses', () => {
  const inverse = {
    type: 'presentation_restore',
    blockId: 'block',
    parent: { cardId: 'card', stepId: 'step' }
  }

  it.each([
    { after: 0, valid: true },
    { after: 2147483647, valid: true },
    { after: 2147483648, valid: false },
    { after: Number.MAX_SAFE_INTEGER, valid: false },
    { after: -1, valid: false },
    { after: 1.5, valid: false }
  ])('requires storable forward sibling order $after', ({ after, valid }) => {
    expect(
      presentationInverse.safeParse({
        ...inverse,
        typename: 'TypographyBlock',
        fields: [
          { field: 'parentOrder', before: 0, after, beforePresent: true }
        ]
      }).success
    ).toBe(valid)
  })

  it.each([
    { typename: 'SpacerBlock', field: 'spacing', after: 200 },
    { typename: 'CardBlock', field: 'backdropBlur', after: 10 },
    { typename: 'ButtonBlock', field: 'parentOrder', after: 1 }
  ])(
    'requires storable prior integers for $field',
    ({ typename, field, after }) => {
      for (const before of [null, -2147483648, -1, 0, 25, 2147483647]) {
        expect(
          presentationInverse.safeParse({
            ...inverse,
            typename,
            fields: [{ field, before, after, beforePresent: true }]
          }).success,
          `${field}: ${before}`
        ).toBe(true)
      }
      for (const before of [-2147483649, 2147483648, 1.5, '25', true]) {
        expect(
          presentationInverse.safeParse({
            ...inverse,
            typename,
            fields: [{ field, before, after, beforePresent: true }]
          }).success,
          `${field}: ${before}`
        ).toBe(false)
      }
    }
  )

  it.each([
    {
      typename: 'TypographyBlock',
      field: 'content',
      valid: ['', 'Text'],
      invalid: ['<b>markup</b>', 'x'.repeat(262145), null]
    },
    {
      typename: 'TypographyBlock',
      field: 'variant',
      valid: ['h1', 'caption'],
      invalid: ['outlined', 'legacy', null]
    },
    {
      typename: 'TypographyBlock',
      field: 'align',
      valid: ['left', 'right'],
      invalid: ['justify', 'wide', null]
    },
    {
      typename: 'ButtonBlock',
      field: 'label',
      valid: ['', 'Continue'],
      invalid: ['<b>markup</b>', 'x'.repeat(262145), null]
    },
    {
      typename: 'ButtonBlock',
      field: 'variant',
      valid: ['text', 'contained', 'outlined'],
      invalid: ['h1', 'legacy', null]
    },
    {
      typename: 'ButtonBlock',
      field: 'size',
      valid: ['small', 'medium', 'large'],
      invalid: ['huge', null]
    },
    {
      typename: 'ButtonBlock',
      field: 'color',
      valid: ['primary', 'secondary', 'error'],
      invalid: ['inherit', '#123456', null]
    },
    {
      typename: 'ButtonBlock',
      field: 'startIconId',
      valid: ['icon'],
      invalid: ['', 'x'.repeat(201), null]
    },
    {
      typename: 'ButtonBlock',
      field: 'endIconId',
      valid: ['icon'],
      invalid: ['', 'x'.repeat(201), null]
    },
    {
      typename: 'IconBlock',
      field: 'name',
      valid: ['Home4', null],
      invalid: ['UnknownIcon', '']
    },
    {
      typename: 'IconBlock',
      field: 'color',
      valid: ['inherit', 'primary', 'secondary', 'error'],
      invalid: ['disabled', '#123456', null]
    },
    {
      typename: 'SpacerBlock',
      field: 'spacing',
      valid: [20, 200, 400],
      invalid: [19, 25, 410, 20.5, null]
    },
    {
      typename: 'CardBlock',
      field: 'fullscreen',
      valid: [true, false],
      invalid: ['true', 1, null]
    },
    {
      typename: 'CardBlock',
      field: 'backgroundColor',
      valid: ['#123456', '#aBcDeF80', null],
      invalid: ['red', '#fff', '#123456789']
    },
    {
      typename: 'CardBlock',
      field: 'backdropBlur',
      valid: [0, 25, null],
      invalid: [-1, 26, 1.5]
    },
    {
      typename: 'CardBlock',
      field: 'themeMode',
      valid: ['light', 'dark', null],
      invalid: ['custom', 'LIGHT']
    },
    {
      typename: 'CardBlock',
      field: 'themeName',
      valid: ['base', null],
      invalid: ['custom', '']
    },
    {
      typename: 'CardBlock',
      field: 'showAssistant',
      valid: [true, false],
      invalid: ['true', 1, null]
    },
    {
      typename: 'CardBlock',
      field: 'expandChatByDefault',
      valid: [true, false],
      invalid: ['false', 0, null]
    },
    {
      typename: 'ButtonBlock',
      field: 'parentOrder',
      valid: [0, 1],
      invalid: [-1, 1.5, null]
    }
  ])(
    'validates saved forward $field for $typename while preserving typed legacy before values',
    ({ typename, field, valid, invalid }) => {
      for (const after of [...valid, ...invalid]) {
        // Persisted legacy values may be outside the current mounted constraints.
        const before = field === 'name' || field === 'color' ? 'legacy' : after
        expect(
          presentationInverse.safeParse({
            ...inverse,
            typename,
            owner: { blockId: 'button', slot: 'startIconId' },
            gate: 'aiChatEditor',
            fields: [{ field, before, after, beforePresent: true }]
          }).success,
          `${typename}.${field}: ${JSON.stringify(after).slice(0, 80)}`
        ).toBe(valid.some((value) => value === after))
      }
    }
  )

  it.each([
    {
      typename: 'ButtonBlock',
      field: 'settings.alignment',
      valid: ['left', 'center', 'right', 'justify'],
      invalid: [null, true, 42, [], {}, 'wide', 'LEFT']
    },
    {
      typename: 'TypographyBlock',
      field: 'settings.color',
      valid: ['#123456', '#aBcDeF'],
      invalid: [null, true, 42, [], {}, 'red', '#fff', '#12345680']
    }
  ])(
    'validates saved forward $field while retaining legacy before JSON',
    (fixture) => {
      for (const before of [
        null,
        true,
        42,
        ['legacy'],
        { legacy: true },
        'legacy'
      ]) {
        for (const after of [...fixture.valid, ...fixture.invalid]) {
          const stored = {
            ...inverse,
            typename: fixture.typename,
            fields: [
              { field: fixture.field, before, after, beforePresent: true }
            ]
          }
          expect(
            presentationInverse.safeParse(stored).success,
            JSON.stringify(stored.fields)
          ).toBe(typeof after === 'string' && fixture.valid.includes(after))
        }
      }
    }
  )

  it.each([
    { typename: 'TypographyBlock', field: 'label' },
    { typename: 'ButtonBlock', field: 'spacing' },
    { typename: 'IconBlock', field: 'label' },
    { typename: 'SpacerBlock', field: 'fullscreen' },
    { typename: 'CardBlock', field: 'content' },
    { typename: 'UnknownBlock', field: 'label' }
  ])('rejects $field on $typename', ({ typename, field }) => {
    expect(
      presentationInverse.safeParse({
        ...inverse,
        typename,
        owner: { blockId: 'button', slot: 'startIconId' },
        fields: [{ field, before: null, after: null, beforePresent: true }]
      }).success
    ).toBe(false)
  })

  it.each(['name', 'color'])(
    'requires Icon owner metadata to restore %s',
    (field) => {
      const stored = {
        ...inverse,
        typename: 'IconBlock',
        fields: [
          {
            field,
            before: null,
            after: field === 'name' ? null : 'inherit',
            beforePresent: true
          }
        ]
      }
      expect(presentationInverse.safeParse(stored).success).toBe(false)
      for (const slot of ['startIconId', 'endIconId'])
        expect(
          presentationInverse.safeParse({
            ...stored,
            owner: { blockId: 'button', slot }
          }).success
        ).toBe(true)
    }
  )

  it.each(['showAssistant', 'expandChatByDefault'])(
    'requires aiChatEditor gate metadata to restore %s',
    (field) => {
      const stored = {
        ...inverse,
        typename: 'CardBlock',
        fields: [{ field, before: null, after: true, beforePresent: true }]
      }
      expect(presentationInverse.safeParse(stored).success).toBe(false)
      expect(
        presentationInverse.safeParse({ ...stored, gate: 'aiChatEditor' })
          .success
      ).toBe(true)
    }
  )

  it.each(
    [
      { typename: 'TypographyBlock', field: 'content', value: 'Text' },
      { typename: 'ButtonBlock', field: 'label', value: 'Continue' },
      { typename: 'IconBlock', field: 'name', value: 'Home4' },
      { typename: 'SpacerBlock', field: 'spacing', value: 100 },
      { typename: 'CardBlock', field: 'backdropBlur', value: 10 },
      { typename: 'CardBlock', field: 'fullscreen', value: true },
      { typename: 'CardBlock', field: 'showAssistant', value: true },
      { typename: 'CardBlock', field: 'expandChatByDefault', value: false },
      { typename: 'ButtonBlock', field: 'parentOrder', value: 1 }
    ].flatMap((fixture) =>
      ['before', 'after'].map((side) => ({ ...fixture, side }))
    )
  )('validates the $side type for $field on $typename', (fixture) => {
    const stored = {
      ...inverse,
      typename: fixture.typename,
      owner: { blockId: 'button', slot: 'startIconId' },
      gate: 'aiChatEditor',
      fields: [
        {
          field: fixture.field,
          before: fixture.value,
          after: fixture.value,
          beforePresent: true
        }
      ]
    }
    expect(presentationInverse.safeParse(stored).success).toBe(true)
    for (const invalid of [[], {}, 'wrong', 42, true].filter(
      (value) => typeof value !== typeof fixture.value || Array.isArray(value)
    ))
      expect(
        presentationInverse.safeParse({
          ...stored,
          fields: [{ ...stored.fields[0], [fixture.side]: invalid }]
        }).success
      ).toBe(false)
    expect(
      presentationInverse.safeParse({
        ...stored,
        fields: [{ ...stored.fields[0], [fixture.side]: null }]
      }).success
    ).toBe(
      fixture.side === 'before' ||
        ['name', 'backdropBlur'].includes(fixture.field)
    )
  })
})
