import type { Meta, StoryObj } from "@storybook/react";

import ButtonGroup from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: any = {
  title: "Example/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
    controls: [{}]
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Main: Story = {
  args: {
    selectedValue: "tacos",
    buttons: [
      {
        value: "tacos",
        title: "tacos",
      },
      {
        value: "burritos",
        title: "burritos",
      },
      {
        value: "nachos",
        title: "nachos",
      },
    ],
  },
};
