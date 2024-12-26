'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Me } from '@/types/me';

export function useAuth() {
  const router = useRouter();
  const { me, loading, setMe, setLoading } = useAuthStore();
  const initialLoadDone = useRef(false);

  const checkTokenExpiration = useCallback((userData: Me): boolean => {
    if (!userData.exp) return false;
    // 加入緩衝時間（例如 5 分鐘），避免臨界點問題
    return Date.now() < (userData.exp * 1000) - 5 * 60 * 1000;
  }, []);

  const logout = useCallback(async () => {
    // 立即設置載入狀態，避免短暫的認證狀態不一致
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('登出請求失敗:', response.status);
      }
    } catch (error) {
      console.error('登出失敗:', error);
    } finally {
      // 無論如何都要清除狀態並導向登入頁
      setMe(null);
      setLoading(false);
      router.push('/login');
    }
  }, [router, setMe, setLoading]);

  const fetchMe = useCallback(async (force = false) => {
    // 如果不是強制更新且已有有效的使用者資訊，則直接返回
    if (!force && me && checkTokenExpiration(me)) {
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
      return;
    }

    // 如果是初次載入或強制更新，設置載入狀態
    if (!initialLoadDone.current || force) {
      setLoading(true);
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
          console.error('Token 已過期');
          await logout();
          return;
        }
      } else {
        if (response.status === 401) {
          console.error('未授權的請求');
          await logout();
          return;
        } else {
          console.error('驗證請求失敗:', response.status);
          setMe(null);
        }
      }
    } catch (error) {
      console.error('取得用戶資訊失敗:', error);
      await logout();
    } finally {
      if (!initialLoadDone.current || force) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, [me, checkTokenExpiration, logout, setMe, setLoading]);

  const checkAndUpdateAuth = useCallback(() => {
    if (me && !checkTokenExpiration(me)) {
      console.error('定期檢查：Token 已過期');
      logout();
    }
  }, [me, checkTokenExpiration, logout]);

  useEffect(() => {
    // 初始載入時執行一次驗證
    fetchMe();

    // 設置定期檢查
    const checkInterval = setInterval(checkAndUpdateAuth, 60000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [fetchMe, checkAndUpdateAuth]);

  return {
    me,
    loading,
    logout,
    isAuthenticated: !!me && checkTokenExpiration(me),
    refreshMe: () => fetchMe(true),
  };
}