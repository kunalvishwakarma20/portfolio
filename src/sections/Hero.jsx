import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Suspense, useMemo, useRef, useEffect } from "react";
import { MathUtils, Vector3, Color } from "three";
import { Environment } from "@react-three/drei";
import HeroText from "../components/HeroText";
import Loader from "../components/Loader";

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
  vDisplacement = cnoise(position + vec3(2.0 * u_time));
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
  float distort = 2.0 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time);
  vec3 color = mix(u_color, vec3(1.0, 1.0, 1.0), distort);
  float noise = random(gl_FragCoord.xy * u_time * 0.05) * 0.05;
  color += noise;
  gl_FragColor = vec4(color, 1.0);
}
`;

// Blob Component
const Blob = ({ color = "#8d7dca" }) => {
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
      material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
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
    { name: "GitHub", url: "https://github.com" },
  ];

  return (
    <section className="relative flex items-start justify-center min-h-screen overflow-hidden">
      {/* 3D Background */}
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">


        <Canvas camera={{ position: [0, 1, 3] }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <Environment preset="studio" />
            <Blob color="#8d7dca" />
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground Text */}
      <div className="relative z-10 w-full px-0 pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <HeroText />
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-purple-500"></div>
              <p className="text-xl text-gray-300">Designer & Developer</p>
            </div>
            <motion.p
              className="mt-6 text-lg text-gray-300 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Creating immersive digital experiences with cutting-edge animations
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-6 flex gap-6"
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
              className="text-gray-400 hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
            >
              {link.name}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
