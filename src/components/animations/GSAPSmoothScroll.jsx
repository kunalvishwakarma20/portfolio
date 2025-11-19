import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GSAPSmoothScroll = () => {
  const scrollTweenRef = useRef(null);
  const isScrollingRef = useRef(false);
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get current scroll position
    const getScrollY = () => window.pageYOffset || window.scrollY || 0;

    // Light, flowy smooth scroll function using GSAP
    const smoothScroll = () => {
      const diff = targetScrollRef.current - currentScrollRef.current;
      
      if (Math.abs(diff) < 0.05) {
        currentScrollRef.current = targetScrollRef.current;
        window.scrollTo(0, currentScrollRef.current);
        isScrollingRef.current = false;
        
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        return;
      }

      // Light, responsive easing for flowy smooth feel
      // Higher value = more responsive, lighter feel
      const ease = 0.18; // Optimized for light, flowy scrolling
      currentScrollRef.current += diff * ease;
      
      window.scrollTo(0, currentScrollRef.current);
      
      rafIdRef.current = requestAnimationFrame(smoothScroll);
    };

    // Start smooth scroll animation immediately
    const startSmoothScroll = () => {
      currentScrollRef.current = getScrollY();
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        rafIdRef.current = requestAnimationFrame(smoothScroll);
      }
    };

    // Handle wheel events with light, flowy momentum
    const handleWheel = (e) => {
      // Detect trackpad vs mouse wheel
      const isTrackpad = Math.abs(e.deltaY) < 50 && e.deltaMode === 0;
      
      e.preventDefault();
      
      const delta = e.deltaY;
      // Higher speed for more responsive, lighter feel
      const scrollSpeed = isTrackpad ? 0.95 : 0.85; // Light, flowy speed
      
      targetScrollRef.current += delta * scrollSpeed;
      targetScrollRef.current = Math.max(
        0,
        Math.min(targetScrollRef.current, document.documentElement.scrollHeight - window.innerHeight)
      );

      // Start immediately for flowy, responsive feel
      startSmoothScroll();
    };

    // Handle touch events for mobile (premium momentum)
    let touchStartY = 0;
    let touchStartScroll = 0;
    let touchVelocity = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchMomentumTimeout;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartScroll = getScrollY();
      lastTouchY = touchStartY;
      lastTouchTime = Date.now();
      touchVelocity = 0;
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isScrollingRef.current = false;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * 1.3;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTouchTime;
      
      if (timeDelta > 0) {
        touchVelocity = (lastTouchY - touchY) / timeDelta;
      }
      
      lastTouchY = touchY;
      lastTouchTime = currentTime;
      
      targetScrollRef.current = touchStartScroll + delta;
      targetScrollRef.current = Math.max(
        0,
        Math.min(targetScrollRef.current, document.documentElement.scrollHeight - window.innerHeight)
      );
      
      window.scrollTo(0, targetScrollRef.current);
      currentScrollRef.current = targetScrollRef.current;
    };

    const handleTouchEnd = () => {
      // Apply light momentum based on velocity for flowy feel
      const momentum = touchVelocity * 250;
      targetScrollRef.current += momentum;
      targetScrollRef.current = Math.max(
        0,
        Math.min(targetScrollRef.current, document.documentElement.scrollHeight - window.innerHeight)
      );
      
      startSmoothScroll();
    };

    // Handle keyboard navigation with premium easing
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        e.preventDefault();
        const scrollAmount = window.innerHeight * 0.8;
        const currentY = getScrollY();
        
        switch (e.key) {
          case 'ArrowDown':
          case ' ':
            targetScrollRef.current = currentY + scrollAmount * 0.35;
            break;
          case 'ArrowUp':
            targetScrollRef.current = currentY - scrollAmount * 0.35;
            break;
          case 'PageDown':
            targetScrollRef.current = currentY + scrollAmount;
            break;
          case 'PageUp':
            targetScrollRef.current = currentY - scrollAmount;
            break;
          case 'Home':
            targetScrollRef.current = 0;
            break;
          case 'End':
            targetScrollRef.current = document.documentElement.scrollHeight - window.innerHeight;
            break;
        }

        targetScrollRef.current = Math.max(
          0,
          Math.min(targetScrollRef.current, document.documentElement.scrollHeight - window.innerHeight)
        );
        
        startSmoothScroll();
      }
    };

    // Premium smooth scroll for anchor links using GSAP timeline
    const handleAnchorClick = (e) => {
      // Check if clicked element or its parent is an anchor link
      let anchor = e.target.closest('a[href^="#"]');
      
      // Also check if the target itself is an anchor
      if (!anchor && e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        anchor = e.target;
      }
      
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for navbar
          targetScrollRef.current = offsetTop;
          
          // Use GSAP for premium anchor link scrolling
          if (scrollTweenRef.current) {
            scrollTweenRef.current.kill();
          }
          
          const startY = getScrollY();
          const distance = Math.abs(offsetTop - startY);
          const duration = Math.min(1.2, Math.max(0.4, distance / 1200)); // Faster, lighter duration
          
          scrollTweenRef.current = gsap.to({ value: startY }, {
            value: offsetTop,
            duration: duration,
            ease: 'power2.out', // Lighter, flowier easing
            onUpdate: function() {
              window.scrollTo(0, this.targets()[0].value);
              currentScrollRef.current = this.targets()[0].value;
            },
            onComplete: () => {
              targetScrollRef.current = offsetTop;
              currentScrollRef.current = offsetTop;
              isScrollingRef.current = false;
            }
          });
          
          isScrollingRef.current = true;
        }
      }
    };

    // Initialize
    currentScrollRef.current = getScrollY();
    targetScrollRef.current = currentScrollRef.current;

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleAnchorClick, true);

    // Sync scroll position for programmatic scrolling
    const handleScroll = () => {
      if (!isScrollingRef.current) {
        const scrollY = getScrollY();
        currentScrollRef.current = scrollY;
        targetScrollRef.current = scrollY;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      clearTimeout(touchMomentumTimeout);
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      if (scrollTweenRef.current) {
        scrollTweenRef.current.kill();
      }
      
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, []);

  return null;
};

export default GSAPSmoothScroll;
