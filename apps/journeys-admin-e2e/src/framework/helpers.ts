import user from '../../user.json'

export async function getEmail(): Promise<string> {
  const email = process.env.PLAYWRIGHT_EMAIL?.toString() ?? user.email

  if (!email || email === '') {
    throw new Error('Email was not provided via environment variable')
  }
  return email
}

export async function getPassword(): Promise<string> {
  const password = process.env.PLAYWRIGHT_PASSWORD?.toString() ?? user.password

  if (!password || password === '') {
    throw new Error('Password was not provided via environment variable')
  }
  return password
}

export async function getUser(): Promise<string> {
  const firstAndLastName = process.env.PLAYWRIGHT_USER?.toString() ?? user.first_last_name

  if (!firstAndLastName || firstAndLastName === '') {
    throw new Error(
      'First and Last name was not provided via environment variable'
    )
  }
  return firstAndLastName
}

export async function getTeamName(): Promise<string> {
  const teamName = process.env.PLAYWRIGHT_TEAM_NAME?.toString() ?? user.team_name

  if (!teamName || teamName === '') {
    throw new Error('Team name was not provided via environment variable')
  }
  return teamName
}
