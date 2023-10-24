import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import Button from "../Button";

interface OptionsInterface<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

interface CustomSelectInterface<T extends string> {
  options: OptionsInterface<T>[];
  setValue: (params: T) => void;
  currentValue: T;
}

const CustomSelect = <T extends string>({
  options,
  setValue,
  currentValue,
}: CustomSelectInterface<T>) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);

  const parentDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentDivRef.current) {
      setMenuWidth(parentDivRef.current.offsetWidth);
    }
  }, [parentDivRef.current]);

  const currentOption = options.find((x) => x.value === currentValue);

  return (
    <div className="flex flex-row md:flex-col w-full overflow-hidden text-white">
      <div className="block w-full " ref={parentDivRef}>
        <Menu>
          <Button
            className="bg-dark-250 flex flex-row items-center w-full justify-center"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="flex justify-center -ml-4 mr-2">
              {currentOption?.icon}
            </span>
            <span>{currentOption?.label}</span>

            <BiChevronDown />
          </Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            show={showDropdown}
          >
            <Menu.Items
              className={`absolute w-64 origin-top-left overflow-hidden ring-1 ring-white ring-opacity-5 focus:outline-none shadow-lg z-10 border border-brand-300 bg-dark-200 rounded-xl `}
              style={{
                width: menuWidth,
              }}
            >
              {options.map(({ value, label, icon }, index) => {
                return (
                  <div key={`${value}-${index}`}>
                    <div
                      className="flex flex-row hover:bg-dark-350 pt-4 pb-4 px-6 items-center focus:bg-dark-350 "
                      onClick={() => {
                        setValue(value);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="flex justify-center mr-2">{icon}</span>
                      <span className="text-base">{label}</span>
                    </div>
                    <hr />
                  </div>
                );
              })}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default CustomSelect;
