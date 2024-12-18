import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import FilterDropdown from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: any = {
  title: "Example/FilterDropdown",
  component: FilterDropdown,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    value: { control: "text" },
    onChange: { action: "changed" },
    options: { control: "object" },
    label: { control: "text" },
  },
} satisfies Meta<typeof FilterDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryRender(args: any) {
  const [value, setValue] = useState(args.value);

  return (
    <div className="w-56 h-40">
      <FilterDropdown
        {...args}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          args.onChange?.(newValue);
        }}
      />
    </div>
  );
}

export const Primary: Story = {
  args: {
    value: "test",
    options: [
      { value: "test", label: "Test" },
      { value: "test2", label: "Test 2" },
    ],
    label: "Test",
  },
  render: StoryRender
};
