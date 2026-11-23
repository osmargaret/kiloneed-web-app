import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { TOKEN_KEY } from "./apiClient";

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

window.Pusher = Pusher;

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY || "";
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";

let echoInstance: Echo | null = null;
let echoToken: string | null = null;

export const resetEcho = () => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // ignore
    }
    echoInstance = null;
    echoToken = null;
  }
};

export const getEcho = (): Echo | null => {
  if (!pusherKey) {
    return null;
  }

  const token = localStorage.getItem(TOKEN_KEY) || "";
  if (echoInstance && echoToken !== token) {
    resetEcho();
  }

  if (!echoInstance) {
    echoToken = token;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const authEndpoint = apiBase.replace(/\/api\/?$/, "") + "/broadcasting/auth";

    echoInstance = new Echo({
      broadcaster: "pusher",
      key: pusherKey,
      cluster: pusherCluster,
      forceTLS: true,
      authEndpoint,
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      },
    });

    window.Echo = echoInstance;
  }

  return echoInstance;
};

export default getEcho;

