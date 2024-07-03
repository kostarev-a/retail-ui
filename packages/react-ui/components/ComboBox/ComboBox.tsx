import React, { AriaAttributes } from 'react';
import { ComboBoxViewPositionsType } from 'react-ui/internal/CustomComboBox/ComboBoxView';

import { CustomComboBox } from '../../internal/CustomComboBox';
import { Nullable } from '../../typings/utility-types';
import { MenuItemState } from '../MenuItem';
import { InputIconType } from '../Input';
import { CommonProps } from '../../internal/CommonWrapper';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { SizeProp } from '../../lib/types/props';

export interface ComboBoxProps<T> extends Pick<AriaAttributes, 'aria-describedby' | 'aria-label'>, CommonProps {
  align?: 'left' | 'center' | 'right';
  /**
   * Вызывает функцию поиска `getItems` при фокусе и очистке поля ввода
   * @default true
   */
  searchOnFocus?: boolean;
  /**
   * Рисует справа иконку в виде стрелки
   * @default true
   */
  drawArrow?: boolean;

  autoFocus?: boolean;

  borderless?: boolean;

  /**
   * Не использовать Portal для рендеринга меню.
   * См. https://github.com/skbkontur/retail-ui/issues/15
   * @default false
   */
  disablePortal?: boolean;

  disabled?: boolean;
  /**
   * Состояние валидации при ошибке.
   */
  error?: boolean;

  leftIcon?: InputIconType;

  rightIcon?: InputIconType;

  /**
   * Функция поиска элементов, должна возвращать Promise с массивом элементов.
   * По умолчанию ожидаются объекты с типом `{ value: string, label: string }`.
   *
   * Элементы могут быть любого типа. В этом случае необходимо определить
   * свойства `itemToValue`, `renderValue`, `renderItem`, `valueToString`
   */
  getItems: (query: string) => Promise<Array<ComboBoxExtendedItem<T>>>;

  /**
   * Необходим для сравнения полученных результатов с `value`
   * @default item => item.label
   */
  itemToValue?: (item: T) => string | number;

  maxLength?: number;

  positions?: Readonly<ComboBoxViewPositionsType[]>;

  onBlur?: () => void;

  /** Вызывается при изменении `value` */
  onValueChange?: (value: T) => void;

  onFocus?: () => void;

  /**
   * Вызывается при изменении текста в поле ввода,
   * если результатом функции будет строка,
   * то она станет следующим состоянием полем ввода
   */
  onInputValueChange?: (value: string) => Nullable<string> | void;

  /**
   * Функция для обработки ситуации, когда была введена
   * строка в инпут и был потерян фокус с элемента.
   *
   * Если при потере фокуса в выпадающем списке будет только один
   * элемент и  результат `renderValue` с этим элементом будет
   * совпадать со значение в текстовом поле, то
   * сработает onValueChange со значением данного элемента
   *
   * Сама функция также может вернуть значение,
   * неравное `undefined`,
   * с которым будет вызван onValueChange.
   */
  onUnexpectedInput?: (value: string) => void | null | T;

  placeholder?: string;

  /**
   * Функция отрисовки элементов результата поиска.
   * Не применяется если элемент является функцией или React-элементом
   * @default item => item.label
   */
  renderItem?: (item: T, state?: MenuItemState) => React.ReactNode;

  /**
   * Компонент, заменяющий собой обёртку элементов результата поиска.
   *
   * По умолчанию все элементы результата поиска оборачиваются в тег `<button />`.
   *
   * @example
   * itemWrapper={(item) => {
   *    if (item.value === 3) {
   *      return (props) => {
   *        return <a {...props} />
   *      }
   *    }
   * }}
   */
  itemWrapper?: (item: T) => React.ComponentType;

  /**
   * Функция для отрисовки сообщения о пустом результате поиска
   * Если есть renderAddButton - не работает
   */
  renderNotFound?: () => React.ReactNode;

  /**
   * Функция отображающая сообщение об общем количестве элементов.
   * `found` учитывает только компонент `MenuItem`. Им "оборачиваются" элементы, возвращаемые `getItems()`.
   */
  renderTotalCount?: (found: number, total: number) => React.ReactNode;

