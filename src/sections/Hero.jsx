import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Suspense, useMemo, useRef, useEffect } from "react";
import { MathUtils, Vector3, Color } from "three";
import { Environment } from "@react-three/drei";
import HeroText from "../components/HeroText";
import Loader from "../components/ui/Loader";

// Vertex Shader
const vertexShader = `
uniform float u_intensity;
uniform float u_time;

varying vec2 vUv;
varying float vDisplacement;

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(
    dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)
  ));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;

  vec4 norm1 = taylorInvSqrt(vec4(
    dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)
  ));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110),
                 vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

void main() {
  vUv = uv;
  vDisplacement = cnoise(position + vec3(0.8 * u_time));
  vec3 newPosition = position + normal * (u_intensity * vDisplacement);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
}
`;

// Fragment Shader
const fragmentShader = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;
varying float vDisplacement;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  float distort = 1.5 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time * 0.6);
  vec3 color = mix(u_color, vec3(1.0, 1.0, 1.0), distort);
  float noise = random(gl_FragCoord.xy * u_time * 0.02) * 0.03;
  color += noise;
  gl_FragColor = vec4(color, 1.0);
}
`;

// Blob Component
const Blob = ({ color = "#1725D1" }) => {
  const mesh = useRef();
  const hover = useRef(false);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_intensity: { value: 0.3 },
    u_color: { value: new Color(color) },
  }), []);

  useEffect(() => {
    uniforms.u_color.value.set(color);
  }, [color]);

  const targetPosition = useRef(new Vector3(0, 0, 0));
  const currentPosition = useRef(new Vector3(0, 0, 0));

  useFrame((state) => {
    const { clock, mouse } = state;
    if (mesh.current) {
      const material = mesh.current.material;
      material.uniforms.u_time.value = 0.15 * clock.getElapsedTime();
      material.uniforms.u_intensity.value = MathUtils.lerp(
        material.uniforms.u_intensity.value,
        hover.current ? 0.7 : 1,
        0.02
      );
      targetPosition.current.set(mouse.x * 0.3, mouse.y * 0.3, 0);
      currentPosition.current.lerp(targetPosition.current, 0.1);
      mesh.current.position.copy(currentPosition.current);
    }
  });

  return (
    <mesh
      ref={mesh}
      scale={1.5}
      position={[0, 0, 0]}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// Hero Component
const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });

  const socialLinks = [
    { name: "GitHub", url: "https://github.com", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
    { name: "LinkedIn", url: "https://www.linkedin.com", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    { name: "Twitter", url: "https://twitter.com", icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
    { name: "Dribbble", url: "https://dribbble.com", icon: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.137 6.29 2.137 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.72C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" },
  ];

  return (
    <section id="home" className="relative flex items-center justify-center min-h-screen overflow-hidden w-screen -mx-[calc((100vw-100%)/2)] left-0 right-0">
      {/* Dark Black Background Overlay */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-[#000000]"></div>
      
      {/* 3D Background */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden m-0 p-0">
        <Canvas camera={{ position: [0, 1, 3] }} style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <Environment preset="studio" />
            <Blob color="#1725D1" />
          </Suspense>
        </Canvas>
      </div>

      {/* Smooth Transition Gradient to About Section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 md:h-64 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1628]/30 to-[#030412]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1725D1]/5 to-transparent"></div>
      </div>

      {/* Foreground Text */}
      <div className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center translate-y-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl flex flex-col items-center text-center px-4"
        >
          <HeroText />
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {socialLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label={link.name}
            >
              {link.icon && (
                <svg
                  className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={link.icon} />
                </svg>
              )}
              <span className="text-sm md:text-base">{link.name}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
