'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VaultPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=vault');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-xs text-ods-textMuted font-bold uppercase tracking-wider">
      Đang chuyển hướng tới Kho Game Đã Mua...
    </div>
  );
}
