import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { gsap } from "gsap";
import Card from "../components/ui/Card";
import { Globe } from "../components/ui/globe";
import CopyEmailButton from "../components/ui/CopyEmailButton";
import { Frameworks } from "../components/ui/Frameworks";


// MagicBento helper functions
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_PARTICLE_COUNT = 8;
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'magic-particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

// Global Spotlight Component
const GlobalSpotlight = ({ gridRef, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (!gridRef?.current || !enabled) return;
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.magic-bento-card');
      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }
      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;
      cards.forEach(card => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });
      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });
      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;
      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };
    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, enabled, spotlightRadius, glowColor]);

  return null;
};

// Hook to add MagicBento effects to a card
const useMagicBentoCard = ({
  enableStars = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current || isMobile) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor, isMobile]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || isMobile || !enableStars) return;
    if (!particlesInitialized.current) {
      initializeParticles();
    }
    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles, enableStars, isMobile]);

  useEffect(() => {
    if (!cardRef.current || isMobile) return;
    const element = cardRef.current;
    
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      if (enableStars) animateParticles();
      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      if (enableStars) clearAllParticles();
      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if ((!enableTilt && !enableMagnetism) || isMobile) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
      
      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = e => {
      if (!clickEffect || isMobile) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, enableTilt, enableMagnetism, clickEffect, glowColor, enableStars, isMobile]);

  return cardRef;
};

