import { useSession } from "next-auth/react";
import { AuthSession } from "../types/session";
import { useEffect, useState } from "react";
import { internalLoginUser } from "../api/users";
import apiFetch, { ProgressCallback } from "../api-fetch";
import { wait } from "../helpers";

export default function useAuth() {
  const { data, status, update } = useSession();

  const isUnauthenticated = status === "unauthenticated";

  const isLoading = status === "loading";

  const session = data as AuthSession | null;

  const user = session?.user;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(status === "authenticated");
  }, [status]);

  const refresh = async () => {
    if (!user) {
      await wait(3000);
    }

    if (!isAuthenticated) {
      return;
    }

    if (user?.accessToken) {
      setIsAuthenticated(false);
      await internalLoginUser(user.accessToken);
      setIsAuthenticated(true);
    }
  };

  const authFetch = async (
    url: string,
    method: "GET" | "POST" | "PUT" | "PATCH",
    body?: BodyInit | object,
    abortSignal?: AbortSignal,
    headers?: HeadersInit,
    timeout?: number,
    onUploadProgress?: ProgressCallback
  ) => {
    try {
      const res = await apiFetch(
        url,
        method,
        body,
        abortSignal,
        headers,
        timeout,
        onUploadProgress
      );
      return res;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (error as unknown as any).statusCode;
      if (code === 401) {
        await refresh();
        return await apiFetch(
          url,
          method,
          body,
          abortSignal,
          { Authorization: `Bearer ${user?.accessToken}` },
          timeout,
          onUploadProgress
        );
      }
    }
  };

  // useEffect(() => {
  //   const internalLogin = async () => {
  //     if (!isAuthenticated && user?.accessToken) {
  //       await internalLoginUser(user.accessToken);
  //     }
  //   };

  //   internalLogin();
  // }, [user?.accessToken, isAuthenticated]);

  return {
    isAuthenticated,
    isUnauthenticated,
    isLoading,
    session,
    update,
    authFetch,
    refresh,
  };
}
