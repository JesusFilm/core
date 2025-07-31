import dayjs from 'dayjs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

async function getCredentials(
  accountKey: string
): Promise<{ email: string; password: string }> {
  const credentialsConfig = {
    admin: {
      email: process.env.PLAYWRIGHT_EMAIL,
      password: process.env.PLAYWRIGHT_PASSWORD
    },
    admin2: {
      email: process.env.PLAYWRIGHT_EMAIL2,
      password: process.env.PLAYWRIGHT_PASSWORD2
    },
    admin3: {
      email: process.env.PLAYWRIGHT_EMAIL3,
      password: process.env.PLAYWRIGHT_PASSWORD3
    },
    admin4: {
      email: process.env.PLAYWRIGHT_EMAIL4,
      password: process.env.PLAYWRIGHT_PASSWORD4
    },
    admin5: {
      email: process.env.PLAYWRIGHT_EMAIL5,
      password: process.env.PLAYWRIGHT_PASSWORD5
    }
  }
  return credentialsConfig[accountKey] || credentialsConfig.admin
}

export async function getEmail(accountKey: string = 'admin'): Promise<string> {
  const email = (await getCredentials(accountKey)).email

  if (!email) {
    throw new Error('Email was not provided via environment variable')
  }
  return email.toString()
}

export async function getPassword(
  accountKey: string = 'admin'
): Promise<string> {
  const password = (await getCredentials(accountKey)).password
  if (!password) {
    throw new Error('Password was not provided via environment variable')
  }
  return password.toString()
}

export async function getUser(): Promise<string> {
  const firstAndLastName = process.env.PLAYWRIGHT_USER?.toString()

  if (firstAndLastName == null || firstAndLastName === '') {
    throw new Error(
      'First and Last name was not provided via environment variable'
    )
  }
  return firstAndLastName
}

export async function getTeamName(): Promise<string> {
  const teamName = process.env.PLAYWRIGHT_TEAM_NAME?.toString()

  if (teamName == null || teamName === '') {
    throw new Error('Team name was not provided via environment variable')
  }
  return teamName
}

export async function getBaseUrl(): Promise<string> {
  const baseUrl = process.env.PR_NUMBER
    ? `https://journeys-admin-${process.env.PR_NUMBER}-jesusfilm.vercel.app/`
    : process.env.DEPLOYMENT_URL?.toString()
  if (baseUrl == null || baseUrl === '') {
    throw new Error('baseUrl was not provided via environment variable')
  }
  return baseUrl
}
export async function getOTP(): Promise<string> {
  const otp = process.env.EXAMPLE_EMAIL_TOKEN?.toString()

  if (otp == null || otp === '') {
    throw new Error('OTP was not provided via environment variable')
  }
  return otp
}
export async function generateRandomString(length: number): Promise<string> {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (let counter = 0; counter < length; counter++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function generateRandomNumber(length: number): string {
  const timestamp = dayjs().format('DDMMYYhhmmss')
  const randomDigits = Array.from({ length }, () =>
    Math.floor(Math.random() * 10)
  ).join('')
  return timestamp + randomDigits.slice(0, length)
}
