import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

function Navigation({ isMobile, closeMenu }) {
  const linkVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.05,
      color: "#ffffff",
      transition: { duration: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: isMobile ? 0.3 : 0
      }
    }
  };

  return (
    <motion.ul 
      className={`nav-ul ${isMobile ? "flex flex-col space-y-4" : "hidden sm:flex space-x-8"}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {['home', 'about', 'work', 'contact'].map((item) => (
        <motion.li 
          key={item}
          className="nav-li"
          variants={linkVariants}
          whileHover="hover"
        >
          <a 
            className="nav-link text-neutral-400 hover:text-white transition-colors duration-300"
            href={`#${item}`}
            onClick={isMobile ? closeMenu : null}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </a>
        </motion.li>
      ))}
    </motion.ul>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: { 
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className={`fixed inset-x-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "backdrop-blur-lg bg-black/30 py-1 shadow-lg" : "backdrop-blur-sm bg-transparent py-2"
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="/"
            className="text-xl font-bold transition-colors text-neutral-400 hover:text-white"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Kunal Vishwakarma
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex">
            <Navigation isMobile={false} />
          </nav>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer text-neutral-400 hover:text-white focus:outline-none sm:hidden"
            whileTap={{ scale: 0.9 }}
          >
            <motion.img
              src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
              className="w-6 h-6"
              alt="toggle"
              key={isOpen ? "close" : "menu"}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: isOpen ? 180 : 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="block sm:hidden bg-black/80 backdrop-blur-md overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <nav className="px-2 pt-2 pb-4 space-y-2">
              <Navigation isMobile={true} closeMenu={closeMenu} />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;