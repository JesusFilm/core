import { editInput } from './editContract'

const request = (commands: unknown[]) => ({
  journeyId: 'draft',
  expectedRevision: '0',
  idempotencyKey: 'forms-request-00001',
  commands
})

describe('complete form authoring contract', () => {
  it('keeps the mounted 250-character response limit separate from option and legacy submit labels', () => {
    const label = 'a'.repeat(251)
    expect(
      editInput.safeParse(
        request([
          { type: 'poll_option_set', block: { id: 'option' }, label },
          { type: 'signup_set', block: { id: 'signup' }, submitLabel: label }
        ])
      ).success
    ).toBe(true)
    expect(
      editInput.safeParse(
        request([{ type: 'response_set', block: { id: 'response' }, label }])
      ).success
    ).toBe(false)
  })
  it('accepts complete questions, response fields and their named edits', () => {
    const commands = [
      {
        type: 'block_add',
        key: 'poll',
        card: { id: 'card' },
        placement: { position: 'end' },
        content: {
          kind: 'poll',
          options: [
            { key: 'yes', label: 'Yes' },
            { key: 'no', label: 'No' }
          ]
        }
      },
      { type: 'poll_set', block: { local: 'poll' }, gridView: true },
      {
        type: 'response_set',
        block: { id: 'response' },
        responseType: 'email',
        locale: 'es-ES',
        placeholder: null
      },
      {
        type: 'form_destination_set',
        block: { id: 'response' },
        integrationId: 'existing',
        routeId: 'route'
      },
      {
        type: 'action_set',
        block: { local: 'poll.submit' },
        action: { kind: 'step', destination: { id: 'step' } }
      }
    ]
    expect(editInput.parse(request(commands)).commands).toEqual(commands)
  })

  it.each([
    { type: 'response_set', block: { id: 'r' }, minRows: 0 },
    { type: 'response_set', block: { id: 'r' }, label: 'a'.repeat(251) },
    {
      type: 'form_destination_set',
      block: { id: 'r' },
      integrationId: null,
      routeId: 'route'
    },
    { type: 'signup_set', block: { id: 's' }, credentials: 'secret' },
    {
      type: 'block_add',
      key: 's',
      card: { id: 'c' },
      placement: { position: 'end' },
      content: { kind: 'signup' }
    }
  ])('rejects unsupported or invalid form writes', (command) => {
    expect(editInput.safeParse(request([command])).success).toBe(false)
  })
})
