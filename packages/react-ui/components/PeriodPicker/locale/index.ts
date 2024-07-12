import { LocaleHelper } from '../../../lib/locale/LocaleHelper';

import { componentsLocales as en_GB } from './locales/en';
import { componentsLocales as ru_RU } from './locales/ru';
import { PeriodPickerLocale } from './types';

export * from './types';

export const PeriodPickerLocaleHelper = new LocaleHelper<PeriodPickerLocale>({
  ru_RU,
  en_GB,
});
