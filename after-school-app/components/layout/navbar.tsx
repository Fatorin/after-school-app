'use client'

import { Home, Users, GraduationCap, School, LogOut } from 'lucide-react';
import NavButton from './nav-button';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';

const noNavbarRoutes = [
  '/login',
  '/forgot-password',
];

const navItems = [
  { icon: Home, text: '首頁', href: '/' },
  { icon: School, text: '教職名單', href: '/teachers' },
  { icon: Users, text: '學生資料', href: '/students' },
  { icon: GraduationCap, text: '學生成績', href: '/grades' },
] as const;

const NavbarLayout = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  return (
    <nav className="border-b">
      <div className="max-full mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左側 Logo */}
          <div className="text-xl font-bold">
            課後班管理系統
          </div>

          {/* 導航選項 */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <NavButton
                key={item.href}
                icon={<item.icon className="h-4 w-4" />}
                text={item.text}
                href={item.href}
                active={pathname === item.href}
              />
            ))}
            <Button
              onClick={logout}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Navbar = () => {
  const pathname = usePathname();

  if (noNavbarRoutes.includes(pathname ?? '')) {
    return null;
  }

  return <NavbarLayout />;
};

export default Navbar;