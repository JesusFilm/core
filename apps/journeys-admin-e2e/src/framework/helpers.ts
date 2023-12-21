import user from '../../user.json'

export async function getEmail(): Promise<string> {
    const email = process.env.PLAYWRIGHT_EMAIL?.toString() ?? user.email
  
    if ((email.length === 0) || email === '') {
      throw new Error('Email was not provided via environment variable or user.json');
    }
    return email
}

export async function getPassword(): Promise<string> {
    const password = process.env.PLAYWRIGHT_PASSWORD?.toString() ?? user.password
  
    if ((password.length === 0) || password === '') {
      throw new Error('Password was not provided via environment variable or user.json');
    }
    return password
}

export async function getUser(): Promise<string> {
    const firstAndLastName = process.env.PLAYWRIGHT_USER?.toString() ?? user.first_last_name
  
    if ((firstAndLastName.length === 0) || firstAndLastName === '') {
      throw new Error('First and Last name was not provided via environment variable or user.json');
    }
    return firstAndLastName
}

export async function getTeamName(): Promise<string> {
    const teamName = process.env.PLAYWRIGHT_TEAM_NAME?.toString() ?? user.team_name
  
    if ((teamName.length === 0) || teamName === '') {
      throw new Error('Team name was not provided via environment variable or user.json');
    }
    return teamName
}