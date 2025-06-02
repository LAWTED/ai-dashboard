export default function PuaGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-900">人际关系模拟器</h1>
        {children}
      </div>
    </main>
  );
}