// Mock auth client — authentication is disabled. The app always runs as a
// single demo user, so there is no sign-in flow and no session endpoint.

const mockUser = { id: "u-guest", name: "Гость", email: "guest@mura.kz", image: null };
const mockSession = {
  user: mockUser,
  session: {
    id: "mock-session",
    userId: mockUser.id,
    token: "mock-token",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
};

export function getToken() {
  return "mock-token";
}

export function captureToken() {}

const ok = async (_credentials?: unknown) => ({ data: mockSession, error: null });

export const authClient = {
  useSession: () => ({ data: mockSession, isPending: false, error: null }),
  signIn: { email: ok },
  signUp: { email: ok },
  signOut: async () => ({ data: null, error: null }),
};
