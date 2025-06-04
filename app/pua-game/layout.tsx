export default function PuaGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center text-purple-900">凤舞九天</h1>
          <a href="/pua-game/debug" className="text-sm text-purple-600 hover:text-purple-800">Debug</a>
        </div>
        {children}
      </div>
    </main>
  );
}