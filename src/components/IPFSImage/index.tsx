import React, { useState, useEffect } from 'react';
import { MdBrokenImage } from 'react-icons/md';
import { Loader } from '../Loader';

const ALL_IPFS_GATEWAYS = ['https://public-handles.myfilebase.com/ipfs', 'https://public-handles.mypinata.cloud/ipfs', 'https://ipfs.io/ipfs'];

export interface IPFSImageProps {
    src: string;
    alt?: string;
    className?: string;
    objectFit?: "contain" | "cover" | "fill";
}

const IPFSImage = ({ src, className = '', alt = "", objectFit = "cover" }: IPFSImageProps) => {
    const [isIPFS, setIsIPFS] = useState<boolean>(false);
    const [currentGatewayIndex, setCurrentGatewayIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingError, setLoadingError] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string>('');

    const objFit = `object-${objectFit}`

    useEffect(() => {
        console.log('src', src);

        const urlInfo = extractIPFSHash(src);
        if (urlInfo.isIPFS) {
            setImageSrc(`${ALL_IPFS_GATEWAYS[currentGatewayIndex]}/${urlInfo.urlOrHash}`);
            setIsIPFS(true);
        } else {
            setImageSrc(src);
        }
    }, [src, currentGatewayIndex]);

    const handleError = () => {
        if (currentGatewayIndex < ALL_IPFS_GATEWAYS.length - 1 && isIPFS) {
            setCurrentGatewayIndex(currentGatewayIndex + 1);
            setLoadingError(false);
            setIsLoading(true);
        } else {
            setLoadingError(true);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        setLoadingError(false);
    };

    if (loadingError) {
        return (
            <div className={`flex justify-center items-center h-full ${className}`}>
                <MdBrokenImage className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            {isLoading && (
                <div className={`flex justify-center items-center h-full ${className}`}>
                    <Loader />
                </div>
            )}
            <img
                alt={alt}
                className={`${className} ${isLoading ? 'hidden' : ''} ${objFit}`}
                onError={handleError}
                onLoad={handleLoad}
                src={imageSrc}
            />
        </div>
    );
};

// Extracts the IPFS hash from url
const extractIPFSHash = (url: string): { isIPFS: boolean; urlOrHash: string } => {
    const ipfsPrefixes = [/ipfs:\/\//, /https?:\/\/[^/]*\/ipfs\//];
    for (let prefix of ipfsPrefixes) {
        if (prefix.test(url)) {
            return {
                isIPFS: true,
                urlOrHash: url.replace(prefix, '') // returns just the hash
            };
        }
    }
    return {
        isIPFS: false,
        urlOrHash: url // Return the original URL if not IPFS
    };
};


export default IPFSImage;