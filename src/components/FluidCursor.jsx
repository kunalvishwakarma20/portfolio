'use client';
import { useEffect } from 'react';
import useFluidCursor from '../hooks/use-FluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    const cleanup = useFluidCursor();
    return cleanup;
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
        zIndex: 9999
      }}
    />
  );
};

export default FluidCursor;