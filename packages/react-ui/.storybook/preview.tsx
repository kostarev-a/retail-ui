import React from 'react';
import { setFilter } from '@skbkontur/react-props2attrs';
import { findAmongParents } from '@skbkontur/react-sorge/lib';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { Preview } from '@storybook/react';
import { addons } from '@storybook/manager-api';
import { CopyIcon16Regular } from '@skbkontur/icons/icons/CopyIcon/CopyIcon16Regular';
import SearchIcon from '@skbkontur/react-icons/Search';
import MenuIcon from '@skbkontur/react-icons/Menu';
import HelpDotIcon from '@skbkontur/react-icons/HelpDot';
import { MoneyTypeCoinsIcon } from '@skbkontur/icons/MoneyTypeCoinsIcon';
import { TrashCanIcon } from '@skbkontur/icons/TrashCanIcon';
import { NotificationBellAlarmIcon16Solid } from '@skbkontur/icons/NotificationBellAlarmIcon16Solid';
import { CheckAIcon16Light } from '@skbkontur/icons/icons/CheckAIcon/CheckAIcon16Light';
import OkIcon from '@skbkontur/react-icons/icons/Ok';
import FunctionIcon from '@skbkontur/react-icons/Function';
import * as DatePickerHelpers from '@skbkontur/react-ui/components/DatePicker/DatePickerHelpers';
import { ViewDateInputValidateChecks } from '@skbkontur/react-ui/components/DateInput/ViewDateInputValidateChecks';
import PeopleIcon from '@skbkontur/react-icons/People';
import { LIVE_EXAMPLES_ADDON_ID, Config as LiveConfig } from '@skbkontur/storybook-addon-live-examples';

import { isTestEnv } from '../lib/currentEnvironment';
import { ThemeContext } from '../lib/theming/ThemeContext';
import { ThemeFactory } from '../lib/theming/ThemeFactory';
import * as ReactUi from '../index';
import { XIcon16Regular } from '../internal/icons2022/XIcon/XIcon16Regular';
import { MinusCircleIcon16Light } from '../internal/icons2022/MinusCircleIcon/MinusCircleIcon16Light';

import { LocaleDecorator } from './decorators/Locale/LocaleDecorator';
import FeatureFlagsDecorator from './decorators/Features/FeatureFlagsDecorator';
import { ThemeDecorator } from './decorators/Theme/ThemeDecorator';

const isDocsEnv = Boolean(process.env.STORYBOOK_REACT_UI_DOCS);

const customViewports = {
  iphone: {
    name: 'Iphone',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
  iphonePlus: {
    name: 'Iphone Plus',
    styles: {
      width: '414px',
      height: '736px',
    },
    type: 'mobile',
  },
};

setFilter((fiber) => {
  // Транслируем все пропы только для контролов
  const isControlComponent = !!findAmongParents(
    fiber,
    (fiberParent) => fiberParent.type && typeof fiberParent.type.__KONTUR_REACT_UI__ === 'string',
  );
  if (isTestEnv && isControlComponent) {
    return null;
  }
  // Для остальных компонентов ограничиваемся тестовыми идентификаторами
  return ['data-tid', 'data-testid'];
});

const MOBILE_REGEXP = /Mobile.*/i;

const preview: Preview = {
  parameters: {
    docs: {
      toc: {
        title: 'Содержание',
        headingSelector: 'h2, h3, h4',
      },
      controls: {
        sort: 'alpha',
      },
    },
    creevey: {
      captureElement: '#test-element',
      skip: {
        'not mobile stories in mobile browser': { in: MOBILE_REGEXP, stories: /^((?!Mobile).)*$/i },
        'mobile stories in not mobile browsers': { stories: MOBILE_REGEXP, in: /^((?!Mobile).)*$/i },
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Versioning',
          ['Versions', 'Migration', 'Changelog'],
          'Information',
          ['Accessibility', 'Contributing', 'Ecosystem', 'Mobiles', 'Server Side Rendering'],
          'Button',
          'Input data',
          'Display data',
          'Menu',
          'Overlay',
          'Layout',
          '*',
        ],
      },
    },
    viewport: {
      viewports: { ...MINIMAL_VIEWPORTS, ...customViewports },
    },
  },
  decorators: [
    ThemeDecorator,
    (Story) => (
      <div id="test-element" style={{ display: 'inline-block', padding: 4 }}>
        <Story />
      </div>
    ),
    (Story) => {
      return (
        <ThemeContext.Consumer>
          {(theme) => {
            return (
              <ThemeContext.Provider
                value={ThemeFactory.create(
                  {
                    mobileMediaQuery: '(max-width: 576px)',
                  },
                  theme,
                )}
              >
                <Story />
              </ThemeContext.Provider>
            );
          }}
        </ThemeContext.Consumer>
      );
    },
  ],
};

export default preview;

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'React UI Theme',
    defaultValue: 'LIGHT_THEME',
  },
  locale: {
    name: 'Locale',
    description: 'React UI Locale',
    defaultValue: 'ru',
  },
  featureFlags: {
    name: 'React UI Feature flags',
    description: 'React UI Feature flags',
    defaultValue: [],
  },
};

if (isTestEnv) {
  import('../lib/styles/HoldSelectionColor');
}

addons.setConfig({
  [LIVE_EXAMPLES_ADDON_ID]: {
    scope: {
      ...ReactUi,
      DatePickerHelpers,
      ViewDateInputValidateChecks,
      OkIcon,
      MenuIcon,
      PeopleIcon,
      SearchIcon,
      HelpDotIcon,
      FunctionIcon,
      CopyIcon16Regular,
      TrashCanIcon,
      MoneyTypeCoinsIcon,
      NotificationBellAlarmIcon16Solid,
      CheckAIcon16Light,
      XIcon16Regular,
      MinusCircleIcon16Light,
    },
    decorators: [ThemeDecorator, LocaleDecorator, FeatureFlagsDecorator],
  } as LiveConfig,
  showToolbar: !isDocsEnv,
});
