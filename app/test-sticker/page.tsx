'use client'
import React, { useEffect, useRef, useState } from "react";

const HolographicCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [showGlare, setShowGlare] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [animate, setAnimate] = useState(true);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const minimapRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    // Initial animation sequence - matches GSAP timeline
    const animationSteps = [
      { delay: 750, action: () => {} }, // Initial delay 0.5s + 0.25s
      { delay: 650, action: () => {} }, // Glare animation duration
      { delay: 500, action: () => {} }, // Watermark & img fade in
      { delay: 500, action: () => {} }, // Sticker fade in
      { delay: 300, action: () => {} }, // h3 fade in
      { delay: 800, action: () => {} }, // Signature drawing
      { delay: 100, action: () => {} }, // Ear drawing
      { delay: 100, action: () => {} }, // Eye drawing
      { delay: 100, action: () => {} }, // Nose drawing
      { delay: 200, action: () => {} }, // Fill animation
    ];

    let totalDelay = 0;
    animationSteps.forEach((step) => {
      totalDelay += step.delay;
    });

    // Complete animation after calculated delay
    const timer = setTimeout(() => {
      setShowGlare(false);
      setIsActive(true);
    }, totalDelay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isActive && !isExploded) return;

      const element = isExploded ? minimapRef.current : cardRef.current;
      const bounds = element?.getBoundingClientRect();

      if (!bounds) return;

      const posX = e.clientX - bounds.x;
      const posY = e.clientY - bounds.y;
      const ratioX = posX / bounds.width - 0.5;
      const ratioY = posY / bounds.height - 0.5;
      const pointerX = Math.max(-1, Math.min(1, ratioX * 2));
      const pointerY = Math.max(-1, Math.min(1, ratioY * 2));

      setPointerPos({ x: pointerX.toFixed(2), y: pointerY.toFixed(2) });

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
  }, [isActive, isExploded]);

  const handleFlip = () => {
    if (!isActive || isExploded) return;
    setIsFlipped(!isFlipped);
  };

  const toggleExplode = () => {
    setIsExploded(!isExploded);
  };

  const toggleTheme = () => {
    const themes = ["system", "light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Apply animate state
  useEffect(() => {
    document.documentElement.dataset.animate = animate;
  }, [animate]);

  // Apply explode state
  useEffect(() => {
    document.documentElement.dataset.explode = isExploded;
  }, [isExploded]);

  return (
    <div className="holographic-container">
      <style>{styles}</style>

      {/* Controls Panel */}
      <div className="controls">
        <button onClick={toggleExplode} className="control-btn">
          {isExploded ? "📦 Collapse" : "💥 Explode"}
        </button>
        <button onClick={() => setAnimate(!animate)} className="control-btn">
          {animate ? "⏸️ Pause" : "▶️ Animate"}
        </button>
        <button onClick={toggleTheme} className="control-btn">
          🎨 {theme}
        </button>
      </div>

      {/* Minimap (visible when exploded) */}
      <div
        className="minimap"
        ref={minimapRef}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <div className="minimap__stats">
          <span>x: {pointerPos.x}</span>
          <span>y: {pointerPos.y}</span>
        </div>
      </div>

      {/* Main scene */}
      <div className="scene" ref={sceneRef}>
        {/* Arrow indicator */}
        <span className="arrow arrow--debug">
          <span>:hover, tap, drag</span>
          <svg
            viewBox="0 0 122 97"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M116.102 0.0996005C114.952 0.334095 112.7 1.53002 111.433 2.53834C110.869 2.98388 109.368 4.15635 108.077 5.11778C103.455 8.6352 102.61 9.40903 102.187 10.4877C101.39 12.5982 102.798 14.5914 105.097 14.5914C106.13 14.5914 108.241 13.7941 109.696 12.8561C110.424 12.3871 111.01 12.0823 111.01 12.1526C111.01 12.692 107.796 17.8274 106.2 19.8206C102.023 25.0733 95.6642 29.6928 86.2548 34.2889C81.0926 36.8214 77.4555 38.2753 73.9123 39.2367C71.7066 39.823 70.6507 39.9871 67.9053 40.0809C66.0516 40.1513 64.5499 40.1747 64.5499 40.1278C64.5499 40.0809 64.808 38.9788 65.1365 37.6891C65.465 36.3993 65.8404 34.1716 66.0047 32.7647C66.4505 28.3796 65.4884 24.2994 63.4704 22.2359C62.1564 20.8758 60.9363 20.3599 59.0121 20.3599C57.6043 20.3599 57.1115 20.4537 55.7975 21.1103C52.8878 22.5407 50.5648 25.9878 49.5089 30.4197C48.453 34.922 49.2742 38.0877 52.3481 41.1127C53.4744 42.2148 54.46 42.9183 55.9852 43.6921C57.1584 44.2549 58.1439 44.7473 58.1909 44.7708C58.5898 45.0053 54.5304 53.4705 52.0666 57.6211C47.4674 65.3125 39.3486 74.575 30.5728 82.0789C22.2427 89.2309 16.7285 92.4435 9.87677 94.1553C8.28116 94.554 7.13138 94.6478 4.2452 94.6478C1.17131 94.6712 0.608154 94.7181 0.608154 95.023C0.608154 95.234 1.19478 95.5857 2.13337 95.9609C3.54126 96.4768 3.96363 96.5472 7.41296 96.5237C10.5572 96.5237 11.4724 96.4299 13.1149 96.0078C21.7265 93.6863 31.1594 87.1908 42.6102 75.7006C49.2977 69.0175 52.5828 64.9373 56.1494 58.9343C58.0501 55.7217 60.6312 50.6801 61.7575 47.9365L62.5553 45.9902L64.0806 46.1543C71.3547 46.9047 77.7136 45.3101 88.3667 40.034C96.2274 36.1414 101.976 32.3426 106.505 28.0748C108.617 26.0816 111.855 22.2828 112.794 20.7117C113.028 20.313 113.286 19.9847 113.357 19.9847C113.427 19.9847 113.662 20.782 113.873 21.72C114.084 22.6814 114.647 24.276 115.093 25.2609C115.82 26.8085 116.008 27.043 116.454 26.9727C116.876 26.9258 117.228 26.4333 117.956 24.9795C119.317 22.2828 119.833 20.2661 120.772 13.8879C121.757 7.25168 121.781 4.4143 120.889 2.56179C119.95 0.615488 118.12 -0.322489 116.102 0.0996005ZM60.7016 25.7767C61.4525 26.9023 61.8279 29.2942 61.6637 31.9205C61.4759 34.7813 60.5139 38.9788 60.0681 38.9788C59.5284 38.9788 57.1584 37.6422 56.2198 36.8214C54.8354 35.6021 54.3426 34.2889 54.5538 32.2957C54.8589 29.2473 56.1964 26.2223 57.5808 25.3547C58.7306 24.6512 60.0681 24.8388 60.7016 25.7767Z"
              fill="currentColor"
            />
          </svg>
        </span>

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

            {/* Card front (main side) - 完整的层级结构 */}
            <div className="card__front">
              {/* Layer 1: Base image */}
              <div className="img">
                <img
                  src="/Smoke.jpeg"
                  alt=""
                />
              </div>

              {/* Layer 2: Debug layer (first) */}
              <div className="debug">
                <div className="refraction refraction--debug"></div>
                <div className="refraction refraction--debug"></div>
              </div>

              {/* Layer 3: Debug clipped layer */}
              <div className="debug debug--clipped">
                <div className="refraction refraction--debug"></div>
                <div className="refraction refraction--debug"></div>
              </div>

              {/* Layer 4: Pattern holographic effect - 注意原始代码中这是一个独立层 */}
              <div className="pattern">
                <div className="refraction"></div>
                <div className="refraction"></div>
              </div>

              {/* Layer 5: Watermark effect - 另一个独立的全息层 */}
              <div className="watermark">
                <div className="refraction"></div>
                <div className="refraction"></div>
              </div>

              {/* Layer 6: Card frame with all content */}
              <div className="card__frame card__emboss">
                <h3>
                  <span>Jhey Tompkins</span>
                  <br />
                  <span>Staff Design Engineer</span>
                </h3>
                {/* <svg
                  className="signature"
                  viewBox="0 0 271 209"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="sig"
                    d="M40.3725 26.8984C58.6558 41.1564 141.659 43.1867 128.248 5.48254C127.911 4.53766 127.085 2.2403 125.938 2.0095C124.714 1.76297 121.929 6.39448 121.627 6.82375C100.965 36.1863 95.2641 73.5992 74.5923 102.644C63.7045 117.942 14.7891 145.678 5.55986 113.481C-17.5939 32.705 78.7483 76.0672 105.741 67.4678C119.757 63.0021 125.297 50.6825 132.831 39.1622C135.218 35.5126 137.628 24.6153 140.043 28.2467C144.771 35.3581 119.642 69.8761 115.559 78.4692C110.959 88.1482 129.228 46.7461 136.796 54.3333C146.229 63.7897 128.236 82.7359 153.367 61.6804C157.634 58.1059 166.582 46.4029 161.033 46.8455C153.977 47.4085 141.565 67.0198 151.685 70.0327C161.531 72.9635 176.039 38.7196 174.012 48.7901C173.009 53.769 168.343 67.3695 175.978 68.9069C186.537 71.0328 191.574 35.8659 197.537 44.8359C240.356 109.24 81.7126 283.324 50.2184 167.261C25.2159 75.1229 240.563 89.2082 268.88 137.08"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{ "--path-speed": "0.831875" }}
                  />
                  <path
                    className="ear"
                    d="M187.183 101.246C182.107 82.5407 155.739 77.9455 151.5 99"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      "--path-speed": "0.031875",
                      "--path-delay": "0.831875",
                    }}
                  />
                  <path
                    className="ear"
                    d="M117.998 100.704C117.998 91.1516 103.912 87.3662 96.5585 89.3717C84.7816 92.5836 80.6315 99.053 80.6315 110.505"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      "--path-speed": "0.035625",
                      "--path-delay": "0.86375",
                    }}
                  />
                  <path
                    className="eye"
                    d="M170.025 108.347C168.627 105.551 162.781 110.631 165.494 114.577C168.207 118.523 173.936 114.091 171.643 109.965C171.035 108.871 168.547 107.832 167.355 108.428"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      "--path-speed": "0.0175",
                      "--path-delay": "0.899375",
                    }}
                  />
                  <path
                    className="eye"
                    d="M102.952 112.797C97.2672 112.797 96.7371 120.527 102.224 119.917C108.363 119.235 105.409 110.012 100.363 113.04"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      "--path-speed": "0.01625",
                      "--path-delay": "0.916875",
                    }}
                  />
                  <path
                    className="nose"
                    d="M144.745 123.82C146.652 122.562 141.479 121.621 140.561 121.402C136.485 120.429 124.736 118.793 124.42 125.721C123.695 141.628 160.767 131.457 140.492 121.735"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      "--path-speed": "0.04",
                      "--path-delay": "0.933125",
                    }}
                  />
                </svg> */}
                <div className="sticker">
                  <img src="/Stanford.svg" alt="Stanford" />
                </div>
                <img
                  src="/Smoke-transparent.png"
                  alt=""
                />
              </div>

              {/* Layer 7: Spotlight effect - 包含::before和::after伪元素 */}
              <div className="spotlight"></div>

              {/* Layer 8: Glare container - 最顶层的光泽效果 */}
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
@import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

/* Root variables and theme */
:root {
  --font-size-min: 16;
  --font-size-max: 20;
  --font-ratio-min: 1.2;
  --font-ratio-max: 1.33;
  --font-width-min: 375;
  --font-width-max: 1500;
  --border-color: hsl(0 0% 25%);
  --card-width: 260px;
  --pointer-x: 0;
  --pointer-y: 0;
  --parallax-img-x: 5%;
  --parallax-img-y: 5%;
  --rotate-x: 25deg;
  --rotate-y: -20deg;
}

html {
  color-scheme: light dark;
}

[data-theme='light'] {
  color-scheme: light only;
}

[data-theme='dark'] {
  color-scheme: dark only;
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

.controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 999999;
  display: flex;
  gap: 0.5rem;
  transform: translate3d(0, 0, 200vmin);
}

.control-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  font-family: 'Sora', sans-serif;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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

/* Minimap */
.minimap {
  position: fixed;
  width: 60px;
  aspect-ratio: 5/7;
  background: hsl(0 0% 50%);
  top: 50%;
  left: 50%;
  translate: calc(var(--card-width) * 1) -50%;
  border-radius: 6px;
  cursor: pointer;
  border: var(--border-color) 4px solid;
  z-index: 999999;
  transform: translate3d(0, 0, 100vmin);
  pointer-events: none;
  visibility: hidden;
  transition: all 0.3s;
}

.minimap::after {
  content: 'trackpad';
  position: absolute;
  top: 50%;
  left: 100%;
  font-family: 'Sora', sans-serif;
  transform: translate(-50%, -50%) rotate(-90deg) translateY(100%);
  font-size: 0.875rem;
  pointer-events: none;
  opacity: 0.35;
}

[data-explode='true'] .minimap {
  pointer-events: all;
  visibility: visible;
}

.minimap__stats {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  opacity: 0.7;
  font-family: monospace;
  font-size: 0.75rem;
  color: white;
}

.minimap__stats span {
  white-space: nowrap;
}

/* Arrow indicator */
.arrow {
  display: inline-block;
  opacity: 0;
  position: absolute;
  font-size: 0.875rem;
  font-family: 'Gloria Hallelujah', cursive;
  transition: opacity 0.26s ease-out;
  color: white;
}

:has([data-active=true]) .arrow {
  opacity: 0.8;
}

[data-explode='true'] .arrow {
  opacity: 0;
}

.arrow.arrow--debug {
  top: 50%;
  left: 50%;
  rotate: 10deg;
  translate: calc(-40% + var(--card-width) * -1) 0;
  width: 80px;
  z-index: 99999;
}

.arrow.arrow--debug span {
  display: inline-block;
  rotate: -24deg;
  translate: 30% 100%;
}

.arrow.arrow--debug svg {
  rotate: 10deg;
  scale: 1 -1;
  translate: 120% 20%;
  rotate: -25deg;
  left: 0%;
  width: 80%;
}

@media (max-width: 580px) {
  .arrow.arrow--debug {
    translate: -50% calc(var(--card-width) * 7 / 5 * 0.5);
  }

  .arrow.arrow--debug span {
    translate: 80% 160%;
  }

  .arrow.arrow--debug svg {
    rotate: 190deg;
    top: unset;
    bottom: 100%;
    translate: 0 0;
  }
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
  --ratio-x: 0;
  --ratio-y: 0;
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

[data-explode='false'] .card[data-active='true']:hover {
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

[data-explode='false'] .card[data-active='true']:hover .card__front img,
[data-explode='true']:has(.minimap:hover) .card__front img {
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

/* Exploded view - 完整的层级分离 */
[data-explode='true'] .card {
  pointer-events: none;
  transition: transform 0.2s 0.2s;
  transform: rotateX(-24deg) rotateY(32deg) rotateX(90deg);
}

[data-explode='true'] .card .spotlight,
[data-explode='true'] .card .watermark,
[data-explode='true'] .card .pattern {
  mix-blend-mode: unset;
}

/* 所有需要分层的元素 */
[data-explode='true'] .card .watermark,
[data-explode='true'] .card .pattern,
[data-explode='true'] .card .debug,
[data-explode='true'] .card .img,
[data-explode='true'] .card .spotlight::after,
[data-explode='true'] .card .card__frame,
[data-explode='true'] .card .spotlight,
[data-explode='true'] .card .glare-container {
  transition-property: transform, opacity;
  transition-duration: 0.2s;
  transition-delay: 0.4s;
}

/* 使用CSS变量定义每层的索引，80px为层间距 */
[data-explode='true'] .card .card__front .img {
  --index: -3;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .card__front .debug:first-of-type {
  --index: -2;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
  visibility: visible;
  opacity: 0.3;
}

[data-explode='true'] .card .card__front .debug.debug--clipped {
  --index: -1.5;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
  visibility: visible;
  opacity: 0.5;
}

[data-explode='true'] .card .card__front .pattern {
  --index: -1;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .card__front .watermark {
  --index: 0;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .card__front .card__frame {
  --index: 1;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .card__front .spotlight {
  --index: 2;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .card__front .glare-container {
  --index: 3;
  transform: translate3d(0, 0, calc(var(--index) * 80px));
}

[data-explode='true'] .card .debug {
  visibility: visible;
}

[data-explode='true'] .card .debug,
[data-explode='true'] .card .spotlight::after {
  opacity: 1;
}

[data-explode='true']:has(.minimap:hover) .refraction,
[data-explode='true']:has(.minimap:hover) .spotlight::before {
  opacity: 1;
}

[data-explode='true']:has(.minimap:hover) .debug:not(.debug--clipped) .refraction {
  opacity: 0.2;
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
.debug,
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

/* Debug layers - 仅在爆炸视图中可见 */
.debug {
  opacity: 0;
  visibility: hidden;
}

.debug::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 4px dashed canvasText;
  border-radius: var(--border);
}

.debug.debug--clipped {
  clip-path: inset(0 0 0 0 round var(--border));
}

.debug.debug--clipped .refraction {
  opacity: 1;
}

.debug .refraction {
  opacity: 0.2;
}

/* 爆炸视图中debug层的特殊显示 */
[data-explode='true'] .card .debug:not(.debug--clipped) .refraction {
  opacity: 0.2;
}

[data-explode='true'] .card .debug.debug--clipped .refraction {
  opacity: 0.4;
}

/* Card faces */
.card__front,
.card__rear {
  backface-visibility: hidden;
}

.card__front > *:not(.debug:not(.debug--clipped)) {
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

/* Signature */
.signature {
  color: hsl(45 20% 60%);
  position: absolute;
  z-index: 100;
  width: 38cqi;
  bottom: calc(var(--border) * 1.1);
  right: calc(var(--border) * 0.6);
  rotate: 20deg;
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

.card[data-active='true']:hover :not(.debug) .refraction,
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

.spotlight::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  border: 4px dashed canvasText;
  border-radius: var(--border);
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
.watermark,
.arrow {
  opacity: 0;
}

.sig,
.ear,
.eye,
.nose {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

[data-active='true'] .sig {
  animation: draw 0.8s 0.75s forwards;
}

[data-active='true'] .ear {
  animation: draw 0.1s 1.55s forwards;
}

[data-active='true'] .eye {
  animation: draw 0.1s 1.65s forwards;
}

[data-active='true'] .nose {
  animation: draw 0.1s 1.75s forwards, fill 0.2s 1.85s forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fill {
  to {
    fill: hsl(45 20% 60%);
  }
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

[data-active='true'] .arrow {
  animation: fadeIn 0.5s 2.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
`;

export default HolographicCard;
