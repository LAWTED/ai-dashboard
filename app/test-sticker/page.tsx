'use client'
import React, { useEffect, useRef, useState } from "react";

const HolographicCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showGlare, setShowGlare] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    // Simple animation sequence
    const timer = setTimeout(() => {
      setShowGlare(false);
      setIsActive(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isActive) return;

      const element = cardRef.current;
      const bounds = element?.getBoundingClientRect();

      if (!bounds) return;

      const posX = e.clientX - bounds.x;
      const posY = e.clientY - bounds.y;
      const ratioX = posX / bounds.width - 0.5;
      const ratioY = posY / bounds.height - 0.5;
      const pointerX = Math.max(-1, Math.min(1, ratioX * 2));
      const pointerY = Math.max(-1, Math.min(1, ratioY * 2));

      // Update CSS variables on document root for global access
      document.documentElement.style.setProperty("--pointer-x", pointerX);
      document.documentElement.style.setProperty("--pointer-y", pointerY);

      // Update lighting position
      const fePointLight = document.querySelector("fePointLight");
      if (fePointLight) {
        fePointLight.setAttribute("x", Math.floor(posX));
        fePointLight.setAttribute("y", Math.floor(posY));
      }
    };

    document.addEventListener("pointermove", handlePointerMove);

    // Set initial light position
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const fePointLight = document.querySelector("fePointLight");
    if (fePointLight) {
      fePointLight.setAttribute("x", centerX);
      fePointLight.setAttribute("y", centerY);
    }

    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [isActive]);

  const handleFlip = () => {
    if (!isActive) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="holographic-container">
      <style>{styles}</style>

      {/* Main scene */}
      <div className="scene">
        <article className="card" data-active={isActive} ref={cardRef}>
          <button
            aria-label="Flip card"
            aria-pressed={isFlipped}
            onClick={handleFlip}
          />
          <div className="card__content">
            {/* Card rear (back side) */}
            <div className="card__rear card__face">
              <img
                className="backdrop"
                src="https://assets.codepen.io/605876/techtrades-backdrop.png"
                alt=""
              />
              <div className="card__emboss">
                <div className="wordmark">
                  <img
                    src="https://assets.codepen.io/605876/techtrades-wordmark.png"
                    alt="Tech Trades"
                  />
                </div>
                <div className="wordmark">
                  <img
                    src="https://assets.codepen.io/605876/techtrades-wordmark.png"
                    alt="Tech Trades"
                  />
                </div>
                <img
                  className="gemstone"
                  src="https://assets.codepen.io/605876/techtrades-gemstone.png"
                  alt=""
                />
              </div>
              <div className="spotlight"></div>
            </div>

            {/* Card front (main side) */}
            <div className="card__front">
              {/* Layer 1: Base image */}
              <div className="img">
                <img
                  src="/Smoke.jpeg"
                  alt=""
                />
              </div>

              {/* Layer 2: Pattern holographic effect */}
              <div className="pattern">
                <div className="refraction"></div>
                <div className="refraction"></div>
              </div>

              {/* Layer 3: Watermark effect */}
              <div className="watermark">
                <div className="refraction"></div>
                <div className="refraction"></div>
              </div>

              {/* Layer 4: Card frame with all content */}
              <div className="card__frame card__emboss">
                <h3>
                  <span>Jhey Tompkins</span>
                  <br />
                  <span>Staff Design Engineer</span>
                </h3>
                <div className="sticker">
                  <img src="/Stanford.svg" alt="Stanford" />
                </div>
                <img
                  src="/Smoke-transparent.png"
                  alt=""
                />
              </div>

              {/* Layer 5: Spotlight effect */}
              <div className="spotlight"></div>

              {/* Layer 6: Glare container */}
              <div className="glare-container">
                {showGlare && <div className="glare"></div>}
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* SVG Filters */}
      <SvgFilters />
    </div>
  );
};

