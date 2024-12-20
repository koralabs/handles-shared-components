import React from "react";
import Fade from "../Fade";
import { Loader } from "../Loader";

interface ButtonProps {
  buttonStyle?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "link"
    | "outline"
    | "green";
  internal?: boolean;
  href?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  animate?: boolean;
  icon?: string;
  children?: JSX.Element | JSX.Element[] | string | string[];
  [key: string]: unknown;
}

const renderIcon = (iconName: string) => {
  if (iconName) {
    console.log('they be lookin for an icon called "' + iconName + '"yo');
    return "<" + { iconName } + "/>";
  } else {
    console.log("no need for an icon on this button dawg");
  }
};

export const Button: React.FC<ButtonProps> = ({
  className = "",
  href,
  internal = true,
  buttonStyle = "secondary",
  animate = false,
  icon = "",
  children,
  disabled,
  loading = false,
  loadingSize = 24,
  ...rest
}): JSX.Element => {
  // const classes = ['cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold'];

  // if (disabled) {
  //     classes.push('cursor-not-allowed bg-dark-300 hover:bg-dark-300 active:bg-dark-300 text-dark-350');
  // }

  // if (animate) {
  //     classes.push('transform hover:translate-x-2');
  // }

  // console.log('buttonStyle', buttonStyle)

  // if (!disabled) {
  //     switch (buttonStyle) {
  //         case 'primary':
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-primary-200 hover:bg-dark-100 active:bg-dark-100 text-dark-100';
  //         case 'secondary':
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-primary-100 hover:bg-primary-200 active:bg-dark-100 text-white';
  //         case 'tertiary':
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-primary-100 hover:bg-primary-200 active:bg-dark-100 text-white';
  //         case 'outline':
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-dark-200 border border-dark-225 text-white';
  //         case 'green':
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-green-100 border border-dark-225 text-white';
  //         default:
  //             classes = 'cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold bg-primary-100 hover:bg-primary-200 active:bg-dark-100 text-white';
  //     }
  // }

  const classes = `cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold transition-all ${className}`;

  if (internal && href?.length) {
    return (
      <a href={href}>
        <a className={classes + " " + className} {...rest}>
          {children}
        </a>
      </a>
    );
  }

  if (!internal && href?.length) {
    return (
      <a href={href} className={classes + " " + className} {...rest}>
        {children}
      </a>
    );
  }

  if (loading) {
    return (
      <button className={classes + " " + className} disabled={true} {...rest}>
        <div className="h-6 grayscale">
          <Fade fadeKey={"loaderupgrade"} fadeDuration={0.2}>
            <div className="h-6 w-6">
                <Loader size={loadingSize} />
            </div>
          </Fade>
        </div>
      </button>
    );
  }

  return (
    <button className={classes + " " + className} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
