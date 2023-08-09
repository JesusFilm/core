import { decrypt, encrypt } from '.'

describe('decrypt', () => {
  it('returns message from an encrypted string with key and iv', () => {
    expect(
      decrypt([
        '7596a0a4994dd21c7f1da8d022d49811',
        'fc1fe7c74fed822e3eb7a038f30f0d67',
        'f4b811b8ca751d57f57b04393473e87f'
      ])
    ).toBe('hello world')
  })

  it('can safely encrypt and decrypt', () => {
    const tuple = encrypt('hello world')
    expect(decrypt(tuple)).toBe('hello world')
  })
})
