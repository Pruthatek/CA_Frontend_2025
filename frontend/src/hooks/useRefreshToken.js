import axios from '../api/axios';

const useRefreshToken = () => {
  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      const response = await axios.post(
        '/auth/token/refresh/',
        { refresh: refreshToken },
        { withCredentials: true }
      );
      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      // Optionally handle logout or other fallback
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;