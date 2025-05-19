import React from "react";

export default function OpenHatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto py-4">
      {children}
    </div>
  );
}