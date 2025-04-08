export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '登入失敗');
      }

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('無法連接到伺服器');
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('登出失敗');
      }

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('登出過程中發生錯誤');
    }
  },
};