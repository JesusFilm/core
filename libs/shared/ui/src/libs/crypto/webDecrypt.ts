export async function webDecrypt(
  encrypt: [key: string, iv: string, encrypted: string]
): Promise<string> {
  const [key, iv, encrypted] = encrypt
  // console.log('key', key)
  // console.log('iv', iv)
  // console.log('encrypted', encrypted)
  const alg = { name: 'AES-CBC', iv: Buffer.from(iv, 'hex') }
  const decryptKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(key, 'utf8'),
    alg,
    false,
    ['decrypt']
  )
  const decipher = await crypto.subtle.decrypt(
    alg,
    decryptKey,
    Buffer.from(encrypted, 'hex')
  )

  return new TextDecoder().decode(decipher)
}
