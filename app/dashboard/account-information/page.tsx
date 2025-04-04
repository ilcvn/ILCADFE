'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type Account from '@/app/models/features/account';
import Cookies from 'js-cookie';
import { ROLE_LABELS, type UserRole } from '@/app/enums/user-account';

export default function AccountInformationPage() {
  const [user, setUser] = useState<Account | null>();

  useEffect(() => {
    const data = Cookies.get('user');
    setUser(JSON.parse(data as string));
  }, []);

  return (
    <div className="flex justify-center items-center min-h-full">
      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <img src="https://github.com/shadcn.png" alt="Avatar" />
          </Avatar>
          <p className="text-xl font-semibold">{user?.name}</p>
          <p className="text-black">
            Tên người dùng: <span className="text-muted-foreground">{user?.userName}</span>
          </p>
          <p className="text-black">
            Quyền: <span className="text-muted-foreground">{ROLE_LABELS[user?.role as UserRole]}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
