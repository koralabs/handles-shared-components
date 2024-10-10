import React from "react";
import { motion } from "framer-motion";

import loader1 from '../../assets/loader1.svg';
import loader2 from '../../assets/loader2.svg';


interface LoaderProps {
  size?: number;
  className?: string;
}

export const Loader = ({ size = 48, className = "" }: LoaderProps) => {
  const innerSize = size / 2;
  const innerOffset = size / 4;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    margin: "auto",
    position: "relative",
  };

  const outerSvgStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: "absolute",
    alignItems: "left",
  };

  const innerSvgStyle: React.CSSProperties = {
    width: innerSize,
    height: innerSize,
    position: "absolute",
    left: innerOffset,
    top: innerOffset,
  };

  const svgFullHeightStyle: React.CSSProperties = {
    height: "100%",
  };

  const svgFullHeightMarginLeftAutoStyle: React.CSSProperties = {
    height: "100%",
    marginLeft: "auto",
  };

  return (
    <div style={containerStyle} className={className}>
      <motion.div
        style={outerSvgStyle}
        animate={{ rotate: 360 }}
        transition={{ ease: "linear", duration: 2, repeat: Infinity }}
      >
        <img className="h-full" src={loader1} />
      </motion.div>
      <motion.div
        style={innerSvgStyle}
        animate={{ rotate: -360 }}
        transition={{ ease: "linear", duration: 2.2, repeat: Infinity }}
      >
        <img className="h-full ml-auto" src={loader2} />
      </motion.div>
    </div>
  );
};
