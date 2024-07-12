import { internalDateLocale } from '../../../../lib/date/localeSets';
import { LangCodes } from '../../../../lib/locale';
import { PeriodPickerLocale } from '../types';
import { componentsLocales as CalendarLocales } from '../../../Calendar/locale/locales/en';
import { componentsLocales as DateSelectLocales } from '../../../../internal/DateSelect/locale/locales/en';

export const componentsLocales: PeriodPickerLocale = {
  today: 'Today',
  todayAriaLabel: "Go to today's date",
  ...CalendarLocales,
  ...DateSelectLocales,
  ...internalDateLocale[LangCodes.en_GB],
};
