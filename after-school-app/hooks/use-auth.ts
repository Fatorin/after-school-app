'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Me } from '@/types/me';

export function useAuth() {
  const router = useRouter();
  const { me, loading, setMe, setLoading } = useAuthStore();

  const checkTokenExpiration = useCallback((userData: Me): boolean => {
    if (!userData.exp) return false;
    return Date.now() < userData.exp * 1000;
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        setMe(null);
        router.push('/login');
      } else {
        console.error('登出請求失敗');
        // 即使登出 API 失敗，仍然清除前端狀態並導向登入頁
        setMe(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('登出失敗:', error);
      // 發生錯誤時同樣清除前端狀態並導向登入頁
      setMe(null);
      router.push('/login');
    }
  }, [router, setMe]);

  const fetchMe = useCallback(async (force = false) => {
    if (!force && me && checkTokenExpiration(me)) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const json = await response.json();
        const userData = json.data as Me;
        
        if (checkTokenExpiration(userData)) {
          setMe(userData);
        } else {
          // Token 過期時呼叫登出
          await logout();
        }
      } else {
        if (response.status === 401) {
          // 未授權時呼叫登出
          await logout();
        } else {
          setMe(null);
          console.error('驗證請求失敗:', response.status);
        }
      }
    } catch (error) {
      console.error('取得用戶資訊失敗:', error);
      // 發生錯誤時呼叫登出
      await logout();
    } finally {
      setLoading(false);
    }
  }, [me, checkTokenExpiration, logout, setMe, setLoading]);

  const checkAndUpdateAuth = useCallback(() => {
    if (me && !checkTokenExpiration(me)) {
      // Token 過期時呼叫登出
      logout();
    }
  }, [me, checkTokenExpiration, logout]);

  useEffect(() => {
    fetchMe();

    const checkInterval = setInterval(checkAndUpdateAuth, 60000);
    return () => clearInterval(checkInterval);
  }, [fetchMe, checkAndUpdateAuth]);

  return {
    me,
    loading,
    logout,
    isAuthenticated: !!me && checkTokenExpiration(me),
    refreshMe: () => fetchMe(true),
  };
}