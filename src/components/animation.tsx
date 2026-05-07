import * as React from "react";
// Hapus import 'framer' karena itu penyebab error di Next.js
import { motion, useInView } from "framer-motion";

type Img = { src: string; alt?: string };
type TiltMode = "none" | "mouse";
type DragMode = "none" | "drag";

interface Carousel3DProps {
  images?: Img[]; // Tambahkan tanda tanya agar opsional
  radius?: number;
  perspective?: number;
  itemWidth?: number;
  itemHeight?: number;
  itemRadius?: number;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: string;
  gap?: number;
  initialIndex?: number;
  dragMode?: DragMode;
  dragSensitivity?: number;
  momentum?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  pauseOnHover?: boolean;
  pauseWhenOutOfView?: boolean;
  tiltMode?: TiltMode;
  tiltStrength?: number;
  showReflection?: boolean;
  reflectionOpacity?: number;
  reflectionBlur?: number;
  reflectionDistance?: number;
  showDots?: boolean;
  dotsColor?: string;
  activeDotColor?: string;
  dotsSize?: number;
  dotsGap?: number;
  dotsBottom?: number;
  style?: React.CSSProperties;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function Carousel3D(props: Carousel3DProps) {
  // Memberikan nilai default langsung di destructuring agar aman
  const {
    images = [
      {
        src: "https://i.pinimg.com/1200x/46/8a/a9/468aa912fb2fe6a53912ba03574433b3.jpg",
        alt: "Green",
      },
      {
        src: "https://i.pinimg.com/736x/90/24/88/902488550ac3b411edefed84be44334e.jpg",
        alt: "Yellow",
      },
      {
        src: "https://i.pinimg.com/1200x/07/09/53/07095375f852ad55fb5c2cecc98bcfa5.jpg",
        alt: "Orange",
      },
      {
        src: "https://i.pinimg.com/736x/1d/ed/b5/1dedb53ff03f44837121c2dd8905b73a.jpg",
        alt: "Purple",
      },
      {
        src: "https://i.pinimg.com/736x/0c/41/10/0c4110a7e36513af31c89e7b6a43a9c7.jpg",
        alt: "Blue",
      },
    ],
    radius = 260,
    perspective = 900,
    itemWidth = 360,
    itemHeight = 240,
    itemRadius = 18,
    background = "transparent",
    borderColor = "#EEEEEE",
    borderWidth = 1,
    shadow = "0 18px 60px rgba(0,0,0,0.18)",
    gap = 0,
    initialIndex = 0,
    dragMode = "drag",
    dragSensitivity = 0.22,
    momentum = 0.92,
    autoRotate = true,
    autoRotateSpeed = 10,
    pauseOnHover = true,
    pauseWhenOutOfView = true,
    tiltMode = "mouse",
    tiltStrength = 10,
    showReflection = false,
    reflectionOpacity = 0.22,
    reflectionBlur = 1,
    reflectionDistance = 8,
    showDots = true,
    dotsColor = "#CCCCCC",
    activeDotColor = "#000000",
    dotsSize = 8,
    dotsGap = 8,
    dotsBottom = 14,
    style,
  } = props;

  // Ganti useIsStaticRenderer() menjadi false agar animasi jalan
  const isStatic = false;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, {
    margin: "120px 0px 120px 0px",
    amount: 0.2,
  });

  const count = Math.max(1, images.length);
  const stepDeg = 360 / count;

  const initialRotation = React.useMemo(() => {
    const idx = clamp(Math.round(initialIndex), 0, Math.max(0, count - 1));
    return -idx * stepDeg;
  }, [initialIndex, count, stepDeg]);

  const [rotationDeg, setRotationDeg] = React.useState<number>(initialRotation);
  const [isHover, setIsHover] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStateRef = React.useRef({
    startX: 0,
    startRotation: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
  });

  React.useEffect(() => {
    setRotationDeg(initialRotation);
  }, [initialRotation]);

  const pausedByVisibility = pauseWhenOutOfView && !inView;
  const pausedByHover = pauseOnHover && isHover;
  const paused = isStatic || pausedByVisibility || pausedByHover || isDragging;

