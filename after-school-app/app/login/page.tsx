import { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: '登入',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="text-center text-muted-foreground text-sm mt-4">
          需要幫助？請聯絡系統管理員
        </p>
      </div>
    </div>
  );
}