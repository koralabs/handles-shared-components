import Slider from 'rc-slider';
import React, { useEffect } from 'react';
import 'rc-slider/assets/index.css';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';

interface SliderProps {
    value: number;
    onChange: (params: number) => void;
    min: number;
    max: number;
    type: 'zoom' | 'offset';
    startPoint: number | undefined;
}

function CustomSlider({ value, onChange, min, max, type, startPoint = 100 }: SliderProps) {
    const handleChange = (e: number | number[]) => {
        // @ts-ignore
        onChange(e);
    };
    return (
        <div>
            <Slider
                value={value}
                startPoint={type === 'zoom' ? 100 : startPoint}
                min={min}
                max={max}
                onChange={handleChange}
            />
        </div>
    );
}

export interface ZoomSliderProps {
    type: 'zoom' | 'offset';
    value: number;
    onChange: (params: number) => void;
    showSlider?: boolean;
    min?: number;
    max?: number;
    startPoint?: number | undefined;
}
const ZoomSlider = ({ type, value, onChange, min = 100, max = 200, startPoint }: ZoomSliderProps) => {
    return (
        <div>
            <div className="w-full my-4">
                <CustomSlider
                    type={type}
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    startPoint={startPoint}
                />
            </div>
        </div>
    );
};

export default ZoomSlider;
