import type { Meta, StoryObj } from "@storybook/react";
import opentype from "opentype.js";

import { SvgHandle } from ".";

const meta: Meta = {
  title: "Example/SvgHandle",
  component: SvgHandle,
  argTypes: {
    bg_color: { control: "color" },
    bg_border_color: { control: "color" },
    font_color: { control: "color" },
    pfp_border_color: { control: "color" },
    font_shadow_color: { control: "color" },
    bg_image: { control: "text" },
    font: { control: "text" },
    font_shadow_size: { control: "object" },
    text_ribbon_colors: { control: "object" },
    text_ribbon_gradient: { control: "text" },
    pfp_image: { control: "text" },
    pfp_zoom: { control: "text" },
    pfp_offset: { control: "object" },
    og_number: { control: "number" },
    qr_link: { control: "text" },
    qr_image: { control: "text" },
    qr_bg_color: { control: "color" },
    socials: { control: "object" },
  },
} satisfies Meta<typeof SvgHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicHandle: Story = {
  args: {
    handle: "testing",
    opentype,
  },
};
