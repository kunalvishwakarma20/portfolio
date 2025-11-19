import { motion } from "framer-motion";
import { mySocials } from "../constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20">
      {/* Top Border */}
      <div className="mb-8 bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />
      
      <div className="c-space pb-8">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-0">
          {/* Social Icons - Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-4"
          >
            {mySocials.map((social, index) => (
              <a
                href={social.href}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label={social.name}
              >
                <img
                  src={social.icon}
                  className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                  alt={social.name}
                />
              </a>
            ))}
          </motion.div>

          {/* Copyright - Right Side */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-neutral-400 text-sm text-center md:text-right"
          >
            © {currentYear} Kunal Vishwakarma. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
