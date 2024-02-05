import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import Pagination, { PaginationProps } from ".";

const meta: any = {
  title: "Example/Pagination",
  component: Pagination,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

// function StoryRender() {
//   const [page, setPage] = useState<number>(1);

//   const handleChange = (num: number) => {
//     setPage(num);
//   };

//   return (<Pagination currentPage={page} totalPages={12} onPageChange={handleChange} />)
// }

export const Main: Story = {
  args: {
    page: 1,
    totalPages: 12,
    currentPage: 4
  },
  // render: StoryRender
};