  /**
   * Функция отрисовки выбранного значения
   * @default item => item.label
   */
  renderValue?: (item: T) => React.ReactNode;

  /**
   * Функция отрисовки кнопки добавления в выпадающем списке
   */
  renderAddButton?: (query?: string) => React.ReactNode;

  /**
   * Общее количество элементов.
   * Необходим для работы `renderTotalCount`
   */
  totalCount?: number;

  /**
   * Выбранное значение
   * Ожидается, что `value` того же типа что и элементы в массиве,
   * возвращаемом в `getItems`
   */
  value?: Nullable<T>;

  /**
   * Необходим для преобразования `value` в строку при фокусировке
   * @default item => item.label
   */
  valueToString?: (item: T) => string;

  size?: SizeProp;
  /**
   * Состояние валидации при предупреждении.
   */
  warning?: boolean;

  width?: string | number;

  maxMenuHeight?: number | string;

  onMouseEnter?: (e: React.MouseEvent) => void;

  onMouseOver?: (e: React.MouseEvent) => void;

  onMouseLeave?: (e: React.MouseEvent) => void;

  onInputKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;

  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export interface ComboBoxItem {
  value: string;
  label: string;
}

export type ComboBoxExtendedItem<T> = T | (() => React.ReactElement<T>) | React.ReactElement<T>;

type DefaultProps<T> = Required<
  Pick<ComboBoxProps<T>, 'itemToValue' | 'valueToString' | 'renderValue' | 'renderItem' | 'searchOnFocus' | 'drawArrow'>
>;

@rootNode
export class ComboBox<T = ComboBoxItem> extends React.Component<ComboBoxProps<T>> {
  public static __KONTUR_REACT_UI__ = 'ComboBox';
  public static displayName = 'ComboBox';

  public static defaultProps: DefaultProps<any> = {
    itemToValue: (item: ComboBoxItem) => item.value,
    valueToString: (item: ComboBoxItem) => item.label,
    renderValue: (item: ComboBoxItem) => item.label,
    renderItem: (item: ComboBoxItem) => item.label,
    searchOnFocus: true,
    drawArrow: true,
  };

  private getProps = createPropsGetter(ComboBox.defaultProps);

  private comboboxElement: Nullable<CustomComboBox<T>> = null;
  private setRootNode!: TSetRootNode;

  /**
   * @public
   */
  public focus() {
    if (this.comboboxElement) {
      this.comboboxElement.focus();
    }
  }

  /**
   * @public
   */
  public blur() {
    if (this.comboboxElement) {
      this.comboboxElement.blur();
    }
  }

  /**
   * Открывает выпадающий список и запускает поиск элементов
   *
   * @public
   * @param {string} [query] Текст поиска. По умолчанию берется
   * текст из инпута или результат `valueToString(value)`
   */
  public search(query?: string) {
    if (this.comboboxElement) {
      this.comboboxElement.search(query);
    }
  }

  /**
   * @public
   */
  public cancelSearch() {
    if (this.comboboxElement) {
      this.comboboxElement.cancelSearch();
    }
  }

  /**
   * @public Открывает выпадающий список
   */
  public open() {
    if (this.comboboxElement) {
      this.comboboxElement.open();
    }
  }

  /**
   * @public Закрывает выпадающий список
   */
  public close() {
    if (this.comboboxElement) {
      this.comboboxElement.close();
    }
  }

  /**
   * Выделяет текст внутри input
   * @public
   */
  public selectInputText() {
    if (this.comboboxElement) {
      this.comboboxElement.selectInputText();
    }
  }

  /**
   * Сбрасывает введенное пользователем значение
   * @public
   */
  public reset() {
    if (this.comboboxElement) {
      this.comboboxElement.reset();
    }
  }

  public render() {
    return <CustomComboBox {...this.getProps()} size={this.props.size} ref={this.customComboBoxRef} />;
  }

  private customComboBoxRef = (element: Nullable<CustomComboBox<T>>) => {
    this.setRootNode(element);
    this.comboboxElement = element;
  };
}
