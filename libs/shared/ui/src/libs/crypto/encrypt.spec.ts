import { decrypt, encrypt } from '.'

describe('encrypt', () => {
  it('encrypts a message that can then be decrypted', () => {
    const message = 'hello world'
    expect(decrypt(encrypt(message))).toEqual(message)
  })
})
