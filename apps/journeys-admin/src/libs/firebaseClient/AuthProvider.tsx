import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactElement
} from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

interface AuthContextType {
  currentUser?: string | null
  signInConfig?: string | unknown
  signUp?: (email: string, password: string) => void
  logOut?: () => void
  handleAuthResponse?: (
    firstName?: string,
    lastName?: string,
    email?: string,
    imageUrl?: string
  ) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => useContext(AuthContext)


export const USER_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
    userCreate(input: $input) {
      id
      firebaseId
      firstName
      lastName
      email
      imageUrl
    }
  }
`

export function AuthProvider({ children }): ReactElement {
  const [currentUser, setCurrentUser] = useState<string | null>()
  const [firebaseId, setFirebaseId] = useState<string>()
  const auth = getAuth()
  const [userCreate] = useMutation<UserCreate>(USER_CREATE)
  const uuid = uuidv4
  // TODO:
  // Save user sign in session as a cookie or local storage
  // Fix firebase error (auth/admin-restricted-operation)

  // Should we handle the mutation in this file?
  const handleAuthResponse = (
    firstName?: string,
    lastName?: string,
    email?: string,
    imageUrl?: string
  ): void => {
    const id = uuid

    void userCreate({
      variables: {
        input: {
          id,
          firebaseId,
          firstName,
          lastName,
          email,
          imageUrl
        },
        optimisticResponse: {
          userCreate: {
            id,
            firebaseId: firebaseId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            imageUrl: imageUrl
          }
        }
      }
    })
  }

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
        console.log(user)
        if (user != null) {
          setCurrentUser(user.email)
          setFirebaseId(user.uid)
        }
      })
    return unregisterAuthOberserver()
  }, [])

  const signUp = (email: string, password: string): void => {
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
    logOut,
    handleAuthResponse
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
