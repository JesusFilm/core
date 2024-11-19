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
  const normalizedIpAddress =
    ipAddressInput === '' ? '127.0.0.1' : (ipAddressInput ?? '127.0.0.1')
  const ipAddress = z
    .string()
    .ip({ message: `Invalid IP address (${normalizedIpAddress})` })
    .parse(normalizedIpAddress)

  if (
    interopToken == null ||
    interopToken !== process.env.INTEROP_TOKEN ||
    !validateIpV4(ipAddress)
  )
    return null

  return { interopToken, ipAddress }
}

export interface InteropContext {
  interopToken: string
  ipAddress: string
}
