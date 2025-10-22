import React, { useState, useEffect, useCallback, useRef } from 'react';

// A function to get a random number in a range
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

// Sparkle component
const Sparkle: React.FC<{ x: number; y: number; size: number; color: string }> = ({ x, y, size, color }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'fixed',
                top: y - size / 2,
                left: x - size / 2,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
            className="sparkle-anim"
        >
            <path
                d="M80 0L96.9739 63.0261L160 80L96.9739 96.9739L80 160L63.0261 96.9739L0 80L63.0261 63.0261L80 0Z"
                fill={color}
            />
        </svg>
    );
};

// Hook to manage sparkles
const useSparkles = () => {
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number; color: string; createdAt: number }[]>([]);
    const lastSparkleTime = useRef(0);
    const colors = ['#f5d0fe', '#a78bfa', '#38bdf8', '#67e8f9'];

    const addSparkle = useCallback((e: { clientX: number; clientY: number }) => {
        const now = Date.now();
        if (now - lastSparkleTime.current < 40) { // Throttle to 25fps
            return;
        }
        lastSparkleTime.current = now;
        
        const { clientX, clientY } = e;

        const newSparkle = {
            id: now,
            x: clientX,
            y: clientY,
            size: random(15, 25),
            color: colors[random(0, colors.length)],
            createdAt: now,
        };

        setSparkles(current => [...current, newSparkle]);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            addSparkle(e);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                addSparkle(e.touches[0]);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [addSparkle]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setSparkles(current => current.filter(s => now - s.createdAt < 700)); // Lifespan matches animation
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return sparkles;
};

// Main component to render
export const SparkleEffect: React.FC = () => {
    const sparkles = useSparkles();
    return (
        <>
            {sparkles.map(sparkle => (
                <Sparkle key={sparkle.id} {...sparkle} />
            ))}
        </>
    );
};
