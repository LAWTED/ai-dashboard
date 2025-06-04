export default function PuaGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto py-6">

        {children}
      </div>
    </main>
  );
}