import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }): ReactNode {
  const [currentUser, setCurrentUser] = useState()
  const auth = getAuth()

  // TODO: 
  // Save user sign in session as a cookie or local storage
  // Fix firebase error (auth/admin-restricted-operation)

  const signInConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/journeys',
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        disableSignUp: {
          status: true
        }
      },
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => true
    }
  }

  useEffect(() => {
    const unregisterAuthOberserver = firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (user != null) setCurrentUser(user)
        console.log('user is logged in')
      })
    return unregisterAuthOberserver()
  }, [])

  const signUp = (email, password): void => {
    if (email !== undefined && password !== undefined) {
      void createUserWithEmailAndPassword(auth, email, password).catch(
        (error) => {
          console.log(error.message)
        }
      )
    }
  }

  const logOut = (): void => {
    void auth.signOut()
  }

  const value = {
    currentUser,
    signInConfig,
    signUp,
    logOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
