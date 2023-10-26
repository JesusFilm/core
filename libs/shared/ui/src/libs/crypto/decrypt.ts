export async function decrypt(
  encrypt: [key: string, iv: string, encrypted: string]
): Promise<string> {
  const [key, iv, encrypted] = encrypt
  const pwUtf8 = new TextEncoder().encode(key)
  const ptUtf8 = new TextEncoder().encode(encrypted)
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8)
  const alg = { name: 'AES-GCM', iv }
  const decryptKey = await crypto.subtle.importKey('raw', pwHash, alg, false, [
    'decrypt'
  ])
  const decipher = await crypto.subtle.decrypt(
    'aes-256-cbc',
    decryptKey,
    ptUtf8
  )

  return new TextDecoder().decode(decipher)
}
