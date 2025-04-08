'use client'

import { useRouter } from 'next/navigation';
import { Home, Users, GraduationCap, School, LogOut, Church, Book } from 'lucide-react';
import NavButton from './nav-button';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { authService } from '@/lib/api/client-auth';

const noNavbarRoutes = [
  '/login',
  '/forgot-password',
];

const navItems = [
  { icon: Home, text: '首頁', href: '/' },
  { icon: Church, text: '會友名單', href: '/members' },
  { icon: Users, text: '教職名單', href: '/teachers' },
  { icon: School, text: '學生資料', href: '/students' },
  { icon: Book, text: '學生成績', href: '/student_infos' },
  { icon: GraduationCap, text: '簽到表', href: '/attendances' },
] as const;

const NavbarLayout = () => {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('登出過程中發生錯誤:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="max-full mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          <div className="text-xl font-bold">
            教會社群系統
          </div>

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