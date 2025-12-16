"use client";
import toast from "react-hot-toast";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from "./axiosClient";
// import {
//   deleteRequest,
//   getRequest,
//   patchRequest,
//   postRequest,
//   putRequest,
// } from "./axiosClient";

// ================== DIRECT CONSTANTS ==================
const SOMETHING_WENT_WRONG = "Something went wrong.";

/**
 * Fetches data from an endpoint with optional query parameters.
 *
 * @param {Object} params Parameters for the request.
 * @param {string} params.apiEndPoint API endpoint URL
 * @param {string} [params.queryString] Query params string
 * @param {Function} params.navigate Navigation function
 * @param {string} [params.responseType] Response type (e.g., 'blob')
 * @returns {Promise<any>} The response from the API.
 */
export async function getResponse({
  apiEndPoint,
  queryString = "",
  navigate,
  responseType,
}) {
  try {
    const response = await getRequest(
      `${apiEndPoint}?${queryString}`,
      {},
      navigate,
      responseType
    );
    return response;
  } catch (err) {
    throw err;
  }
}

/**
 * Sends a POST request to an endpoint with optional query parameters.
 *
 * @param {Object} params Parameters for the request.
 */
export async function postResponse({
  apiEndPoint,
  queryString = "",
  payload,
  navigate,
  type,
}) {
  try {
    const response = await postRequest(
      `${apiEndPoint}?${queryString}`,
      payload,
      navigate,
      type
    );
    return response;
  } catch (err) {
    throw err;
  }
}

/**
 * Sends a PATCH request to an endpoint with optional query parameters.
 *
 * @param {Object} params Parameters for the request.
 */
export async function patchResponse({
  apiEndPoint,
  queryString = "",
  payload,
  navigate,
  type,
}) {
  try {
    const response = await patchRequest(
      `${apiEndPoint}?${queryString}`,
      payload,
      navigate,
      type
    );
    return response;
  } catch (err) {
    throw err;
  }
}

/**
 * Sends a PUT request to an endpoint with optional query parameters.
 *
 * @param {Object} params Parameters for the request.
 */
export async function putResponse({
  apiEndPoint,
  queryString = "",
  payload,
  navigate,
  type,
}) {
  try {
    const response = await putRequest(
      `${apiEndPoint}?${queryString}`,
      payload,
      navigate,
      type
    );
    return response;
  } catch (err) {
    throw err;
  }
}

/**
 * Sends a DELETE request to an endpoint with optional query parameters.
 *
 * @param {Object} params Parameters for the request.
 */
export async function deleteResponse({
  apiEndPoint,
  queryString = "",
  navigate,
}) {
  try {
    const response = await deleteRequest(
      `${apiEndPoint}?${queryString}`,
      navigate
    );
    return response;
  } catch (err) {

    throw err;
  }
}
