import { HexString } from "@koralabs/handles-public-api-interfaces";

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !("nodeType" in e)) {
    throw new Error(`Node expected`);
  }
}
