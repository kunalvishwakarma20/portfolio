import React from "react";
import { X } from "lucide-react";

const ProjectDetails = ({
  title,
  description,
  subDescription,
  image,
  tags,
  href,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-neutral-900 p-6 rounded-lg max-w-xl w-full relative shadow-lg border border-neutral-700">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>

        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover rounded-md mb-4 border border-neutral-800"
          />
        )}

        <p className="text-sm text-gray-300 mb-2">{description}</p>

        {subDescription && (
          <p className="text-sm text-gray-400 mb-4">{subDescription}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {tags?.map((tag) => (
            <span
              key={tag.id}
              className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-400 hover:underline text-sm"
          >
            🔗 View Project ↗
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
