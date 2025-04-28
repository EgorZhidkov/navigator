import type { Meta, StoryObj } from '@storybook/react';

import Icon from './Icon';

const meta = {
  title: 'shared/Icon',
  component: Icon,
  argTypes: {},
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;
// TODO появились проблемы после обновления строибука
export const Bike: Story = {
  args: {
    additionClassName: '',
    name: 'uav',
    width: '132px',
    height: '132px',
    fill: 'blue',
  },
};
export const Map: Story = {
  args: {
    name: 'map',
    additionClassName: 'fill-red-500',
    size: '55px',
    fill: '',
  },
};
