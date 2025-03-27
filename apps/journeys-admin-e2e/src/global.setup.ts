import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { setupGlobalAuth } from './framework/auth-state'

setup('authenticate', async ({ browser }) => {
  // Ensure auth directory exists
  const authDir = path.join(__dirname, '..', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Setup authentication and save state
  const { storageState } = await setupGlobalAuth(browser)
  
  // Move the auth state file to the .auth directory
  const finalPath = path.join(authDir, 'user.json')
  fs.renameSync(storageState, finalPath)
}) 