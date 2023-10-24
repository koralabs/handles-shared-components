import { Transition } from '@headlessui/react';
import tinycolor from 'tinycolor2';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HuePicker } from 'react-color';
import { AlphaPicker, ColorResult, CustomPicker } from 'react-color';
import { EditableInput, Saturation } from 'react-color/lib/components/common';
import { assertIsNode, delay } from '../../lib/helpers';
import { TrashIcon } from '@heroicons/react/24/solid';
import ShadowPicker from '../CustomSlider';
import { BiCheck, BiSave } from 'react-icons/bi';
import Fade from '../Fade';
import { MdCopyAll } from 'react-icons/md';

const defaultColorPalette = [
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff',
    '#fff'
];

const AestheticColorPicker = (props: any) => {
    const { onChange, color, title } = props;

    // const { screenType } = useScreenType();
    const screenType = "md"
    const [currentColor, setCurrentColor] = useState(color || '#ffffff');
    const [colorPopup, setColorPopup] = useState(false);

    const [savedColors, setSavedColors] = useState<Array<string>>([]);
    const [storedColors, setStoredColors] = useState<Array<string>>([]);

    // Copy hex
    const [copied, setCopied] = useState<boolean>(false);

    const colorRef = useRef<HTMLDivElement | null>(null);

    const rgbColor = useMemo(() => tinycolor(color).toRgb(), [color]);
    const currentRgbColor = useMemo(() => tinycolor(currentColor).toRgb(), [currentColor]);

    // Slider Size
    const [width, setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleSaturationChange = (hsv: any) => {
        const color = tinycolor(hsv);
        setCurrentColor(color.toHex());
        onChange(color.toHex());
    };

    const handleHueChange = (hueColor: ColorResult) => {
        setCurrentColor(hueColor.hex);
        onChange(hueColor);
    };

    const handleHexChange = (hexColor: string | ColorResult) => {
        if (typeof hexColor !== 'string') {
            return;
        }
        if (hexColor && hexColor?.length > 9) {
            return;
        }
        setCurrentColor(hexColor);
        onChange(hexColor);
    };

    const handleAlphaChange = (alphaColor: ColorResult) => {
        const alphaHex = tinycolor(alphaColor.rgb).toHex8String();
        setCurrentColor(alphaHex);
        onChange(alphaHex);
    };

    const copyHex = async () => {
        navigator.clipboard.writeText(color);
        setCopied(true);
        await delay(2000);
        setCopied(false);
    };

    const storeColor = () => {
        let storedColors = savedColors; //storedC.getItem('savedColors');
        let tempColors: Array<string> = [];

        const index = savedColors.indexOf(color);
        // Don't save color if already saved
        if (index !== -1) {
            setColorPopup(false);
            return;
        }

        if (storedColors && storedColors.length < 12) {
            tempColors = savedColors;
            tempColors.unshift(color);
        } else if (storedColors && storedColors.length >= 8) {
            tempColors = savedColors;
            tempColors.unshift(color);
            tempColors.pop();
        }

        setStoredColors(tempColors);
        setSavedColors(tempColors);
        setColorPopup(false);
    };

    const deleteStoredColor = () => {
        const index = savedColors.indexOf(color);
        let tempArray = savedColors.filter((item) => item !== color);

        setStoredColors(tempArray);
        setSavedColors(tempArray);
    };

    const selectStoredColor = (color: string) => {
        setCurrentColor(color);
        onChange(color);
    };

    useEffect(() => {
        if (storedColors) {
            setSavedColors(storedColors);
        } else {
            setSavedColors(defaultColorPalette);
        }
    }, [title]);

    useLayoutEffect(() => {
        let currentRef: HTMLDivElement;
        const resizeObserver = new ResizeObserver((entries) => {
            // this callback gets executed whenever the size changes
            // when size changes get the width and update the state
            // so that the Child component can access the updated width
            for (let entry of entries) {
                if (entry.contentRect) {
                    setWidth(entry.contentRect.width);
                }
            }
        });

        // register the observer for the div
        if (ref.current) {
            currentRef = ref.current;
            resizeObserver.observe(ref.current);
        }

        // unregister the observer
        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, []);

    // If user clicks outside of color popup, close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            assertIsNode(event.target);

            if (colorRef.current && !colorRef.current.contains(event.target)) {
                setColorPopup(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [colorRef]);

    const CustomCirclePicker = () => {
        return (
            <div
                className="bg-transparent border-white border-2 rounded-full pointer-events-none"
                style={{
                    cursor: 'pointer',
                    height: 24,
                    width: 24,
                    translate: '-12px'
                }}
            ></div>
        );
    };

    return (
        <div className="relative">
            <div className="relative mt-2 mb-6">
                <div>
                    {props.isShadow && (
                        <>
                            <div className="flex flex-col md:flex-row md:space-x-4 mb-2 justify-between">
                                <div className="w-full md:w-1/2">
                                    <ShadowPicker
                                        type="Horizontal"
                                        value={props.fontShadowSize?.[0] ?? 8}
                                        onChange={(horz) => {
                                            props.onFontShadowSizeChange([
                                                horz,
                                                props.fontShadowSize?.[1] ?? 8,
                                                props.fontShadowSize?.[2] ?? 8
                                            ]);
                                        }}
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <ShadowPicker
                                        type="Vertical"
                                        value={props.fontShadowSize?.[1] ?? 8}
                                        onChange={(vert) => {
                                            props.onFontShadowSizeChange([
                                                props.fontShadowSize?.[0] ?? 8,
                                                vert,
                                                props.fontShadowSize?.[2] ?? 8
                                            ]);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 mb-6">
                                <ShadowPicker
                                    type="Blur"
                                    min={0}
                                    max={20}
                                    showSlider={false}
                                    value={props.fontShadowSize?.[2] ?? 8}
                                    onChange={(blur) => {
                                        props.onFontShadowSizeChange([
                                            props.fontShadowSize?.[0] ?? 8,
                                            props.fontShadowSize?.[1] ?? 8,
                                            blur
                                        ]);
                                    }}
                                />
                            </div>
                        </>
                    )}
                    <div className="flex flex-col md:flex-row md:space-x-4 mb-2 ">
                        <div className="w-full" style={{ width: screenType === 'sm' ? '100%' : '50%' }}>
                            <p className="w-full text-gray-300 text-sm mb-2">Color Picker</p>
                            <div className="checkered h-8 rounded-full overflow-hidden cursor-pointer">
                                <div
                                    className="h-full w-full inset-shadow-xl rounded-full"
                                    onClick={() => setColorPopup(!colorPopup)}
                                    style={{ backgroundColor: color }}
                                ></div>
                            </div>

                            <div className="w-full">
                                <div className="mt-3 mb-1" style={styles.hexContainer}>
                                    <EditableInput style={hexStyles} value={color} onChange={handleHexChange} />
                                    <div
                                        onClick={copyHex}
                                        className="cursor-pointer bg-brand-300 rounded-full px-4 py-2 self-center hover:opacity-60"
                                    >
                                        <div className="h-full h-5 w-5">
                                            {copied ? (
                                                <Fade fadeKey={'bicheck'} fadeDuration={0.15}>
                                                    <BiCheck className="h-5 w-5 -mt-1 text-green-400" />
                                                </Fade>
                                            ) : (
                                                <MdCopyAll className="h-5 w-5 -mt-1" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 " style={{ width: screenType === 'sm' ? '100%' : '50%' }}>
                            <div className="flex flex-row">
                                <p className="w-full text-gray-300 text-sm mb-2">Your Saved Colors</p>
                                <TrashIcon className="h-5 w-5 cursor-pointer" onClick={deleteStoredColor} />
                            </div>

                            <div className="w-full grid grid-cols-6  gap-x-1 gap-y-1 h-16">
                                {savedColors.map((item: string, index: number) => {
                                    return (
                                        <div
                                            className={`checkered md:h-5 md:w-5 lg:h-6 lg:w-full hover:opacity-60 rounded-full inset-shadow-xl cursor-pointer overflow-hidden border ${
                                                color === item ? 'border-green-400 shadow-green' : 'border-white'
                                            }`}
                                            key={`grid-${item}-${index}`}
                                        >
                                            <div
                                                className="h-full w-full inset-shadow-xl rounded-full"
                                                onClick={() => selectStoredColor(item)}
                                                style={{ backgroundColor: item, transition: 'all 0.1s' }}
                                            ></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-4">
                        <p className="w-full text-gray-300 text-sm mb-2">Opacity</p>
                        <div className="flex flex-row">
                            <div className="alpha-wrapper relative h-4 cursor-pointer w-full" ref={ref}>
                                <AlphaPicker
                                    {...props}
                                    width={width}
                                    height={24}
                                    color={color}
                                    pointer={CustomCirclePicker}
                                    style={{
                                        alpha: { borderRadius: 12, overflow: 'hidden', width: width }
                                    }}
                                    className="rounded-full bg-white"
                                    onChange={handleAlphaChange}
                                />
                            </div>
                            <div className="mx-2 w-12 rounded-full bg-brand-300">
                                <p className="mb-0 px-2 py-1">
                                    {`${rgbColor.a ? Math.trunc(rgbColor.a * 100) : 100}%`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Transition
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                show={colorPopup}
            >
                <div className={`absolute top-10 left-6 z-30 overflow-visible `}>
                    <div className="p-3" style={styles.pickerContainer} ref={colorRef}>
                        <div style={styles.saturationContainer}>
                            <Saturation
                                {...props}
                                color={currentColor}
                                onChange={handleSaturationChange}
                                style={styles.saturation}
                            />
                        </div>
                        <div style={styles.hueContainer}>
                            <HuePicker
                                {...props}
                                color={currentColor}
                                onChange={handleHueChange}
                                direction="horizontal"
                                style={styles.hue}
                                pointer={CustomCirclePicker}
                                height={24}
                            />
                        </div>
                        <div className="flex flex-row items-center  mt-4 mb-1">
                            <p className="mr-2 mb-0">hex</p>

                            <div style={styles.hexContainer}>
                                <EditableInput style={hexStyles} value={color} onChange={handleHexChange} />
                                <div
                                    onClick={copyHex}
                                    className="cursor-pointer bg-brand-300 rounded-full px-4 py-1 self-center hover:opacity-60"
                                >
                                    <div className="h-full h-5 w-5">
                                        {copied ? (
                                            <Fade fadeKey={'bicheck'} fadeDuration={0.15}>
                                                <BiCheck className="h-5 w-5 text-green-400" />
                                            </Fade>
                                        ) : (
                                            <MdCopyAll className="h-5 w-5 -mt-1" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="px-4 self-center bg-brand-300 mx-1 rounded-full py-1.5 hover:opacity-60 cursor-pointer"
                                onClick={storeColor}
                            >
                                <BiSave className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="w-full mt-4">
                            <p className="w-full text-gray-300 text-sm mb-2">Opacity</p>
                            <div className="flex flex-row">
                                <div className="alpha-wrapper relative h-4 cursor-pointer w-10/12" ref={ref}>
                                    <AlphaPicker
                                        {...props}
                                        width="100%"
                                        height={24}
                                        color={color}
                                        pointer={CustomCirclePicker}
                                        style={{
                                            alpha: { borderRadius: 12, overflow: 'hidden', zIndex: 100 }
                                        }}
                                        className="rounded-full bg-white"
                                        onChange={handleAlphaChange}
                                    />
                                </div>
                                <div className="mx-2 w-2/12 rounded-full bg-brand-300 text-center">
                                    <p className="mb-0 px-2 py-1">
                                        {`${rgbColor.a ? Math.trunc(rgbColor.a * 100) : 100}%`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    pickerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: '#ffffff',
        // padding: '16px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        width: '100%',
        position: 'relative',
        backgroundColor: '#0A0E3B',
        border: '1px solid rgba(77, 166, 255, 0.6)'
    },
    saturationContainer: {
        position: 'relative',
        width: '100%',
        height: '140px',
        overflow: 'hidden',
        borderRadius: '6px'
    },
    saturation: {
        borderRadius: '6px'
    },
    hueContainer: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',

        marginTop: '12px',
        height: '24px'
    },
    hue: {
        height: '24px',
        width: '100%'
    },
    hexContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '30px'
    }
};

const hexStyles: Record<string, React.CSSProperties> = {
    input: {
        border: 'none',
        width: '100%',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.00)',
        fontSize: 14,
        padding: 5,
        paddingLeft: 12
    },
    label: {
        display: 'none',
        fontSize: '12px',
        color: '#999'
    }
};

export default CustomPicker(AestheticColorPicker);
