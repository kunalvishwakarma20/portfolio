'use client';
import { useEffect } from 'react';
import { fluidCursor } from '../../hooks/use-FluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    fluidCursor();
  }, []);

  return (
    <canvas
      id="fluid"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        isolation: 'isolate',
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    />
  );
};

export default FluidCursor;