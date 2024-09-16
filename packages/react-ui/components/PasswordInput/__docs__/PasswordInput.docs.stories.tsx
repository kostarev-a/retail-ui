import React from 'react';
import { Meta, Story } from '../../../typings/stories';

import { PasswordInput } from '@skbkontur/react-ui';

export default {
  title: 'Input data/PasswordInput',
  component: PasswordInput,
  parameters: { creevey: { skip: true } },
} as Meta;

export const Example1: Story = () => {
  return (
    <PasswordInput />
  );

};
Example1.storyName = 'Базовый пример';

export const Example2: Story = () => {
  return (
    <PasswordInput detectCapsLock />
  );

};
Example2.storyName = 'Отслеживание нажатия CapsLock';