const SvgFilters = () => (
  <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="lighting">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feSpecularLighting
          result="lighting"
          in="blur"
          surfaceScale="8"
          specularConstant="12"
          specularExponent="120"
          lightingColor="hsl(0 0% 6%)"
        >
          <fePointLight x="50" y="50" z="300" />
        </feSpecularLighting>
        <feComposite
          in="lighting"
          in2="SourceAlpha"
          operator="in"
          result="composite"
        />
        <feComposite
          in="SourceGraphic"
          in2="composite"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litPaint"
        />
      </filter>
      <filter id="sticker">
        <feMorphology
          in="SourceAlpha"
          result="dilate"
          operator="dilate"
          radius="2"
        />
        <feFlood floodColor="hsl(0 0% 100%)" result="outlinecolor" />
        <feComposite
          in="outlinecolor"
          in2="dilate"
          operator="in"
          result="outlineflat"
        />
        <feMerge result="merged">
          <feMergeNode in="outlineflat" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap');

/* Root variables and theme */
:root {
  --border-color: hsl(0 0% 25%);
  --card-width: 260px;
  --pointer-x: 0;
  --pointer-y: 0;
  --parallax-img-x: 5%;
  --parallax-img-y: 5%;
  --rotate-x: 25deg;
  --rotate-y: -20deg;
}

/* Base styles */
*, *::before, *::after {
  box-sizing: border-box;
  transform-style: preserve-3d;
}

body {
  margin: 0;
  padding: 0;
  background: light-dark(#fff, #000);
  min-height: 100vh;
  overflow: hidden;
  font-family: 'SF Pro Text', 'SF Pro Icons', 'AOS Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif, system-ui;
}

body::before {
  --size: 45px;
  --line: color-mix(in hsl, canvasText, transparent 80%);
  content: '';
  height: 100vh;
  width: 100vw;
  position: fixed;
  background: linear-gradient(
        90deg,
        var(--line) 1px,
        transparent 1px var(--size)
      )
      calc(var(--size) * 0.36) 50% / var(--size) var(--size),
    linear-gradient(var(--line) 1px, transparent 1px var(--size)) 0%
      calc(var(--size) * 0.32) / var(--size) var(--size);
  mask: linear-gradient(-20deg, transparent 50%, white);
  top: 0;
  transform-style: flat;
  pointer-events: none;
  z-index: -1;
}

.holographic-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Utilities */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Scene */
.scene {
  perspective: 1000px;
  position: fixed;
  inset: 0;
  transform: translate3d(0, 0, 100vmin);
}

/* Card */
.card {
  --border: 8cqi;
  aspect-ratio: 5 / 7;
  width: var(--card-width);
  container-type: inline-size;
  touch-action: none;
  background: transparent;
  color: hsl(0 0% 10%);
  font-family: 'Sora', sans-serif;
  perspective: 1600px;
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  display: block;
}

.card img,
.card *::after,
.card *::before {
  will-change: translate, scale, filter;
}

.card[data-active='true'] {
  display: block;
  transition: transform 0.2s;
}

.card[data-active='true']:hover {
  transition: transform 0s;
  transform: rotateX(calc(var(--pointer-y) * var(--rotate-x)))
            rotateY(calc(var(--pointer-x) * var(--rotate-y)));
  animation: set backwards 0.2s;
}

@keyframes set {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }
}

.card[data-active='true']:hover .card__front img {
  transition: transform 0s;
  translate: calc(var(--pointer-x) * var(--parallax-img-x))
            calc(var(--pointer-y) * var(--parallax-img-y));
  animation: set-img backwards 0.2s;
  opacity: 1 !important;
}

@keyframes set-img {
  0% {
    translate: 0 0;
  }
}

.card:not(:hover) img {
  transition: translate 0.2s;
}

/* Card button */
.card button {
  position: absolute;
  z-index: 100;
  inset: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  opacity: 0;
  background: none;
  border: none;
}

.card *:not(button) {
  pointer-events: none;
}

/* Card content */
.card__content {
  transition: rotate 0.26s ease-out;
  transform-style: preserve-3d;
  position: absolute;
  inset: 0;
  border-radius: var(--border);
}

:has([aria-pressed='true']) .card__content {
  rotate: 180deg y;
}

/* All card layers */
.img,
.pattern,
.spotlight,
.watermark,
.card__rear,
.card__emboss,
.glare-container,
.card__front {
  position: absolute;
  inset: 0;
  border-radius: var(--border);
}

/* Card faces */
.card__front,
.card__rear {
  backface-visibility: hidden;
}

.card__front > * {
  clip-path: inset(0 0 0 0 round var(--border));
}

.card__rear {
  clip-path: inset(0 0 0 0 round var(--border));
  --border-color: oklch(28.55% 0.09665440679544547 265.51146531290146);
  transform-style: preserve-3d;
  position: absolute;
  inset: 0;
  background: color-mix(in oklch, var(--border-color), #000);
  transform: rotateY(180deg) translate3d(0, 0, 1px);
}

/* Card emboss */
.card__emboss {
  filter: url(#lighting);
  position: absolute;
  inset: 0;
  border-radius: var(--border);
  clip-path: inset(0 0 0 0 round var(--border));
}

.card__emboss::before {
  content: 'TechTrades © 2025';
  position: absolute;
  bottom: 0;
  left: 50%;
  height: calc(var(--border) * 0.5);
  display: flex;
  place-items: center;
  translate: -50% 0;
  color: #fff;
  font-size: 1.5cqi;
  opacity: 0.8;
  z-index: 100;
}

.card__emboss::after {
  content: '';
  position: absolute;
  inset: -1px;
  border: calc((var(--border) * 0.5) + 1px) solid var(--border-color);
  border-radius: var(--border);
  z-index: 99;
}

/* Images */
.card__rear > img,
.card__front > .img img {
  width: 100%;
  object-fit: cover;
  height: 100%;
  scale: 1.1;
  position: absolute;
  inset: 0;
}

.card__front .img::before {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(0 0% 50%);
}

.img img {
  filter: brightness(0.85);
  opacity: 1;
}

/* Card frame */
.card__frame {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--border);
}

.card__frame * {
  will-change: translate, scale, filter;
}

.card__frame h3 {
  margin: 0;
  top: var(--border);
  right: var(--border);
  text-align: right;
  letter-spacing: -0.05em;
  font-weight: 1000;
  line-height: 1;
  z-index: 100;
  position: absolute;
}

.card__frame h3 span {
  filter: url(#sticker);
}

.card__frame h3 span:first-of-type {
  font-size: 10cqi;
}

.card__frame h3 span:last-of-type {
  font-size: 5cqi;
}

.card__frame img {
  width: 100%;
  object-fit: cover;
  height: 100%;
  scale: 1.1;
  position: absolute;
  inset: 0;
  filter: saturate(0.8) contrast(1.2) drop-shadow(0 0 10cqi hsl(0 0% 10% / 0.75));
}

/* Sticker */
.sticker {
  position: absolute;
  width: calc(var(--border) * 2.75);
  bottom: calc(var(--border) * 0.75);
  left: calc(var(--border) * 0.65);
  z-index: 100;
}

/* Pattern and watermark */
.pattern,
.watermark {
  filter: saturate(0.8) contrast(1) brightness(1);
  mask: url(https://assets.codepen.io/605876/figma-texture.png) 50% 50% / 4cqi 4cqi;
  opacity: 0.4;
  mix-blend-mode: multiply;
}

.pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(0 0% 80%);
}

.watermark {
  filter: saturate(0.9) contrast(1.1) brightness(1.2);
  mask: url(/Stanford.svg) 50% 50% / 14cqi 14cqi repeat;
  opacity: 1;
  mix-blend-mode: hard-light;
}

.watermark::before {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(0 0% 100% / 0.2);
}

/* Refraction effects */
.refraction,
.spotlight::before {
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

.card[data-active='true']:hover .refraction,
.card[data-active='true']:hover .spotlight::before {
  opacity: 1;
}

.refraction {
  position: absolute;
  width: 500%;
  aspect-ratio: 1 / 1;
  bottom: 0;
  left: 0;
  filter: saturate(2);
  will-change: translate, scale, filter;
  background: radial-gradient(
    circle at 0 100%,
    transparent 10%,
    hsl(5 100% 80%),
    hsl(150 100% 60%),
    hsl(220 90% 70%),
    transparent 60%
  );
  transform-origin: 0 100%;
  scale: min(1, calc(0.15 + var(--pointer-x) * 0.25));
  translate: clamp(-10%, calc(-10% + var(--pointer-x) * 10%), 10%)
            calc(max(0%, var(--pointer-y) * -1 * 10%));
}

.refraction:nth-of-type(2) {
  bottom: unset;
  top: 0;
  left: unset;
  right: 0;
  scale: min(1, calc(0.15 + var(--pointer-x) * -0.65));
  translate: clamp(-10%, calc(10% - var(--pointer-x) * -10%), 10%)
            calc(min(0%, var(--pointer-y) * -10%));
  transform-origin: 100% 0;
  background: radial-gradient(
    circle at 100% 0,
    transparent 10%,
    hsl(5 100% 80%),
    hsl(150 100% 60%),
    hsl(220 90% 70%),
    transparent 60%
  );
}

/* Glare effect */
.glare {
  position: absolute;
  opacity: 0.5;
  inset: 0;
  background: linear-gradient(
    -65deg,
    transparent 0 40%,
    #fff 40% 50%,
    transparent 30% 50%,
    transparent 50% 55%,
    #fff 55% 60%,
    transparent 60% 100%
  );
  transform: translateX(100%);
  animation: glareSwipe 0.65s 0.75s ease-in-out forwards;
}

@keyframes glareSwipe {
  to {
    transform: translateX(-100%);
  }
}

/* Spotlight */
.spotlight {
  mix-blend-mode: overlay;
  z-index: 9999999;
  clip-path: inset(0 0 0 0 round var(--border));
}

.spotlight::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 500%;
  opacity: 0;
  aspect-ratio: 1;
  background: radial-gradient(
    hsl(0 0% 100% / 0.4) 0 2%,
    hsl(0 0% 10% / 0.2) 20%
  );
  filter: brightness(1.2) contrast(1.2);
  translate: calc(-50% + var(--pointer-x) * 20%)
            calc(-50% + var(--pointer-y) * 20%);
  z-index: 99999;
}

/* Wordmarks */
.wordmark {
  position: absolute;
  width: 70%;
  left: 50%;
  translate: -50% 0;
  top: 12%;
  height: max-content;
}

.wordmark::after {
  content: '™';
  position: absolute;
  top: 100%;
  right: 0;
  color: #fff;
}

.wordmark:last-of-type {
  top: unset;
  bottom: 12%;
  rotate: 180deg;
}

.wordmark img {
  position: static;
  width: 100%;
  height: auto;
}

/* Gemstone */
.gemstone {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: auto;
  translate: -50% -50%;
  filter: hue-rotate(320deg);
}

/* Initial animations */
.glare,
.sticker,
.card h3,
.card__front img,
.watermark {
  opacity: 0;
}

[data-active='true'] .watermark {
  animation: fadeIn 0.5s 1.4s forwards;
}

[data-active='true'] .card__front img {
  animation: fadeIn 0.5s 1.4s forwards;
  opacity: 1;
}

[data-active='true'] .sticker {
  animation: fadeIn 0.5s 1.9s forwards;
}

[data-active='true'] .card h3 {
  animation: fadeIn 0.5s 2.2s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
`;

export default HolographicCard;