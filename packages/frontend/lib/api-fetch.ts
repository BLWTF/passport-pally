/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function apiFetch(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  body?: BodyInit | object,
  abortSignal?: AbortSignal,
  headers?: HeadersInit,
  onUploadProgress?: ProgressCallback
) {
  const isFormData = body instanceof FormData;
  body = isFormData ? body : JSON.stringify(body);
  headers = isFormData
    ? headers
    : {
        "Content-Type": "application/json",
        ...headers,
      };

  try {
    if (onUploadProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            onUploadProgress(e.loaded, e.total, percentage);
          }
        });

        xhr.addEventListener("load", async () => {
          try {
            const contentType = xhr.getResponseHeader("content-type");
            const isJsonResponse = contentType?.includes("application/json");

            let data;
            if (isJsonResponse) {
              data = JSON.parse(xhr.responseText);
            } else {
              data = xhr.responseText;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              const error = new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
              (error as any).status = xhr.status;
              (error as any).data = data;
              reject(error);
            }
          } catch (e) {
            reject(e);
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error"));
        });

        if (abortSignal) {
          abortSignal.addEventListener("abort", () => {
            xhr.abort();
            reject(new Error("Request aborted"));
          });
        }

        xhr.open(method, `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`);
        xhr.withCredentials = true;

        // Set headers
        if (headers && !isFormData) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value as string);
          });
        }

        xhr.send(body as XMLHttpRequestBodyInit);
      });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${url}`, {
      body: body as BodyInit,
      headers,
      method,
      signal: abortSignal,
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export interface ProgressCallback {
  (loaded: number, total: number, percentage: number): void;
}
