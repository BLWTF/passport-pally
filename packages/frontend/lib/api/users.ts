import apiFetch from "../api-fetch";
import { UserState } from "../types/users";

export async function loginUser({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}) {
  try {
    const data = await apiFetch("/login", "POST", {
      identifier,
      password,
    });

    return data;
  } catch (error) {
    throw (error as { error: string }).error;
  }
}

export async function tempLoginUser() {
  try {
    const data = await apiFetch("/login/temp", "GET");

    return data;
  } catch (error) {
    throw (error as { error: string }).error;
  }
}

export async function internalLoginUser(accessToken: string) {
  try {
    const data = await apiFetch(
      "/login/internal",
      "GET",
      undefined,
      undefined,
      { Authorization: `Bearer ${accessToken}` }
    );

    return data;
  } catch (error) {
    throw (error as { error: string }).error;
  }
}

export async function getUserStatePreview(accessToken: string) {
  try {
    const data: UserState = await apiFetch(
      "/state/preview",
      "GET",
      undefined,
      undefined,
      { Authorization: `Bearer ${accessToken}` }
    );

    return data;
  } catch (error) {
    throw (error as { error: string }).error;
  }
}
