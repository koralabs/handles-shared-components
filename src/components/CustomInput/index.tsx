import React, {
  ReactElement,
  useState,
  useEffect,
  JSXElementConstructor,
  InputHTMLAttributes,
} from "react";
import { RegisterOptions } from "react-hook-form";
import { MdError } from "react-icons/md";

// this custom input allows for both controlled and uncontrolled state. Meaning we can use react-hook-form as well as our own state:

// -- Using our own state example:

// <CustomInput value={test} onChange={(event) => setTest(event.target.value)} />

// -- Using react-hook-form

// <CustomInput
//     register={register}
//     registerOptions={{ required: 'This field is required' }}
//     name="example"
//     leftIcon={<ExampleIcon />}
//     placeholder="Example"
// />;

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  register?: any;
  registerOptions?: RegisterOptions;
  placeholder?: string;
  errorMessage?: string;
  leftIcon?: ReactElement<any, string | JSXElementConstructor<any>>;
  name?: string;
  disabled?: boolean;
  type?: string;
  className?: string;
  fullWidth?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  register,
  registerOptions,
  placeholder,
  errorMessage,
  leftIcon,
  name,
  disabled = false,
  type = "text",
  className = "",
  fullWidth,
  ...rest
}: CustomInputProps) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) {
      setLocalValue(event.target.value);
    }
    onChange?.(event);
  };

  return (
    <>
      <div className={`relative flex flex-row ${fullWidth ? 'w-full' : ''}`}>
        {leftIcon && (
          <div className="absolute h-full left-2">
            {React.cloneElement(leftIcon, {
              className: "h-full w-5 text-blue-400",
            })}
          </div>
        )}

        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder || ""}
          value={register ? undefined : value || localValue}
          onChange={onChange ? handleChange : undefined}
          {...(register ? register(name, registerOptions) : {})} // Use register if provided, else, do nothing
          className={`formfield-box transition-all text-white bg-brand-300 rounded-lg w-full
          ${className}
          ${leftIcon ? "pl-8" : "pl-3"} ${errorMessage
              ? "border-red-500 focus:border-red-500"
              : "border-secondary-200"
            } ${disabled ? "opacity-50" : ""}`}
          {...rest}
        />

        {errorMessage && (
          <div className="absolute h-full right-2">
            <MdError className="h-full w-5 text-red-500" />
          </div>
        )}
      </div>
      {errorMessage && (
        <div className="text-sm text-red-500 mb-0 mt-1">{errorMessage}</div>
      )}
    </>
  );
};

export default CustomInput;
