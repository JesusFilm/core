import {
  canonicalFingerprint,
  commandRegistry,
  editInput,
  historyActionInput,
  historyInput,
  operationInput,
  operationReceipt,
  typographyCommand
} from './editContract'

const command = commandRegistry.typography_set.fixtures.accepted
const input = {
  journeyId: 'journey',
  expectedRevision: '12',
  idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
  commands: [command]
}
const state = {
  content: 'An old heading',
  variant: 'h2',
  align: 'left',
  settings: { color: '#ffffff', unsupported: { retained: 'legacy-value' } }
}

describe('closed executable typography registry', () => {
  it('requires closed revision-bound history actions and rejects client inverses', () => {
    const action = {
      journeyId: input.journeyId,
      entryId: input.idempotencyKey,
      expectedRevision: '12',
      idempotencyKey: input.idempotencyKey
    }
    expect(historyActionInput.parse(action)).toEqual(action)
    expect(historyInput.parse({ journeyId: input.journeyId })).toEqual({
      journeyId: input.journeyId
    })
    for (const value of [
      { ...action, inverse: {} },
      { ...action, hostId: 'excluded' },
      { ...action, expectedRevision: '-1' },
      { ...action, entryId: 'unknown' },
      { ...action, idempotencyKey: 'short' }
    ])
      expect(historyActionInput.safeParse(value).success).toBe(false)
  })

  it('accepts each mounted presentation control and plain empty text', () => {
    expect(editInput.parse(input)).toEqual(input)
    for (const variant of [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body1',
      'body2',
      'caption'
    ])
      expect(typographyCommand.parse({ ...command, variant }).variant).toBe(
        variant
      )
    for (const align of ['left', 'center', 'right'])
      expect(typographyCommand.parse({ ...command, align }).align).toBe(align)
    expect(
      typographyCommand.parse({
        type: 'typography_set',
        blockId: 'heading',
        content: ''
      })
    ).toMatchObject({ content: '' })
  })

  it.each([
    { ...commandRegistry.typography_set.fixtures.rejected },
    { ...command, settings: { color: '#123456' } },
    { ...command, subtype: 'legacy' },
    { ...command, content: { type: 'rich-text' } },
    { ...command, variant: 'subtitle1' },
    { ...command, align: 'justify' },
    { ...command, color: 'primary' },
    { ...command, color: '#fff' },
    { ...command, type: 'host_set' },
    { type: 'typography_set', blockId: 'heading' }
  ])('rejects unsupported and hidden fields', (value) => {
    expect(typographyCommand.safeParse(value).success).toBe(false)
  })

  it('records only changed fields and preserves unknown settings', () => {
    const applied = commandRegistry.typography_set.apply(state, command)
    expect(applied.patch).toEqual({
      content: 'A new heading',
      variant: 'h1',
      align: 'center',
      settings: { ...state.settings, color: '#123456' }
    })
    expect(applied.changedFields).toEqual([
      'content',
      'variant',
      'align',
      'settings.color'
    ])
    expect(applied.inverse).toEqual({
      type: 'typography_restore',
      blockId: 'heading',
      fields: [
        {
          field: 'content',
          before: 'An old heading',
          after: 'A new heading',
          beforePresent: true
        },
        { field: 'variant', before: 'h2', after: 'h1', beforePresent: true },
        {
          field: 'align',
          before: 'left',
          after: 'center',
          beforePresent: true
        },
        {
          field: 'settings.color',
          before: '#ffffff',
          after: '#123456',
          beforePresent: true
        }
      ]
    })
    expect(state.settings.color).toBe('#ffffff')
    expect(
      commandRegistry.typography_set.apply(state, {
        type: 'typography_set',
        blockId: 'heading',
        content: state.content
      })
    ).toEqual({
      patch: {},
      inverse: { type: 'typography_restore', blockId: 'heading', fields: [] },
      changedFields: []
    })
  })

  it('captures absence for inverse color restoration and preserves null', () => {
    const absent = commandRegistry.typography_set.apply(
      { ...state, settings: { retained: true } },
      { type: 'typography_set', blockId: 'heading', color: '#123456' }
    )
    expect(absent.inverse.fields).toEqual([
      {
        field: 'settings.color',
        before: null,
        after: '#123456',
        beforePresent: false
      }
    ])
    const present = commandRegistry.typography_set.apply(
      { ...state, settings: { color: null } },
      { type: 'typography_set', blockId: 'heading', color: '#123456' }
    )
    expect(present.inverse.fields[0].beforePresent).toBe(true)
    expect(() =>
      commandRegistry.typography_set.apply(
        { ...state, settings: ['preserve-legacy-settings'] },
        command
      )
    ).toThrow('VALIDATION_FAILED')
    expect(
      commandRegistry.typography_set.apply(
        { ...state, settings: ['preserve-legacy-settings'] },
        { type: 'typography_set', blockId: 'heading', content: 'safe' }
      ).patch
    ).toEqual({ content: 'safe' })
  })

  it('enforces batch bounds, revision range and lookup exclusivity', () => {
    expect(editInput.safeParse({ ...input, commands: [] }).success).toBe(false)
    expect(
      editInput.safeParse({ ...input, commands: Array(51).fill(command) })
        .success
    ).toBe(false)
    expect(
      editInput.safeParse({
        ...input,
        expectedRevision: '18446744073709551616'
      }).success
    ).toBe(false)
    expect(
      editInput.safeParse({ ...input, idempotencyKey: 'short' }).success
    ).toBe(false)
    expect(editInput.safeParse({ ...input, hostId: 'excluded' }).success).toBe(
      false
    )
    expect(operationInput.safeParse({ journeyId: 'journey' }).success).toBe(
      false
    )
    expect(
      operationInput.safeParse({
        journeyId: 'journey',
        idempotencyKey: input.idempotencyKey,
        operationId: input.idempotencyKey
      }).success
    ).toBe(false)
    expect(
      operationInput.parse({
        journeyId: 'journey',
        idempotencyKey: input.idempotencyKey
      })
    ).toEqual({ journeyId: 'journey', idempotencyKey: input.idempotencyKey })
  })

  it('binds canonical payload identity while preserving ordered commands', () => {
    const reordered = {
      commands: [
        {
          color: command.color,
          content: command.content,
          align: command.align,
          blockId: command.blockId,
          type: command.type,
          variant: command.variant
        }
      ],
      idempotencyKey: input.idempotencyKey,
      expectedRevision: '12',
      journeyId: 'journey'
    }
    expect(canonicalFingerprint(input)).toBe(canonicalFingerprint(reordered))
    expect(canonicalFingerprint(input)).not.toBe(
      canonicalFingerprint({ ...input, expectedRevision: '13' })
    )
    const second = {
      type: 'typography_set',
      blockId: 'second',
      content: 'text'
    }
    expect(canonicalFingerprint([command, second])).not.toBe(
      canonicalFingerprint([second, command])
    )
  })

  it('requires a historical receipt and excludes unregistered result fields', () => {
    const receipt = {
      contractVersion: '1',
      operationId: input.idempotencyKey,
      journeyId: 'journey',
      committedRevision: '13',
      kind: 'historical_receipt',
      adminLink: 'https://admin.example/journeys/journey',
      status: 'committed',
      completedAt: '2026-11-17T00:00:00.000Z',
      historyId: null,
      changedFields: [],
      idMap: {},
      effectIds: [],
      warnings: []
    }
    expect(operationReceipt.parse(receipt)).toEqual(receipt)
    expect(
      operationReceipt.safeParse({ ...receipt, adminLink: undefined }).success
    ).toBe(false)
    expect(
      operationReceipt.safeParse({ ...receipt, adminLink: 'not-a-url' }).success
    ).toBe(false)
    expect(
      operationReceipt.safeParse({ ...receipt, status: 'pending' }).success
    ).toBe(false)
    expect(
      operationReceipt.safeParse({ ...receipt, kind: 'current_journey' })
        .success
    ).toBe(false)
    expect(
      operationReceipt.safeParse({ ...receipt, host: 'private' }).success
    ).toBe(false)
  })
})
