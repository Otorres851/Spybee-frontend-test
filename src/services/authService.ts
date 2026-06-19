export type AuthUser = {
  initials: string;
  name: string;
  role: string;
  email: string;
};

const AUTH_STORAGE_KEY = "spybee-auth-session";

const MOCK_USER: AuthUser = {
  initials: "JT",
  name: "Julian",
  role: "superadmin",
  email: "julian@spybee.com",
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};

export function getStoredSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? (JSON.parse(rawSession) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function persistSession(user: AuthUser, remember: boolean) {
  if (typeof window === "undefined") return;

  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  if (remember) window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getBrowserSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const session = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (session) return JSON.parse(session) as AuthUser;
    return getStoredSession();
  } catch {
    return null;
  }
}

export async function loginWithMockCredentials(credentials: LoginCredentials): Promise<AuthUser> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));

  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password.trim();
  const validEmail = email === "julian@spybee.com" || email === "admin@spybee.com";
  const validPassword = password === "Spybee2026" || password === "admin123";

  if (!validEmail || !validPassword) {
    throw new Error("invalidCredentials");
  }

  const user = { ...MOCK_USER, email };
  persistSession(user, credentials.remember);
  return user;
}
