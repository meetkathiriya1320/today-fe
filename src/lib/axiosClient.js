"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import Cookies from "js-cookie";

// ==================================================
// CONSTANTS
// ==================================================
const TIMEOUT_MS = 20000;
const STATUS_UNAUTHORIZED = 401;
const STATUS_CLIENT_ERROR_MIN = 400;
const STATUS_SERVER_ERROR_MIN = 500;

const MESSAGE_INVALID_CREDENTIALS = "Invalid credentials.";
const MESSAGE_NETWORK_ERROR = "Network error occurred.";
const MESSAGE_CLIENT_ERROR = "Client error occurred.";
const MESSAGE_GENERIC_ERROR = "Something went wrong.";
const MESSAGE_UNAUTHORIZED_ACCESS = "Unauthorized access.";
const MESSAGE_API_CALL_FAILED = "API call failed.";

const IS_DEV = process.env.NEXT_PUBLIC_IS_DEV === "true";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

// ==================================================
// AXIOS INSTANCE
// ==================================================
let isApiCallFailed = false;

const axiosClient = axios.create({
  baseURL,
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==================================================
// REQUEST INTERCEPTOR: LOGGING
// ==================================================
axiosClient.interceptors.request.use(
  (config) => {
    isApiCallFailed = false;
    if (IS_DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: { ...config.headers },
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================================================
// REQUEST INTERCEPTOR: AUTH TOKEN
// ==================================================
axiosClient.interceptors.request.use(
  (config) => {
    if (config.url?.includes("/auth/login")) return config;

    const user = getCurrentUserCookie();
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.language = "en";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================================================
// ERROR HANDLING
// ==================================================
axiosClient.interceptors.response.use(
  (response) => {
    if (IS_DEV) {
      console.log(`[Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === STATUS_UNAUTHORIZED) {
      const isLogin = error.config?.url?.includes("/auth/login");

      if (!isLogin) {
        isApiCallFailed = true;
      }
    }
    return Promise.reject(error);
  }
);

// ==================================================
// UNAUTHORIZED HANDLER
// ==================================================
export const unAuthorized = (router) => {

  Cookies.remove("current_user");
  router("/unauthorized");
};

// ==================================================
// COMMON ERROR HANDLER
// ==================================================
const commonErrorHandler = (error, router) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  console.log(status, STATUS_UNAUTHORIZED)
  if (status === STATUS_UNAUTHORIZED) {
    if (error.config?.url?.includes("/auth/login")) {
      toast.error(message || MESSAGE_INVALID_CREDENTIALS);
      throw new Error(MESSAGE_INVALID_CREDENTIALS);
    }


    toast.error(MESSAGE_UNAUTHORIZED_ACCESS);
    unAuthorized(router);
    return;
  }

  if (status >= STATUS_SERVER_ERROR_MIN) {
    toast.error(message || MESSAGE_NETWORK_ERROR);
    throw new Error(message || MESSAGE_NETWORK_ERROR);
  }

  if (status >= STATUS_CLIENT_ERROR_MIN) {
    toast.error(message || MESSAGE_CLIENT_ERROR);
    throw new Error(message || MESSAGE_CLIENT_ERROR);
  }
  toast.error(message || MESSAGE_GENERIC_ERROR);
  throw new Error(message || MESSAGE_GENERIC_ERROR);
};

// ==================================================
// CONFIG BUILDER
// ==================================================
const buildConfig = (type) => ({
  headers: {
    "Content-Type":
      type === "form-data"
        ? "multipart/form-data"
        : type === "form-urlencoded"
          ? "application/x-www-form-urlencoded"
          : "application/json",
  },
});

// ==================================================
// API METHODS
// ==================================================

// ---------- GET ----------
export const getRequest = async (
  URL,
  params,
  router,
  responseType = "json"
) => {
  if (isApiCallFailed) throw new Error(MESSAGE_API_CALL_FAILED);

  try {
    const res = await axiosClient.get(URL, { params, responseType });

    if (responseType === "blob") {
      return { response: res.data, successType: true };
    }

    return {
      response: res.data,
      successType: res.data.success,
      message: res.data.message,
    };
  } catch (err) {
    commonErrorHandler(err, router);
  }
};

// ---------- POST ----------
export const postRequest = async (URL, payload, router, type, hideSuccessToast = false) => {
  if (isApiCallFailed) throw new Error(MESSAGE_API_CALL_FAILED);

  try {
    const res = await axiosClient.post(URL, payload, buildConfig(type));
    if (res.data.success) {
      if (!hideSuccessToast) {
        toast.success(res.data.message);
      }
    }
    return {
      response: res.data,
      successType: res.data.success,
      message: res.data.message,
    };
  } catch (err) {
    commonErrorHandler(err, router);
  }
};

// ---------- PUT ----------
export const putRequest = async (URL, payload, router, type) => {
  if (isApiCallFailed) throw new Error(MESSAGE_API_CALL_FAILED);

  try {
    const res = await axiosClient.put(URL, payload, buildConfig(type));
    if (res.data.success) toast.success(res.data.message);

    return {
      response: res.data,
      successType: res.data.success,
      message: res.data.message,
    };
  } catch (err) {
    commonErrorHandler(err, router);
  }
};

// ---------- PATCH ----------
export const patchRequest = async (URL, payload, router, type) => {
  if (isApiCallFailed) throw new Error(MESSAGE_API_CALL_FAILED);

  try {
    const res = await axiosClient.patch(URL, payload, buildConfig(type));
    if (res.data.success) {
      if (res.data.message) {
        toast.success(res.data.message);
      }
    }

    return {
      response: res.data,
      successType: res.data.success,
      message: res.data.message,
    };
  } catch (err) {
    commonErrorHandler(err, router);
  }
};

// ---------- DELETE ----------
export const deleteRequest = async (URL, router) => {
  if (isApiCallFailed) throw new Error(MESSAGE_API_CALL_FAILED);

  try {
    const res = await axiosClient.delete(URL);
    if (res.data.success) toast.success(res.data.message);

    return {
      response: res.data,
      successType: res.data.success,
      message: res.data.message,
    };
  } catch (err) {
    commonErrorHandler(err, router);
  }
};

export default axiosClient;
