import type { Meta, StoryObj } from "@storybook/react";

import { SvgHandle } from ".";

const meta: Meta = {
  title: "Example/SvgHandle",
  component: SvgHandle,
  argTypes: {
    bg_color: { control: "text" },
    bg_border_color: { control: "text" },
  },
} satisfies Meta<typeof SvgHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicHandle: Story = {
  args: {
    handle: "testing",
  },
};
