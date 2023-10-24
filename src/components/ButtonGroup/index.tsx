import React from "react";

interface ButtonValue {
  value: string;
  title: string;
}

interface ButtonGroupProps {
  buttons: [ButtonValue, ButtonValue, ...ButtonValue[]]; // Must have at least 2 elements in array
  selectedValue: string;
  disabled?: boolean;
  onChange: (params: string) => void;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selectedValue,
  disabled = false,
  onChange,
  wrapperClassName = "",
  buttonClassName = "",
}: ButtonGroupProps) => {
  return (
    <div
    className={`text-sm flex flex-row rounded-full whitespace-nowrap
    ${wrapperClassName}
    ${!disabled ? 'border border-dark-350 text-white' : 'text-gray-300 pointer-events-none'} `}
>
    {buttons.map((bt, index) => {
        return (
            <div key={index} className="cursor-pointer w-full text-center" onClick={() => onChange(bt.value)}>
                <p
                    className={`mb-0 transition-all rounded-full px-2 py-1
                        ${selectedValue === bt.value ? 'bg-dark-350' : ''} 
                        ${buttonClassName}
                    `}
                >
                    {bt.title}
                </p>
            </div>
        );
    })}
</div>
);
};

export default ButtonGroup;