const About = () => {
  const gridRef = useRef();
  const isInView = useInView(gridRef, { once: true, margin: "-100px" });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const floatingCards = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Contact Card 3D Effects
  const ContactCard = () => {
    const cardRef = useRef(null);
    const magicBentoRef = useMagicBentoCard({ enableStars: true, enableTilt: false, enableMagnetism: false, clickEffect: true });
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);
    const boxShadow = useTransform(
      y,
      [-100, 100],
      [
        "0 10px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)",
        "rgba(0, 0, 0, 0.4) 0px 0px 32px 16px"
      ]
    );

    const handleMouseMove = (e) => {
      const rect = cardRef.current.getBoundingClientRect();
      x.set(e.clientX - rect.left - rect.width / 2);
      y.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div 
        ref={(el) => {
          cardRef.current = el;
          magicBentoRef.current = el;
        }}
        className="magic-bento-card magic-bento-card--border-glow relative col-span-2 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-pink-900/50 to-rose-900/50 border border-white/10 overflow-hidden flex flex-col items-center justify-center"
        variants={item}
        style={{
          transformStyle: "preserve-3d",
          perspective: "100000px",
          rotateX,
          rotateY,
          boxShadow,
          z: 0
        }}
        whileHover={{
          scale: 1.03,
          z: 20,
          transition: { 
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }
        }}
        whileTap={{ 
          scale: 0.98,
          z: 10
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center"
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          <motion.p 
            className="text-2xl font-bold text-center text-white md:text-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            whileHover={{
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
              transition: { duration: 0.3 }
            }}
          >
            Want to start a project together?
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-6"
            whileHover={{ 
              scale: 1.08,
              transition: { 
                type: "spring",
                stiffness: 400,
                damping: 10
              } 
            }}
          >
            <CopyEmailButton />
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            background: useTransform(
              [x, y],
              ([x, y]) => `radial-gradient(circle at ${50 + x/10}% ${50 + y/10}%, rgba(255,255,255,0.8) 0%, transparent 70%)`,
            ),
            mixBlendMode: "overlay",
            opacity: useTransform(y, [-100, 100], [0.1, 0.4]),
            filter: "blur(10px)"
          }}
        />

        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent"
          whileHover={{
            borderColor: "rgba(255,255,255,0.2)",
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)",
            transition: { duration: 0.4 }
          }}
        />
      </motion.div>
    );
  };

  // MagicBento refs for each card
  const profileCardRef = useMagicBentoCard({ enableStars: true, enableTilt: true, enableMagnetism: true, clickEffect: true });
  const floatingCardRef = useMagicBentoCard({ enableStars: true, enableTilt: true, enableMagnetism: true, clickEffect: true });
  const globeCardRef = useMagicBentoCard({ enableStars: true, enableTilt: true, enableMagnetism: true, clickEffect: true });
  const techStackCardRef = useMagicBentoCard({ enableStars: true, enableTilt: true, enableMagnetism: true, clickEffect: true });

  return (
    <section className="c-space section-spacing" id="about" ref={gridRef}>
      <GlobalSpotlight gridRef={gridRef} enabled={true} spotlightRadius={300} glowColor={DEFAULT_GLOW_COLOR} />
      <style>
        {`
          .magic-bento-card {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            position: relative;
          }
          
          .magic-bento-card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 4px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .magic-bento-card--border-glow:hover::after {
            opacity: 1;
          }
          
          .magic-bento-card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(46, 24, 78, 0.4), 0 0 30px rgba(${DEFAULT_GLOW_COLOR}, 0.2);
          }
        `}
      </style>
      <motion.h2 
        className="text-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        About Me
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12"
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
      >
        {/* Grid 1 - Profile Card */}
        <motion.div 
          ref={profileCardRef}
          className="magic-bento-card magic-bento-card--border-glow relative col-span-3 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 overflow-hidden"
          variants={item}
        >
          <motion.img
            src="assets/coding-pov.png"
            className="absolute scale-[1.75] -right-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 0.8, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <div className="relative z-10">
            <motion.p 
              className="text-3xl font-bold text-white md:text-4xl"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              Hi, I&apos;m Kunal Vishwakarma
            </motion.p>
            <motion.p 
              className="mt-4 text-lg text-white/80 md:text-xl max-w-[80%]"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              From fluid UIs to scalable backend systems, I craft web experiences that are both visually striking and technically reliable — powered by tools like React, GSAP, MongoDB, and more.
            </motion.p>
          </div>
          <div className="absolute inset-x-0 pointer-events-none -bottom-4 h-1/2 sm:h-1/3 bg-gradient-to-t from-indigo-900 to-transparent" />
        </motion.div>

        {/* Grid 2 - Floating Cards */}
        <motion.div 
          ref={floatingCardRef}
          className="magic-bento-card magic-bento-card--border-glow relative col-span-3 row-span-2 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 overflow-hidden"
          variants={item}
        >
          <motion.div
            className="flex items-center justify-center w-full h-full"
            variants={floatingCards}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
          >
            <motion.p 
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-600"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              CODE IS CRAFT
            </motion.p>
            
            <AnimatePresence>
              {isInView && (
                <>
                  <Card
                    style={{ rotate: "75deg", top: "30%", left: "20%" }}
                    text="GSAP"
                    animationDelay={0.5}
                  />
                  <Card
                    style={{ rotate: "-30deg", top: "60%", left: "45%" }}
                    text="SOLID"
                    animationDelay={0.7}
                  />
                  <Card
                    style={{ rotate: "90deg", bottom: "30%", left: "70%" }}
                    text="Design Patterns"
                    animationDelay={0.9}
                  />
                  <Card
                    style={{ rotate: "-45deg", top: "55%", left: "0%" }}
                    text="Design Principles"
                    animationDelay={1.1}
                  />
                  <Card
                    style={{ rotate: "20deg", top: "10%", left: "38%" }}
                    text="UI/UX"
                    animationDelay={1.3}
                  />
                  <Card
                    style={{ rotate: "30deg", top: "70%", left: "70%" }}
                    image="assets/logos/gsap-greensock.svg"
                    animationDelay={1.5}
                  />
                  <Card
                    style={{ rotate: "-45deg", top: "70%", left: "25%" }}
                    image="assets/logos/python.svg"
                    animationDelay={1.7}
                  />
                  <Card
                    style={{ rotate: "-45deg", top: "5%", left: "10%" }}
                    image="assets/logos/git.svg"
                    animationDelay={1.9}
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Grid 3 - Globe */}
        <motion.div 
          ref={globeCardRef}
          className="magic-bento-card magic-bento-card--border-glow relative col-span-3 row-span-1 p-6 rounded-2xl bg-black/80 border border-white/10 overflow-hidden"
          variants={item}
        >
          <div className="relative z-10">
            <motion.p 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              Time Zone
            </motion.p>
            <motion.p 
              className="-mt-2 text-white/80"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              I&apos;m based in India, and open to remote work worldwide
            </motion.p>
          </div>
          <motion.figure 
            className="absolute left-[30%] top-[10%] w-[60%] h-[80%]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <Globe />
          </motion.figure>
        </motion.div>

        {/* Grid 4 - Contact */}
        <ContactCard />

        {/* Grid 5 - Tech Stack */}
        <motion.div 
          ref={techStackCardRef}
          className="magic-bento-card magic-bento-card--border-glow relative col-span-4 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 overflow-hidden"
          variants={item}
        >
          <div className="relative z-10 w-full md:w-1/2 space-y-4">
  <motion.h3
    className="text-2xl font-bold text-white bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent"
    initial={{ opacity: 0, y: 10 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ delay: 0.4 }}
  >
    Tech Stack
  </motion.h3>

  <motion.div
    className="space-y-3 text-white/80 text-sm md:text-base leading-relaxed"
    initial={{ opacity: 0 }}
    animate={isInView ? { opacity: 1 } : {}}
    transition={{ delay: 0.6 }}
  >
    <p className="flex items-start">
      <span className="shrink-0 text-blue-300 mr-2">▹</span>
      <span>
        <strong className="text-white">Full-Stack Development:</strong> Modern web technologies for scalable, high-performance applications
      </span>
    </p>
    
    <p className="flex items-start">
      <span className="shrink-0 text-blue-300 mr-2">▹</span>
      <span>
        <strong className="text-white">UI/UX Focus:</strong> Responsive design and seamless user experiences
      </span>
    </p>
    
    <p className="flex items-start">
      <span className="shrink-0 text-blue-300 mr-2">▹</span>
      <span>
        <strong className="text-white">Clean Architecture:</strong> Performance optimization and maintainable code
      </span>
    </p>
  </motion.div>
</div>
          <motion.div 
            className="absolute inset-y-0 md:inset-y-9 w-full h-full start-[50%] md:scale-125"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8 }}
          >
            <Frameworks />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;