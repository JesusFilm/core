import firebase from 'firebase/compat/app'

export const firebaseClient = firebase.initializeApp(
  JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG_JSON ?? '{}')
)
