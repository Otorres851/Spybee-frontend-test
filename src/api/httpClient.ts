type AxiosLikeResponse<T> = {
  data: T;
  status: number;
};

type AxiosLikeConfig = {
  signal?: AbortSignal;
};

/**
 * Small Axios-shaped HTTP client for this technical test. It keeps the service
 * layer decoupled from React and avoids spreading raw request logic in hooks.
 */
export const axiosClient = {
  get<T>(url: string, config: AxiosLikeConfig = {}) {
    return new Promise<AxiosLikeResponse<T>>((resolve, reject) => {
      const request = new XMLHttpRequest();

      request.open("GET", url, true);
      request.responseType = "json";
      request.setRequestHeader("Accept", "application/json");

      const abort = () => {
        request.abort();
        reject(new DOMException("Request aborted", "AbortError"));
      };

      config.signal?.addEventListener("abort", abort, { once: true });

      request.onload = () => {
        config.signal?.removeEventListener("abort", abort);

        if (request.status >= 200 && request.status < 300) {
          resolve({ data: request.response as T, status: request.status });
          return;
        }

        reject(new Error(`HTTP ${request.status}`));
      };

      request.onerror = () => {
        config.signal?.removeEventListener("abort", abort);
        reject(new Error("Network request failed"));
      };

      request.send();
    });
  },
};
