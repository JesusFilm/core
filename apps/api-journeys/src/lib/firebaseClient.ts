import * as admin from 'firebase-admin'

export const firebaseClient = admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(
      process.env.GOOGLE_APPLICATION_JSON != null &&
        process.env.GOOGLE_APPLICATION_JSON !== ''
        ? process.env.GOOGLE_APPLICATION_JSON
        : '{}'
    )
  )
})
