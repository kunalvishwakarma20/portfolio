import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollTweenRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // Kill any existing scroll animation
    if (scrollTweenRef.current) {
      scrollTweenRef.current.kill();
    }

    const startY = window.pageYOffset;
    
    // Use GSAP for smooth scroll animation
    scrollTweenRef.current = gsap.to({ value: startY }, {
      value: 0,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: function() {
        window.scrollTo(0, this.targets()[0].value);
      },
      onComplete: () => {
        scrollTweenRef.current = null;
      }
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-royal to-lavender hover:from-lavender hover:to-royal rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <motion.svg
            className="w-6 h-6 md:w-7 md:h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;

