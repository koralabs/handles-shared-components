import React, { useState } from "react";

interface ButtonValue {
  value: string;
  title: string;
}

interface ButtonGroupProps {
  buttons: [ButtonValue, ButtonValue, ...ButtonValue[]]; // Must have at least 2 elements in array
  selectedValue: string;
  disabled?: boolean;
  onChange: (params: string) => void;
  activeClassName?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selectedValue,
  disabled = false,
  onChange,
  activeClassName,
  wrapperClassName = "",
  buttonClassName = "",
}: ButtonGroupProps) => {
  const [activeButton, setActiveButton] = useState(selectedValue);

  const onClickButton = (value: string) => {
    if (disabled) {
      return;
    }

    setActiveButton(value);
    onChange(value);
  }

  return (
    <div
      className={`text-sm flex flex-row rounded-lg whitespace-nowrap [&>div:first-child>div]:rounded-l-lg [&>div:last-child>div]:rounded-r-lg border border-white text-white
    ${wrapperClassName}
    ${disabled ? 'opacity-50' : ''} `}
    >
      {buttons.map((btn, index) => {
        return (
          <div key={index} className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} w-full text-center`} onClick={() => onClickButton(btn.value)}>
            <div
              className={`mb-0 transition-all px-2 py-1
                        ${activeButton === btn.value ? `${activeClassName ?? 'bg-primary-200'}` : ''} 
                        ${buttonClassName}
                    `}
            >
              {btn.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ButtonGroup;
