import { initializeApp } from 'firebase/app'
import options from '../../../secrets/firebase.json'

export const firebaseClient = initializeApp(options)
