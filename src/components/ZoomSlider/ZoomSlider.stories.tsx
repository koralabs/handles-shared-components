import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import ZoomSlider, { ZoomSliderProps } from ".";

const meta: any = {
  title: "Example/ZoomSlider",
  component: ZoomSlider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

function StoryRender(props: ZoomSliderProps) {
  const [value, setValue] = useState<number>(50);

  const handleChange = (num: number) => {
    setValue(num)
  }

  return <>
      <p className="text-white text-center">
          Value: {value}
      </p>
      {/* @ts-ignore */}
      <ZoomSlider
          {...props}
          value={value}
          onChange={handleChange}
      />
  </>
}

export const Main: Story = {
  args: {
    min: 0,
    max: 100,
    type: "offset",
    startPoint: 50,  
  },
  render: (args: any) => {
    return <StoryRender {...args} />
  }
};
