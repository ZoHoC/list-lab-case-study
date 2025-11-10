import Cookies from 'js-cookie';
import { ACCESS_TOKEN_KEY } from '../utils/constants/storage-keys.constant.ts';

type ApiCallParams = {
  endpoint: string;
  method: string;
  queryParams?: Record<string, string | number | boolean>;
  payload?: object;
  overrideAuthToken?: string;
};

type ApiErrorResponse = {
  message: string;
  error?: string;
  statusCode: number;
};

const apiCall = async ({
  endpoint,
  method,
  queryParams = {},
  payload,
  overrideAuthToken, // eslint-disable-next-line
}: ApiCallParams): Promise<any> => {
  const url = new URL(`${import.meta.env.VITE_API_URL}${endpoint}`);
  url.search = new URLSearchParams(
    Object.keys(queryParams).map((key) => [
      key,
      queryParams[key].toString(),
    ]),
  ).toString();

  const authToken = overrideAuthToken ?? Cookies.get(ACCESS_TOKEN_KEY);

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && {
        Authorization: `Bearer ${authToken}`,
      }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { message }: ApiErrorResponse = await response.json();

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export default apiCall;
