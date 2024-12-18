import React from "react";
import { useState, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    label: string;
}

const FilterDropdown = ({ value, onChange, options, label }: FilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/50 text-base px-3 py-3 rounded-lg flex items-center justify-between hover:bg-black/60 transition-colors"
            >
                <span className="text-gray-400">
                    {value ? options.find(opt => opt.value === value)?.label : label}
                </span>
                <BiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden origin-top"
                    >
                        {options.map((option) => (
                            <motion.button
                                key={option.value}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                                    value === option.value ? 'text-green-400' : 'text-gray-200'
                                }`}
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterDropdown;