import { JSX, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface NavButtonProps {
  icon: ReactNode;
  text: string;
  href: string;
  active?: boolean;
}

const NavButton = ({ 
  icon, 
  text, 
  href,
  active = false 
}: NavButtonProps): JSX.Element => {
  return (
    <Link href={href}>
      <Button
        variant={active ? "default" : "ghost"}
        className="flex items-center gap-2"
      >
        {icon}
        <span>{text}</span>
      </Button>
    </Link>
  );
};

export default NavButton;