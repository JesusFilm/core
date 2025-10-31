import { z } from 'zod'

function validateIpV4(ipAddress: string): boolean {
  const validIps = process.env.NAT_ADDRESSES?.split(',') ?? []
  return validIps.includes(ipAddress)
}

export function getInteropContext({
  interopToken: interopTokenInput,
  ipAddress: ipAddressInput
}: {
  interopToken: string | null
  ipAddress: string | null
}): InteropContext | null {
  const interopToken = z.string().nullable().parse(interopTokenInput)

  if (interopToken == null || interopToken !== process.env.INTEROP_TOKEN)
    return null

  const normalizedIpAddress = (
    ipAddressInput === '' ? '127.0.0.1' : (ipAddressInput ?? '127.0.0.1')
  ).split(', ')[0]

  const ipResult = z.union([z.ipv4(), z.ipv6()]).safeParse(normalizedIpAddress)

  if (!ipResult.success)
    throw new Error(`Invalid IP address (${normalizedIpAddress})`)

  const ipAddress = ipResult.data

  if (!validateIpV4(ipAddress)) return null

  return { interopToken, ipAddress }
}

export interface InteropContext {
  interopToken: string
  ipAddress: string
}
