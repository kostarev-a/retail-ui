import { DateSelectLocale } from '../../../internal/DateSelect/locale';
import { InternalDateLocaleSet } from '../../../lib/date/types';
import { CalendarLocale } from '../../Calendar/locale/types';

export interface PeriodPickerLocale extends DateSelectLocale, CalendarLocale, InternalDateLocaleSet {
  today: string;
  todayAriaLabel: string;
}
