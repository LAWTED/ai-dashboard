'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 /readme
    router.push('/yellowbox');
  }, [router]);

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Redirecting...</h1>
        <p>Redirecting to Documentation page, please wait...</p>
      </div>
    </div>
  );
}
