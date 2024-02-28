import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import IPFSImage, { IPFSImageProps } from ".";

const meta: any = {
  title: "Example/IPFSImage",
  component: IPFSImage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

function StoryRender({src, alt, className, objectFit}: IPFSImageProps) {
  // const [src, setSrc] = useState<string>("ipfs://bafkreia563kxkmyzecbt3pghi66ny6aimkbm5dcgvjn7qoplabxak7zcwq");


  // const handleChange = (srcIn: string) => {
  //   setSrc("");
  // };

  return (
  <div className="mx-auto w-40 my-4">
    <IPFSImage src={src} alt={alt} className={className} objectFit={objectFit}  />
  </div>
  )
}

export const Main: Story = {
  args: {
    src: "ipfs://bafkreia563kxkmyzecbt3pghi66ny6aimkbm5dcgvjn7qoplabxak7zcwq",
    alt: "Quok",
    className: "",

  },
  render: StoryRender
};

