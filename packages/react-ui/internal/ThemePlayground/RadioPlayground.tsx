import React from 'react';

import { Gapped } from '../../components/Gapped';
import type { RadioProps } from '../../components/Radio';
import { Radio } from '../../components/Radio';

import { getComponentsFromPropsList } from './helpers';

const propsList: Array<RadioProps<string>> = [
  { value: '', children: 'Default', checked: false },
  { value: '', children: 'Checked' },
  { value: '', children: 'Disabled', disabled: true },
  { value: '', children: 'Focused', focused: true },
  { value: '', children: 'Error', error: true },
  { value: '', children: 'Warning', warning: true },
];

export const RadioPlayground = () => {
  return (
    <Gapped gap={0} vertical>
      {getComponentsFromPropsList(<Radio value={''} checked />, propsList)}
    </Gapped>
  );
};
