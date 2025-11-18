"use client";
import { useScroll, useTransform, motion, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height], {
    clamp: false
  });
  const opacityTransform = useTransform(scrollYProgress, [0, 0.15], [0, 1], {
    clamp: true
  });

  // Calculate progress for each step
  const stepProgress = data.map((_, index) => {
    const start = index / data.length;
    const end = (index + 1) / data.length;
    return useTransform(scrollYProgress, [start, end], [0, 1]);
  });

  // Track completed steps
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      data.forEach((_, index) => {
        const stepStart = index / data.length;
        const stepEnd = (index + 1) / data.length;
        const stepProgressValue = (latest - stepStart) / (stepEnd - stepStart);
        
        if (stepProgressValue >= 0.85 && stepRefs.current[index]) {
          // Step is nearly complete, trigger subtle animation
          const stepElement = stepRefs.current[index];
          if (stepElement && !stepElement.classList.contains('step-completed')) {
            stepElement.classList.add('step-completed');
            // Remove class after animation to allow re-triggering
            setTimeout(() => {
              stepElement.classList.remove('step-completed');
            }, 800);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [scrollYProgress, data.length]);

  return (
    <div className="c-space section-spacing" ref={containerRef}>
      <style>
        {`
          .timeline-step-indicator {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .timeline-step-indicator.step-completed {
            animation: stepPulse 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          @keyframes stepPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(132, 0, 255, 0.4);
            }
            50% {
              transform: scale(1.15);
              box-shadow: 0 0 0 8px rgba(132, 0, 255, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(132, 0, 255, 0);
            }
          }
          
          .timeline-glow-line {
            box-shadow: 0 0 12px rgba(132, 0, 255, 0.3),
                        0 0 24px rgba(122, 87, 219, 0.2),
                        0 0 36px rgba(132, 0, 255, 0.1);
            filter: blur(0.5px);
          }
          
          .timeline-glow-blur {
            filter: blur(8px);
            opacity: 0.4;
          }
        `}
      </style>
      <h2 className="text-heading">My Work Experience</h2>
      <div ref={ref} className="relative pb-20">
        {data.map((item, index) => {
          const currentStepProgress = stepProgress[index];
          const stepOpacity = useTransform(
            currentStepProgress, 
            [0, 0.4], 
            [0.4, 1],
            { clamp: true }
          );
          const stepScale = useTransform(
            currentStepProgress, 
            [0, 0.6], 
            [1, 1.1],
            { clamp: true }
          );
          
          return (
            <div
              key={index}
              className="flex justify-start pt-10 md:pt-40 md:gap-10"
            >
              <div className="sticky z-40 flex flex-col items-center self-start max-w-xs md:flex-row top-40 lg:max-w-sm md:w-full">
                <motion.div 
                  ref={(el) => (stepRefs.current[index] = el)}
                  className="absolute flex items-center justify-center w-10 h-10 rounded-full -left-[15px] bg-midnight timeline-step-indicator"
                  style={{
                    opacity: stepOpacity,
                    scale: stepScale,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                >
                  <motion.div 
                    className="w-4 h-4 p-2 border-2 rounded-full bg-neutral-800 border-purple-500/60"
                    style={{
                      boxShadow: useTransform(
                        currentStepProgress,
                        [0, 1],
                        [
                          "0 0 0px rgba(132, 0, 255, 0)",
                          "0 0 8px rgba(132, 0, 255, 0.5), 0 0 16px rgba(122, 87, 219, 0.3)"
                        ],
                        { clamp: true }
                      ),
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  />
                </motion.div>
              <div className="flex-col hidden gap-2 text-xl font-bold md:flex md:pl-20 md:text-4xl text-neutral-300">
                <h3>{item.date}</h3>
                <h3 className="text-3xl text-neutral-400">{item.title}</h3>
                <h3 className="text-3xl text-neutral-500">{item.job}</h3>
              </div>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <div className="block mb-4 text-2xl font-bold text-left text-neutral-300 md:hidden ">
                <h3>{item.date}</h3>
                <h3>{item.job}</h3>
              </div>
              {item.contents.map((content, index) => (
                <p className="mb-3 font-normal text-neutral-400" key={index}>
                  {content}
                </p>
              ))}
            </div>
          </div>
          );
        })}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-1 left-1 top-0 overflow-visible w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700/50 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="timeline-glow-line absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500/90 via-purple-400/70 via-lavender/60 to-transparent from-[0%] via-[15%] rounded-full"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30
            }}
          />
          {/* Subtle glow layer */}
          <motion.div
            style={{
              height: heightTransform,
              opacity: useTransform(opacityTransform, [0, 1], [0, 0.3], { clamp: true }),
            }}
            className="timeline-glow-blur absolute inset-x-0 top-0 w-[4px] -left-1 bg-gradient-to-t from-purple-500/25 via-lavender/15 to-transparent rounded-full"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30
            }}
          />
        </div>
      </div>
    </div>
  );
};
