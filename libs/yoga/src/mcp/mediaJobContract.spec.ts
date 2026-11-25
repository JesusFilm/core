import { mediaStartInput } from './mediaJobContract'

describe('explicit requested-generation contract', () => {
  const request = {
    journeyId: 'draft',
    idempotencyKey: 'original-key',
    kind: 'image_generation',
    prompt: 'A quiet garden'
  }

  it('keeps the exact prompt for replay and requires no separate user permission or model intent flag', () => {
    expect(mediaStartInput.parse(request)).toEqual(request)
    expect(
      mediaStartInput.parse({ ...request, prompt: ' A quiet garden ' })
    ).toMatchObject({ prompt: ' A quiet garden ' })
    expect(
      mediaStartInput.safeParse({ ...request, accepted: true }).success
    ).toBe(false)
    expect(mediaStartInput.safeParse({ ...request, file: {} }).success).toBe(
      false
    )
  })

  it.each(['', '   ', 'x'.repeat(2049)])(
    'rejects invalid prompt bounds',
    (prompt) => {
      expect(mediaStartInput.safeParse({ ...request, prompt }).success).toBe(
        false
      )
    }
  )

  it('does not reinterpret ordinary edits, source selection or unaccepted suggestions as generation', () => {
    for (const input of [
      { ...request, kind: 'text_edit' },
      { ...request, kind: 'select_existing' },
      { ...request, kind: 'suggest_generation' },
      { journeyId: 'draft', idempotencyKey: 'key', prompt: 'A quiet garden' }
    ])
      expect(mediaStartInput.safeParse(input).success).toBe(false)
  })
})
