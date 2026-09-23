import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
axios.defaults.withCredentials = true;

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A placeholder variable that will store the token reference globally in memory
let authToken: string | null = null;

// Function to update the token from React land
export const setInterceptorToken = (token: null | string) => {
  authToken = token;
  console.log('authToken', authToken);
};

// Request Interceptor: Attach Access Token from memory/sessionStorage
apiClient.interceptors.request.use(
  (config) => {
    if (authToken && config.headers) {
      config.headers.set('Authorization', `Bearer ${authToken}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Response Interceptor: Sliding Session Auto-Refresh on 401
type CustomRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface ApiErrorData {
  errors?: string;
  success?: boolean;
}

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config as CustomRequestConfig | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const errorData = error.response?.data;
      if (errorData?.errors === 'InvalidCredentials') {
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post<RefreshResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.data.accessToken;
        setInterceptorToken(newAccessToken);
        //sessionStorage.setItem('access_token', newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        }
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        setInterceptorToken(null);

        if (axios.isAxiosError<ApiErrorData>(refreshError)) {
          if (refreshError.response?.data?.success === false) {
            console.log(refreshError.response.data.success);
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
