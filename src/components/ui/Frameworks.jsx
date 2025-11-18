import { OrbitingCircles } from "../animations/OrbitingCircles";
import React from "react";

// It's good practice to define prop types for better maintainability and type checking
// If you're using TypeScript, this would be an interface.
// For JavaScript, you can use prop-types library, or just rely on comments.

/**
 * @typedef {object} IconProps
 * @property {string} src - The source URL for the icon image.
 * @property {string} alt - The alt text for the image, crucial for accessibility.
 * @property {number} size - The desired size (width and height) of the icon in pixels.
 */

/**
 * Renders an individual icon.
 * @param {IconProps} props
 */
const Icon = ({ src, alt, size }) => (
  <img
    src={src}
    alt={alt}
    style={{ width: size, height: size }} // Use style prop for dynamic sizing
    className="duration-200 rounded-sm hover:scale-110"
  />
);

/**
 * Renders a set of technology framework icons orbiting in circles.
 */
export function Frameworks() {
  // Define skills as a constant outside the component if they are truly static
  // or use React.useMemo if they are derived from props to prevent re-creation
  // on every render if the component re-renders frequently.
  const skills = React.useMemo(
    () => [
      // { name: "Auth0", fileName: "auth0" },
      // { name: "Blazor", fileName: "blazor" },
      // { name: "C++", fileName: "cplusplus" },
      // { name: "C#", fileName: "csharp" },
      { name: "CSS3", fileName: "css3" },
      // { name: "DotNet", fileName: "dotnet" },
      // { name: "DotNet Core", fileName: "dotnetcore" },
      { name: "Git", fileName: "git" },
      { name: "HTML5", fileName: "html5" },
      { name: "JavaScript", fileName: "javascript" },
      { name: "Microsoft", fileName: "microsoft" },
      { name: "React", fileName: "react" },
      { name: "SQLite", fileName: "sqlite" },
      { name: "Tailwind CSS", fileName: "tailwindcss" },
      { name: "Vite.js", fileName: "vitejs" },
      { name: "WordPress", fileName: "wordpress" },
      {name: "three", fileName: "threejs"},
      {name: "java", fileName: "java-icon"},
      {name: "python", fileName: "python"},
      {name: "Supabase", fileName: "supabase-icon"},

    ],
    []
  );

  const primaryIconSize = 40;
  const secondaryIconSize = 25;
  const secondaryRadius = 100;
  const secondarySpeed = 2;

  return (
    <div className="relative flex h-[15rem] w-full flex-col items-center justify-center">
      {/* Primary Orbiting Circles */}
      <OrbitingCircles iconSize={primaryIconSize}>
        {skills.map((skill) => (
          <Icon
            key={skill.fileName} // Use a more stable and unique key
            src={`assets/logos/${skill.fileName}.svg`}
            alt={`${skill.name} logo`} // Add descriptive alt text
            size={primaryIconSize} // Pass size prop to Icon component
          />
        ))}
      </OrbitingCircles>

      {/* Secondary Orbiting Circles (reversed order) */}
      {/* Create a shallow copy of skills before reversing to avoid modifying the original array */}
      <OrbitingCircles
        iconSize={secondaryIconSize}
        radius={secondaryRadius}
        reverse
        speed={secondarySpeed}
      >
        {[...skills].reverse().map((skill) => (
          <Icon
            key={skill.fileName} // Use a more stable and unique key
            src={`assets/logos/${skill.fileName}.svg`}
            alt={`${skill.name} logo`} // Add descriptive alt text
            size={secondaryIconSize} // Pass size prop to Icon component
          />
        ))}
      </OrbitingCircles>
    </div>
  );
}