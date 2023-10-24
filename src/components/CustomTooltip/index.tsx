// Tooltip.tsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  label: string;
  position?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
  className?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  label,
  position = "top",
  children,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <AnimatePresence key={`tooltip-${label}`}>
        {isVisible && (
          <motion.div
            key={`label-tooltip-${label}`}
            className={`absolute bg-blue-500 text-white p-1 rounded text-xs text-center
                            ${className}
                            ${
                              position === "top" &&
                              "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                            }
                            ${position === "right" && "left-full ml-2"}
                            ${
                              position === "bottom" &&
                              "top-full mt-2 left-1/2 transform -translate-x-1/2"
                            }
                            ${position === "left" && "right-full mr-2"}
                        `}
            style={{ minWidth: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {label}
          </motion.div>
        )}
        <div className="text-white">{children}</div>
      </AnimatePresence>
    </div>
  );
};

export default CustomTooltip;
