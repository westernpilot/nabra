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

let _isGuest = false;

export async function initAuth(): Promise<void> {
  _isGuest = (await AsyncStorage.getItem(GUEST_KEY)) === "true";

  let resolved = false;
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        _isGuest = false;
        notify({ status: "signed_in", user });
      } else if (_isGuest) {
        notify({ status: "guest" });
      } else {
        notify({ status: "loading" });
      }
      if (!resolved) {
        resolved = true;
        resolve();
      }
    });
  });
}

export async function signInWithGoogle(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);
  await AsyncStorage.removeItem(GUEST_KEY);
  _isGuest = false;
  notify({ status: "signed_in", user: cred.user });
}

export async function continueAsGuest(): Promise<void> {
  await AsyncStorage.setItem(GUEST_KEY, "true");
  _isGuest = true;
  notify({ status: "guest" });
}

export async function signOut(): Promise<void> {
  if (auth.currentUser) {
    await fbSignOut(auth);
  }
  await AsyncStorage.removeItem(GUEST_KEY);
  _isGuest = false;
  notify({ status: "loading" });
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isSignedIn(): boolean {
  return _currentState.status === "signed_in";
}