  React.useEffect(() => {
    if (!autoRotate || paused) return;
    if (typeof window === "undefined") return;

    let raf = 0;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      const deltaDeg = (autoRotateSpeed * dt) / 1000;
      setRotationDeg((r) => r + deltaDeg);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [autoRotate, autoRotateSpeed, paused]);

  React.useEffect(() => {
    if (dragMode !== "drag") return;
    if (!isDragging) return;
    if (typeof window === "undefined") return;

    const onMove = (e: PointerEvent) => {
      const s = dragStateRef.current;
      const dx = e.clientX - s.startX;
      const nextRotation = s.startRotation + dx * dragSensitivity;
      const now = performance.now();
      const dt = Math.max(1, now - s.lastT);
      const instV = ((e.clientX - s.lastX) * dragSensitivity) / dt;
      s.v = instV * 0.9 + s.v * 0.1;
      s.lastX = e.clientX;
      s.lastT = now;
      setRotationDeg(nextRotation);
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, dragMode, dragSensitivity]);

  React.useEffect(() => {
    if (dragMode !== "drag" || isDragging) return;
    if (typeof window === "undefined") return;

    const v0 = dragStateRef.current.v;
    if (Math.abs(v0) < 0.0008) return;

    let raf = 0;
    let last = performance.now();
    let v = v0;

    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      v *= Math.pow(momentum, dt / 16.67);
      const delta = v * dt;
      setRotationDeg((r) => r + delta);
      if (Math.abs(v) > 0.0005) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isDragging, dragMode, momentum]);

  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  const onMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (tiltMode !== "mouse" || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      setTilt({
        rx: clamp(-ny, -1, 1) * tiltStrength,
        ry: clamp(nx, -1, 1) * tiltStrength,
      });
    },
    [tiltMode, tiltStrength]
  );

  const onMouseLeave = React.useCallback(() => {
    setIsHover(false);
    if (tiltMode === "mouse") setTilt({ rx: 0, ry: 0 });
  }, [tiltMode]);

  const onMouseEnter = React.useCallback(() => setIsHover(true), []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragMode !== "drag") return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const s = dragStateRef.current;
      s.startX = e.clientX;
      s.startRotation = rotationDeg;
      s.lastX = e.clientX;
      s.lastT = performance.now();
      s.v = 0;
      setIsDragging(true);
    },
    [dragMode, rotationDeg]
  );

  const activeIndex = React.useMemo(
    () => mod(Math.round(-rotationDeg / stepDeg), count),
    [rotationDeg, stepDeg, count]
  );

  const setActive = (idx: number) => setRotationDeg(-idx * stepDeg);

  const effectiveRadius = Math.max(20, radius + gap);
  const stageTransform = `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateY(${rotationDeg}deg)`;

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        touchAction: dragMode === "drag" ? "none" : "auto",
        userSelect: "none",
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          perspective: `${Math.max(200, perspective)}px`,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          style={{
            position: "relative",
            width: `${itemWidth}px`,
            height: `${itemHeight}px`,
            transformStyle: "preserve-3d",
            transform: stageTransform,
          }}
        >
          {images.map((img, i) => {
            const angle = i * stepDeg;
            const faceTransform = `rotateY(${angle}deg) translateZ(${effectiveRadius}px)`;
            const isActive = i === activeIndex;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: faceTransform,
                  transformStyle: "preserve-3d",
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: `${itemWidth}px`,
                    height: `${itemHeight}px`,
                    borderRadius: `${itemRadius}px`,
                    overflow: "hidden",
                    border: `${borderWidth}px solid ${borderColor}`,
                    boxShadow: shadow,
                    transform: `translateZ(${isActive ? 2 : 0}px) scale(${
                      isActive ? 1 : 0.96
                    })`,
                    transition: "transform 220ms ease",
                    background: "#000",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    draggable={false}
                  />
                  {showReflection && (
                    <div
                      style={{
                        position: "absolute",
                        top: `calc(100% + ${reflectionDistance}px)`,
                        height: "70%",
                        width: "100%",
                        transform: "scaleY(-1)",
                        opacity: reflectionOpacity,
                        filter: `blur(${reflectionBlur}px)`,
                        maskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                      }}
                    >
                      <img
                        src={img.src}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {showDots && count > 1 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: dotsBottom,
            display: "flex",
            justifyContent: "center",
            gap: dotsGap,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: dotsSize,
                height: dotsSize,
                borderRadius: "50%",
                border: "none",
                background: i === activeIndex ? activeDotColor : dotsColor,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
