"use client";

import HolographicSticker from "holographic-sticker";

interface HolographicImageStickerProps {
  className?: string;
}

const HolographicImageSticker = ({
  className = "",
}: HolographicImageStickerProps) => {
  return (
    <div className={`relative overflow-hidden w-64 ${className}`}>
      <HolographicSticker.Root>
        <HolographicSticker.Scene>
          <HolographicSticker.Card
            className="border border-white rounded-2xl w-full h-full"
          >
            <HolographicSticker.ImageLayer
              src="https://holographic-sticker.vercel.app/light.png"
              alt="Lightning"
              objectFit="contain"
            />
            <HolographicSticker.Pattern
              maskUrl="https://holographic-sticker.vercel.app/light.png"
              maskSize="contain"
              textureUrl="https://assets.codepen.io/605876/figma-texture.png"
              textureSize="6cqi"
              mixBlendMode="hard-light"
              opacity={0.7}
            >
              <HolographicSticker.Refraction intensity={2} />
            </HolographicSticker.Pattern>
            <HolographicSticker.Content>
              <HolographicSticker.ImageLayer
                src="https://holographic-sticker.vercel.app/light.png"
                alt=""
                opacity={0.2}
                objectFit="contain"
              />
            </HolographicSticker.Content>
          </HolographicSticker.Card>
        </HolographicSticker.Scene>
      </HolographicSticker.Root>
    </div>
  );
};

export default HolographicImageSticker;
