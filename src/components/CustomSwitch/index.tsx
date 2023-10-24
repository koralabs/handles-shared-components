import { Switch as HeadlessSwitch } from "@headlessui/react";
import React, { ChangeEvent, useEffect, useState } from "react";

interface SwitchProps {
  name?: string;
  enabled?: boolean;
  onChange?: (enabled?: boolean) => void;
  className?: string;
  allowToggle?: boolean;
}
const Switch = ({
  enabled = false,
  allowToggle = true,
  onChange,
  className = "",
}: SwitchProps) => {
  const [isEnabled, setIsEnabled] = useState(enabled || false);

  const handleCheckboxChange = () => {
    setIsEnabled(!isEnabled);
    onChange && onChange(!isEnabled);
  };

  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  return (
    <div
      className={`flex relative h-5 items-start justify-start p-0 box-border mr-2 ml-1 ${className}`}
    >
      <HeadlessSwitch
        disabled={!allowToggle}
        checked={isEnabled}
        onChange={handleCheckboxChange}
        className={`${
          isEnabled ? "bg-blue-400 inset-shadow-lg" : "bg-brand-100"
        }
                    bg-opacity-15 flex flex-row items-start justify-start w-9 h-3 rounded-full left-1 mt-1 transition-colors`}
      >
        <span
          aria-hidden="true"
          className={`${isEnabled ? "translate-x-5" : "translate-x-0"}
                    bg-white transition shadow absolute w-5 h-5 border border-solid border-opacity-40 border-purple-300 rounded-full left-0 top-0`}
        />
      </HeadlessSwitch>
    </div>
  );
};

export default Switch;
