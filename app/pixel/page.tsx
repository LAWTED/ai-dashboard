
import PixelButton from "@/components/pixel/button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PixelUITestPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/pixel/sprite-tool" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>
          Go to Sprite Tool
        </Link>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Pixel UI Test Page</h1>
      <p style={{ marginBottom: 24 }}>
        This page demonstrates the <code>StartButton</code> pixel component. Hover to see the effect.
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <PixelButton dynamic>
          Hello hhhhhhhh
        </PixelButton>
        <PixelButton>
          Hello
        </PixelButton>
        <Button>
          Hello
        </Button>
        Pixel Button
      </div>
    </div>
  );
}