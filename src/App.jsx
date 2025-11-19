import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Experiences from './sections/Experiences';
import Testimonial from './sections/Testimonial';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import FluidCursor from './components/animations/FluidCursor';
import GSAPSmoothScroll from './components/animations/GSAPSmoothScroll';
import ScrollToTop from './components/ui/ScrollToTop';

const App = () => {
  return (
    <>
      <GSAPSmoothScroll />
      <FluidCursor />
      <ScrollToTop />

      <div className="container mx-auto max-w-7xl">
        <Navbar />
        <Hero />
        <About />
        <Projects />
        <Experiences />
        <Testimonial />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default App;
