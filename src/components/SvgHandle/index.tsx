import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HandleSVG from '@koralabs/handle-svg';
import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';
import { useContainerDimensions } from '../../hooks/useContainerDimensions';
import { hexStringToColor } from '../../helpers';

interface SvgHandleProps extends IHandleSvgOptions {
    handle: string;
    disableDollarSymbol?: boolean;
}

const emptyOptions: IHandleSvgOptions = {
    bg_color: undefined,
    bg_image: undefined,
    font: undefined,
    font_color: undefined,
    font_shadow_color: undefined,
    font_shadow_size: undefined,
    text_ribbon_colors: undefined,
    text_ribbon_gradient: undefined,
    pfp_image: undefined,
    pfp_zoom: undefined,
    pfp_offset: undefined,
    pfp_border_color: undefined,
    bg_border_color: undefined,
    og_number: undefined,
    qr_link: undefined,
    qr_image: undefined,
    qr_bg_color: undefined,
    socials: undefined
}

export const SvgHandle: React.FC<SvgHandleProps> = ({ handle = '', disableDollarSymbol, ...rest }) => {

    const [loadedHandleName, setLoadedHandleName] = useState<string | null>(null);
    const [loadedOg, setLoadedOg] = useState<string | null>(null);
    const [loadedSocials, setLoadedSocials] = useState<string | null>(null);
    const [loadedQrCode, setLoadedQrCode] = useState<string | null>(null);
    const [wawoffModule, setWawoffModule] = useState<any | null>(null);

    const componentRef = useRef<HTMLDivElement | null>(null);
    const { width: renderedSvgSize } = useContainerDimensions(componentRef);

    const handleNameRef = useRef<SVGSVGElement | null>(null);

    const options: IHandleSvgOptions = useMemo(() => Object.entries(rest).reduce<IHandleSvgOptions>((agg, [k, v]) => {
        if (v) {
            // if v is a string and starts with #, replace with 0x
            if (typeof v === 'string' && v.startsWith('#')) {
                return { ...agg, [k]: v.replace('#', '0x') }
            }
            return { ...agg, [k]: v }
        }
        return agg;
    }, {}), [rest]);

    const {
        bg_color,
        bg_image,
        font,
        font_color,
        font_shadow_color,
        font_shadow_size,
        text_ribbon_colors,
        text_ribbon_gradient,
        pfp_image,
        pfp_zoom,
        pfp_offset,
        pfp_border_color,
        bg_border_color,
        og_number,
        qr_link,
        qr_image,
        qr_bg_color,
        socials,
    } = options ?? emptyOptions;

    useEffect(() => {
        // @ts-ignore
        if (window?.Module) {
            // @ts-ignore
            setWawoffModule(window.Module);
        }
    }, [disableDollarSymbol, handle, rest, renderedSvgSize])

    const handleSvg = useMemo(() => new HandleSVG({ handle, size: renderedSvgSize, options, disableDollarSymbol }), [disableDollarSymbol, handle, options, renderedSvgSize]);
    const loadQrCode = useCallback(
        async () => {
            if (handleSvg && qr_link && qr_link !== '') {
                const { default: QRCodeStyling } = await import('qr-code-styling');
                const { qrCode, realQrHeight } = handleSvg.initQrCodeStyling<any>(QRCodeStyling, handleSvg.buildQrCodeOptions());

                const { adjustedQRCodeSize, qrCodeMargin, svgQrPosition, svgViewBox } = handleSvg.buildQrCodeViewProperties(realQrHeight) ?? {
                    adjustedQRCodeSize: 0,
                    qrCodeMargin: 0,
                    svgQrPosition: 0,
                };

                const qrImageSvg = await handleSvg.buildQrImage(qr_image);
                const rect = `<rect x="${svgQrPosition}" y="${svgQrPosition}" width="${adjustedQRCodeSize + qrCodeMargin}" height="${adjustedQRCodeSize + qrCodeMargin}" style="fill: ${qr_bg_color ? hexStringToColor(qr_bg_color, '#000000') : '#ffffff00'}" />`
                const qrSvg = `<svg x="${svgQrPosition + (qrCodeMargin / 2)}" y="${svgQrPosition + (qrCodeMargin / 2)}" viewBox="${svgViewBox}">${qrCode._svg?._element.outerHTML}${qrImageSvg}</svg>`

                setLoadedQrCode(rect + qrSvg);
            } else {
                setLoadedQrCode(null);
            }
        },
        [handleSvg, options],
    )

    useEffect(() => {
        const timer = setTimeout(() => {
            clearTimeout(timer);
            loadQrCode();
        }, 5);
        return () => clearTimeout(timer);
    }, [loadQrCode, qr_link, qr_image, qr_bg_color, renderedSvgSize]);

    const logoHandle = useMemo(() => {
        return handleSvg?.buildLogoHandle();
    }, [bg_color, bg_image, renderedSvgSize]);

    const background = useMemo(() => {
        return handleSvg?.buildBackground();
    }, [bg_color, renderedSvgSize, bg_image]);

    const defaultBackground = useMemo(() => {
        return handleSvg?.buildDefaultBackground();
    }, [renderedSvgSize]);

    const textRibbon = useMemo(() => {
        return handleSvg?.buildTextRibbon();
    }, [text_ribbon_colors, text_ribbon_gradient, renderedSvgSize]);

    const backgroundBorder = useMemo(() => {
        return handleSvg?.buildBackgroundBorder();
    }, [bg_border_color, renderedSvgSize]);

    const dollarSign = useMemo(() => {
        return handleSvg?.buildDollarSign();
    }, [disableDollarSymbol, bg_color, bg_image, renderedSvgSize]);

    const backgroundImage = useMemo(() => {
        return handleSvg?.buildBackgroundImageSync()
    }, [bg_image, renderedSvgSize]);

    const pfpImage = useMemo(() => {
        return handleSvg?.buildPfpImageSync();
    }, [pfp_image, pfp_zoom, pfp_offset, pfp_border_color, renderedSvgSize])

    useEffect(() => {
        if (handleSvg && wawoffModule) {
            const buildSocials = async () => {
                const socials = await handleSvg.buildSocialsSvg(wawoffModule.decompress);
                setLoadedSocials(socials);
            }

            buildSocials();
        }
    }, [socials, font, bg_image, bg_color, wawoffModule, renderedSvgSize]);

    useEffect(() => {
        if (handleSvg && wawoffModule) {
            const buildFont = async () => {
                const handleName = await handleSvg.buildHandleName(wawoffModule.decompress);
                setLoadedHandleName(handleName);
            }

            buildFont();
        }
    }, [font, font_color, font_shadow_color, font_shadow_size, wawoffModule, bg_color, text_ribbon_colors, renderedSvgSize])

    useEffect(() => {
        if (handleSvg && wawoffModule) {
            const buildOg = async () => {
                const og = await handleSvg.buildOG(wawoffModule.decompress);
                setLoadedOg(og);
            }

            buildOg();
        }
    }, [font, og_number, font_color, wawoffModule, renderedSvgSize])

    return (
        <div ref={componentRef}>
            <svg width={renderedSvgSize} height={renderedSvgSize} xmlns="http://www.w3.org/2000/svg" style={{ background: '#fff', width: '100%', height: 'auto' }}>
                {background && <svg dangerouslySetInnerHTML={{ __html: background }} />}
                {defaultBackground && <svg dangerouslySetInnerHTML={{ __html: defaultBackground }} />}
                {backgroundImage && <svg dangerouslySetInnerHTML={{ __html: backgroundImage }} />}
                {pfpImage && <svg dangerouslySetInnerHTML={{ __html: pfpImage }} />}
                {textRibbon && <svg dangerouslySetInnerHTML={{ __html: textRibbon }} />}
                {backgroundBorder && <svg dangerouslySetInnerHTML={{ __html: backgroundBorder }} />}
                {logoHandle && <svg dangerouslySetInnerHTML={{ __html: logoHandle }} />}
                {disableDollarSymbol ? '' : dollarSign && <svg dangerouslySetInnerHTML={{ __html: dollarSign }} />}
                {loadedOg && <svg dangerouslySetInnerHTML={{ __html: loadedOg }} />}
                {loadedHandleName && <svg ref={handleNameRef} dangerouslySetInnerHTML={{ __html: loadedHandleName }} />}
                {loadedSocials && <svg dangerouslySetInnerHTML={{ __html: loadedSocials }} />}
                {loadedQrCode && <svg dangerouslySetInnerHTML={{ __html: loadedQrCode }} />}
            </svg>
        </div>
    );
};
