'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [response, setResponse] = useState<{ message?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestAlice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alice');
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: '请求失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI 中台测试界面</h1>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Alice API 测试</h2>
            <Button
              onClick={handleTestAlice}
              disabled={loading}
              className="w-full"
            >
              {loading ? '处理中...' : '测试 Alice API'}
            </Button>
          </section>

          {response && (
            <div className="mt-8 p-4 bg-muted rounded-md">
              <h2 className="text-lg font-medium mb-2">响应结果：</h2>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
