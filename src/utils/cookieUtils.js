"use client";

import Cookies from "js-cookie";

// 👉 Set user in cookies (plain JSON)
export const setCurrentUserCookie = (user) => {
  if (user) {
    Cookies.set("current_user", JSON.stringify(user), {
      expires: 7, // 7 days
      path: "/", // available on all routes
      sameSite: "Strict", // CSRF protection
      secure: true, // required on HTTPS
    });
  } else {
    Cookies.remove("current_user");
  }
};

// 👉 Get user from cookies (parse JSON)
export const getCurrentUserCookie = () => {
  try {
    const userCookie = Cookies.get("current_user");
    if (!userCookie) return null;

    return JSON.parse(userCookie);
  } catch (err) {
    return null;
  }
};

// 👉 Remove user (logout)
export const clearCurrentUserCookie = () => {
  Cookies.remove("current_user");
};

export const setCookieItem = (key, value) => {
  if (value) {
    Cookies.set(key, JSON.stringify(value), {
      expires: 7, // 7 days
      path: "/", // available on all routes
      sameSite: "Strict", // CSRF protection
      secure: true, // required on HTTPS
    });
  } else {
    Cookies.remove(key);
  }
};


export const getCookieItem = (key) => {
  const data = Cookies.get(key);
  if (data) {
    return JSON.parse(data)
  }
  return null
}
