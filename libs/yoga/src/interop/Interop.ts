export function validateIpV4(s?: string | null): boolean {
  if (s == null) return true // localhost

  const match = s.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g)
  const ip = match?.[0] ?? ''
  const validIps = process.env.NAT_ADDRESSES?.split(',') ?? []
  return validIps.includes(ip)
}

export function isValidInterop({
  interopToken,
  ipAddress
}: {
  interopToken?: string | null
  ipAddress?: string | null
}): boolean {
  if (interopToken == null) return false
  const validIp = validateIpV4(ipAddress)
  return interopToken === process.env.INTEROP_TOKEN && validIp
}

export interface InteropContext {
  interopToken: string
  ipAddress: string
}
