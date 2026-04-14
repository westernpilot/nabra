import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase";

const GUEST_KEY = "nabra_guest_mode";

export type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "signed_in"; user: User };

let _listeners: ((state: AuthState) => void)[] = [];
let _currentState: AuthState = { status: "loading" };

function notify(state: AuthState) {
  _currentState = state;
  _listeners.forEach((fn) => fn(state));
}

export function onAuthChange(fn: (state: AuthState) => void): () => void {
  _listeners.push(fn);
  fn(_currentState);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getAuthState(): AuthState {
  return _currentState;
}

export async function initAuth(): Promise<void> {
  const isGuest = await AsyncStorage.getItem(GUEST_KEY);

  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        notify({ status: "signed_in", user });
      } else if (isGuest === "true") {
        notify({ status: "guest" });
      } else {
        notify({ status: "loading" });
      }
      unsub();
      resolve();
    });
  });
}

export async function signInWithGoogle(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
  await AsyncStorage.removeItem(GUEST_KEY);
}

export async function continueAsGuest(): Promise<void> {
  await AsyncStorage.setItem(GUEST_KEY, "true");
  notify({ status: "guest" });
}

export async function signOut(): Promise<void> {
  if (auth.currentUser) {
    await fbSignOut(auth);
  }
  await AsyncStorage.removeItem(GUEST_KEY);
  notify({ status: "loading" });
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isSignedIn(): boolean {
  return _currentState.status === "signed_in";
}
