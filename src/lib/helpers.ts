import { HexString } from "@koralabs/handles-public-api-interfaces";

export const isValidColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6,8}$/i.test(color);
};

export const hexStringToColor = (
  hexString: HexString | string,
  defaultColor?: string
): string => {
  const colorString = hexString.replace("0x", "#");
  return isValidColor(colorString) ? colorString : defaultColor || "#ffffff00";
};
