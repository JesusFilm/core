import {
  ReactElement,
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const AuthContext = createContext()

export function useAuth(): void {
  return useContext(AuthContext)
}

export function AuthProvider({ children }): ReactElement {
  const [currentUser, setCurrentUser] = useState()
  const auth = getAuth()

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

  const logOut = () => {
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
