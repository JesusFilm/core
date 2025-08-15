export async function checkEnvironmentVariables(): Promise<void> {
  console.log('Validating environment variables...')

  const requiredEnvVars = [
    'GRAPHQL_ENDPOINT',
    'FIREBASE_EMAIL',
    'FIREBASE_PASSWORD',
    'CLOUDFLARE_R2_ENDPOINT',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET'
  ]

  const missingVars: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
      console.log(`   Missing: ${envVar}`)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  console.log('   All required environment variables are set')
}
