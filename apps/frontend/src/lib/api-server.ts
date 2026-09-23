import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001/api/v1';

export const fetchFromServer = async (endpoint: string) => {
  // 1. Dynamically import next/headers so it executes exclusively on the server runtime
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  // 2. Safely pull the refresh token out of the incoming browser cookie bundle
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    throw new Error('Unauthorized: No refresh token found in cookies.');
  }

  try {
    // 3. Centralized Rotation: Ping NestJS to trade the cookie for a fresh access token
    const refreshResponse = await axios.post(
      `${BACKEND_URL}/auth/refresh`,
      {},
      {
        headers: {
          // Manually pass the cookie header because Node.js doesn't do it automatically
          Cookie: `refresh_token=${refreshToken}`,
        },
      },
    );

    const { accessToken } = refreshResponse.data?.data;

    // 4. Fire the actual data request using the newly generated access token
    const dataResponse = await axios.get(`${BACKEND_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return dataResponse.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Server-side fetch error on ${endpoint}:`, errorMessage);
    throw new Error('Session completely expired. Please log back in.');
  }
};
