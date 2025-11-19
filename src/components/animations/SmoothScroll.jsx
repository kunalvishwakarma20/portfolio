import { useEffect } from 'react';

const SmoothScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let currentScroll = window.pageYOffset;
    let targetScroll = currentScroll;
    let isScrolling = false;
    let rafId = null;

    // Smooth scroll function using requestAnimationFrame
    const smoothScroll = () => {
      if (Math.abs(targetScroll - currentScroll) < 0.5) {
        currentScroll = targetScroll;
        isScrolling = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }

      // Easing function for smooth deceleration (premium feel)
      const ease = 0.1;
      currentScroll += (targetScroll - currentScroll) * ease;

      window.scrollTo(0, currentScroll);
      rafId = requestAnimationFrame(smoothScroll);
    };

    // Handle wheel events with momentum
    const handleWheel = (e) => {
      // Detect trackpad vs mouse wheel
      const isTrackpad = Math.abs(e.deltaY) < 50 && e.deltaMode === 0;
      
      if (isTrackpad) {
        // Allow native smooth scrolling for trackpads (they already have momentum)
        return;
      }
      
      // Only apply custom smooth scroll for mouse wheels
      e.preventDefault();
      
      // Calculate scroll delta with reduced speed for premium feel
      const delta = e.deltaY;
      const scrollSpeed = 0.5; // Slower, more premium feel
      targetScroll += delta * scrollSpeed;
      
      // Clamp scroll position
      targetScroll = Math.max(0, Math.min(targetScroll, document.documentElement.scrollHeight - window.innerHeight));

      if (!isScrolling) {
        isScrolling = true;
        rafId = requestAnimationFrame(smoothScroll);
      }
    };

    // Handle touch events for mobile
    let touchStartY = 0;
    let touchScroll = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchScroll = currentScroll;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * 1.5;
      targetScroll = touchScroll + delta;
      targetScroll = Math.max(0, Math.min(targetScroll, document.documentElement.scrollHeight - window.innerHeight));

      if (!isScrolling) {
        isScrolling = true;
        rafId = requestAnimationFrame(smoothScroll);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        e.preventDefault();
        const scrollAmount = window.innerHeight * 0.8;
        
        switch (e.key) {
          case 'ArrowDown':
          case ' ':
            targetScroll += scrollAmount * 0.3;
            break;
          case 'ArrowUp':
            targetScroll -= scrollAmount * 0.3;
            break;
          case 'PageDown':
            targetScroll += scrollAmount;
            break;
          case 'PageUp':
            targetScroll -= scrollAmount;
            break;
          case 'Home':
            targetScroll = 0;
            break;
          case 'End':
            targetScroll = document.documentElement.scrollHeight - window.innerHeight;
            break;
        }

        targetScroll = Math.max(0, Math.min(targetScroll, document.documentElement.scrollHeight - window.innerHeight));

        if (!isScrolling) {
          isScrolling = true;
          rafId = requestAnimationFrame(smoothScroll);
        }
      }
    };

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for navbar
          targetScroll = offsetTop;
          
          if (!isScrolling) {
            isScrolling = true;
            rafId = requestAnimationFrame(smoothScroll);
          }
        }
      }
    };

    // Initialize
    currentScroll = window.pageYOffset;
    targetScroll = currentScroll;

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleAnchorClick);

    // Sync on scroll (for programmatic scrolling)
    const handleScroll = () => {
      if (!isScrolling) {
        currentScroll = window.pageYOffset;
        targetScroll = currentScroll;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return null;
};

export default SmoothScroll;

