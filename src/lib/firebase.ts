import { signal } from '@preact/signals-react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
export const SESSION_TOKEN_KEY = "firebase"
export const SESSION_DATA_KEY = "session"

// TODO: Paste the initialization snippet from Firebase Console.
firebase.initializeApp({
  // ...
})

export { firebase }

function getUser() {
  let saved = localStorage.getItem(SESSION_DATA_KEY)
  if (saved != null && saved != 'null') {
    return JSON.parse(saved) as firebase.User
  }
  return firebase.auth().currentUser
}

export const sessionData = signal(getUser())

// Handles any firebase auth events
firebase.auth().onAuthStateChanged((signedInUser) => {
  if (signedInUser) {
    // The user has authenticated successfully
    console.log('onAuthStateChanged', signedInUser)
    // Generate a new auth token for user requests
    firebase
      .auth()
      .currentUser?.getIdToken()
      .then((token) => {
        localStorage.setItem(SESSION_TOKEN_KEY, token)
        localStorage.setItem(
          SESSION_DATA_KEY,
          JSON.stringify({
            uid: signedInUser.uid,
            displayName: signedInUser.displayName,
            photoURL: signedInUser.photoURL,
            // email: signedInUser.email,
            // emailVerified: signedInUser.emailVerified,
            // phoneNumber: signedInUser.phoneNumber,
            // providerData: signedInUser.providerData,
          })
        )
        // Update the session data for the UI
        if (!sessionData.value) {
          sessionData.value = signedInUser
        }
      })
  } else {
    // The user has signed out, close session.
    localStorage.removeItem(SESSION_DATA_KEY)
    // Update the session data for the UI
    if (sessionData.value) {
      sessionData.value = null
    }
  }
})

export const signOut = () => firebase.auth().signOut()

export async function updateCurrentUser(data: any) {
  let authUser = sessionData.value
  if (authUser) {
    await firebase.auth().currentUser?.updateProfile(data)
    sessionData.value = firebase.auth().currentUser
  }
}
