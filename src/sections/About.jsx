import { useRef } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Card from "../components/Card";
import { Globe } from "../components/globe";
import CopyEmailButton from "../components/CopyEmailButton";
import { Frameworks } from "../components/Frameworks";


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
        ref={cardRef}
        className="relative col-span-2 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-pink-900/50 to-rose-900/50 border border-white/10 overflow-hidden flex flex-col items-center justify-center"
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

  return (
    <section className="c-space section-spacing" id="about" ref={gridRef}>
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
          className="relative col-span-3 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 overflow-hidden"
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
              Hi, I'm Kunal Vishwakarma
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
          className="relative col-span-3 row-span-2 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 overflow-hidden"
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
          className="relative col-span-3 row-span-1 p-6 rounded-2xl bg-black/80 border border-white/10 overflow-hidden"
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
              I'm based in India, and open to remote work worldwide
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
          className="relative col-span-4 row-span-1 p-6 rounded-2xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 overflow-hidden"
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