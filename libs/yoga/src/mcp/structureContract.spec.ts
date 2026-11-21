import { editInput, operationReceipt } from './editContract'
import {
  actionValue,
  blockReference,
  contentCreate,
  normalizeActionUrl,
  structureCommand,
  structureCommandNames,
  structureCommandRegistry
} from './structureContract'

const input = {
  journeyId: 'journey',
  expectedRevision: '12',
  idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09'
}

describe('closed structure and navigation contract', () => {
  it.each(structureCommandNames)(
    'validates the registered %s operation and rejects hidden writes',
    (type) => {
      const row = structureCommandRegistry[type]
      expect(row.schema.parse(row.fixtures.accepted)).toEqual(
        row.fixtures.accepted
      )
      expect(structureCommand.safeParse(row.fixtures.rejected).success).toBe(
        false
      )
      expect(
        editInput.parse({ ...input, commands: [row.fixtures.accepted] })
          .commands
      ).toEqual([row.fixtures.accepted])
      expect(row).toMatchObject({
        handler: 'structure',
        requiredRole: 'journey:update',
        requiredGrant: 'journeys:edit',
        inverseType: 'structure_restore'
      })
      expect(row.sourceChecks).toContain('ordinary-draft')
      expect(row.preserved).toContain('Host')
    }
  )

  it('accepts a complete Step with stable local descendants and a forward action target', () => {
    const commands = [
      {
        type: 'action_set',
        block: { id: 'existing-answer' },
        action: { kind: 'step', destination: { local: 'new_step' } }
      },
      {
        type: 'step_add',
        key: 'new_step',
        cardKey: 'new_card',
        placement: { position: 'after', anchor: { id: 'existing-step' } },
        x: 120,
        y: -300,
        card: { fullscreen: false, themeMode: 'dark', themeName: 'base' },
        content: [
          {
            key: 'heading',
            content: {
              kind: 'typography',
              content: '',
              variant: 'h1',
              color: '#123456'
            }
          },
          {
            key: 'continue',
            content: { kind: 'button', label: 'Continue', variant: 'contained' }
          },
          { key: 'space', content: { kind: 'spacer', spacing: 20 } },
          { key: 'image', content: { kind: 'image' } },
          { key: 'video', content: { kind: 'video' } }
        ]
      }
    ]
    expect(editInput.parse({ ...input, commands }).commands).toEqual(commands)
  })

  it.each([
    {},
    { id: 'existing', local: 'new' },
    { local: 'MixedCase' },
    { local: 'bad-key' },
    { local: 'x'.repeat(33) },
    { id: 'x'.repeat(201) },
    { id: 'existing', hostId: 'hidden' }
  ])('rejects ambiguous or invalid references', (reference) => {
    expect(blockReference.safeParse(reference).success).toBe(false)
  })

  it.each([
    {
      type: 'step_add',
      key: 'step',
      cardKey: 'card',
      placement: { position: 'end' },
      hostId: 'hidden'
    },
    {
      type: 'step_add',
      key: 'step',
      cardKey: 'card',
      placement: { position: 'end' },
      card: { hostId: 'hidden' }
    },
    {
      type: 'step_add',
      key: 'step',
      cardKey: 'card',
      placement: { position: 'end' },
      content: [
        { key: 'text', content: { kind: 'typography', hostId: 'hidden' } }
      ]
    },
    {
      type: 'block_add',
      key: 'button',
      card: { id: 'card' },
      placement: { position: 'end' },
      content: { kind: 'button', startIconId: 'foreign' }
    },
    {
      type: 'action_set',
      block: { id: 'button' },
      action: {
        kind: 'step',
        destination: { id: 'step' },
        parentStepId: 'foreign'
      }
    },
    {
      type: 'action_set',
      block: { id: 'button' },
      action: { kind: 'link', url: 'https://example.test', customizable: true }
    },
    { type: 'step_position_set', step: { id: 'step' }, x: 1.5, y: 0 },
    { type: 'step_position_set', step: { id: 'step' }, x: Infinity, y: 0 },
    { type: 'social_position_set', x: 2147483648, y: 0 },
    { type: 'graph_auto_arrange', graph: [] },
    { type: 'step_restore', inverse: {} },
    { type: 'host_set', host: 'hidden' }
  ])('rejects unsupported structure and nested ownership input', (command) => {
    expect(structureCommand.safeParse(command).success).toBe(false)
  })

  it.each([
    { kind: 'image', src: 'https://example.test/image.jpg' },
    { kind: 'video', videoId: 'not-authorized' },
    { kind: 'button', submitEnabled: true },
    { kind: 'spacer', spacing: 25 },
    { kind: 'spacer', spacing: 410 },
    { kind: 'poll', options: [] },
    { kind: 'textResponse', routeId: 'foreign' },
    { kind: 'signUp' }
  ])('limits content creation to supported complete variants', (content) => {
    expect(contentCreate.safeParse(content).success).toBe(false)
  })

  it.each([
    { kind: 'none' },
    { kind: 'step', destination: { id: 'target-step' } },
    { kind: 'link', url: 'https://example.test/path' },
    { kind: 'link', url: 'example.test/path' },
    { kind: 'email', email: 'editor@example.test' },
    { kind: 'chat', chatUrl: 'https://wa.me/15555555555' },
    { kind: 'chat', chatUrl: 'viber://' },
    { kind: 'phone', phone: '+1 (555) 555-5555', countryCode: 'US' },
    { kind: 'sms', phone: '+15555555555', countryCode: 'US' }
  ])('accepts supported action values', (action) => {
    expect(actionValue.parse(action)).toEqual(action)
  })

  it.each([
    { kind: 'link', url: 'javascript:alert(1)' },
    { kind: 'link', url: 'data:text/html,script' },
    { kind: 'link', url: 'file:///etc/passwd' },
    { kind: 'link', url: 'mailto:editor@example.test' },
    { kind: 'chat', chatUrl: 'javascript://example.test' },
    { kind: 'chat', chatUrl: 'https://example.test\nother' },
    { kind: 'chat', chatUrl: 'https://user:password@example.test' },
    { kind: 'email', email: 'not-an-email' },
    { kind: 'sms', phone: 'text:inject', countryCode: 'US' },
    { kind: 'phone', phone: '+15555555555', countryCode: 'javascript' },
    { kind: 'step', destination: null },
    { kind: 'none', url: 'https://example.test' }
  ])('rejects unsafe and mixed action variants', (action) => {
    expect(actionValue.safeParse(action).success).toBe(false)
  })

  it('normalizes unqualified navigation without making network requests', () => {
    expect(normalizeActionUrl('example.test/path')).toBe(
      'https://example.test/path'
    )
    expect(normalizeActionUrl('http://example.test/path')).toBe(
      'http://example.test/path'
    )
    expect(normalizeActionUrl('viber://')).toBe('viber://')
    expect(() => normalizeActionUrl('https://example.test path')).toThrow(
      'VALIDATION_FAILED'
    )
  })

  it('accepts two deliberate copies of one source with distinct local keys', () => {
    const commands = ['first_copy', 'second_copy'].map((key) => ({
      type: 'step_duplicate',
      source: { id: 'source-step' },
      key,
      placement: { position: 'end' }
    }))
    expect(editInput.parse({ ...input, commands }).commands).toEqual(commands)
  })

  it('allows content creation alongside Typography edits while rejecting repeated field writes', () => {
    const commands = [
      ...['first', 'second'].map((key) => ({
        type: 'block_add',
        key,
        card: { id: 'card' },
        placement: { position: 'end' },
        content: { kind: 'typography', content: 'New heading' }
      })),
      { type: 'typography_set', blockId: 'heading', content: 'Saved heading' },
      { type: 'typography_set', blockId: 'heading', align: 'center' }
    ]
    expect(editInput.parse({ ...input, commands }).commands).toEqual(commands)
    expect(
      editInput.safeParse({
        ...input,
        commands: [
          ...commands,
          {
            type: 'typography_set',
            blockId: 'heading',
            content: 'Saved heading'
          }
        ]
      }).success
    ).toBe(false)
  })

  it('returns complete duplication mappings and affected routes in a protected historical receipt', () => {
    const receipt = {
      contractVersion: '1',
      operationId: input.idempotencyKey,
      journeyId: input.journeyId,
      committedRevision: '13',
      kind: 'historical_receipt',
      adminLink: 'https://admin.example.test/journeys/journey',
      status: 'committed',
      completedAt: '2026-11-17T00:00:00.000Z',
      historyId: null,
      changedFields: [{ blockId: 'step', fields: ['deletedAt'] }],
      idMap: { new_step: 'allocated-step' },
      duplicateIdMap: {
        'original-owned-child-with-a-long-id': 'allocated-child'
      },
      duplicateMaps: {
        first_copy: [
          {
            sourceId: 'original-owned-child-with-a-long-id',
            blockId: 'allocated-child'
          },
          { sourceId: '__proto__', blockId: 'opaque-source-copy' }
        ],
        second_copy: [
          {
            sourceId: 'original-owned-child-with-a-long-id',
            blockId: 'second-allocated-child'
          }
        ]
      },
      affectedLinks: [
        { sourceBlockId: 'answer', kind: 'action', destinationStepId: 'step' }
      ],
      effectIds: [],
      warnings: []
    }
    expect(operationReceipt.parse(receipt)).toEqual(receipt)
    expect(
      operationReceipt.safeParse({
        ...receipt,
        changedFields: [{ blockId: 'step', fields: ['hostId'] }]
      }).success
    ).toBe(false)
    expect(
      operationReceipt.safeParse({
        ...receipt,
        affectedLinks: [{ ...receipt.affectedLinks[0], privateSource: {} }]
      }).success
    ).toBe(false)
  })

  it('rejects reserved local object keys before a complete gesture can be accepted', () => {
    expect(
      editInput.safeParse({
        ...input,
        commands: [
          {
            type: 'step_add',
            key: '__proto__',
            cardKey: 'card',
            placement: { position: 'end' }
          }
        ]
      }).success
    ).toBe(false)
  })
})
