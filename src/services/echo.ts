import Echo from "laravel-echo";
import Pusher from "pusher-js";

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

export const getEcho = (): Echo | null => {
  if (!pusherKey) {
    return null;
  }

  if (!echoInstance) {
    const token = localStorage.getItem("kiloneed_token");
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

