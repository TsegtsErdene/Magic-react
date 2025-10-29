export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type UserInfo = { username: string; projectName: string; companyId: string };

export type LoginResponse =
  | { token: string; user: UserInfo }
  | { requiresPasswordChange: true; changeToken: string; user: UserInfo };

export async function apiLogin(input: {
  username: string;
  password: string;
  companyId: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data as LoginResponse;
}

export async function apiChangePassword(
  changeToken: string,
  input: { currentPassword: string; newPassword: string }
) {
  const res = await fetch(`${BASE_URL}/auth/password/change`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${changeToken}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to change password");
  return data as { message: string };
}