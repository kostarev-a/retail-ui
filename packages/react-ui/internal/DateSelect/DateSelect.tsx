import React from 'react';
import PropTypes from 'prop-types';
import { globalObject, isBrowser, SafeTimer } from '@skbkontur/global-object';

import { responsiveLayout } from '../../components/ResponsiveLayout/decorator';
import { CalendarDataTids } from '../../components/Calendar/Calendar';
import { getRandomID, isNonNullable } from '../../lib/utils';
import { isKeyEscape } from '../../lib/events/keyboard/identifiers';
import { DatePickerLocale, DatePickerLocaleHelper } from '../../components/DatePicker/locale';
import { locale } from '../../lib/locale/decorators';
import { RenderLayer } from '../RenderLayer';
import { DropdownContainer } from '../DropdownContainer';
import * as LayoutEvents from '../../lib/LayoutEvents';
import { Nullable } from '../../typings/utility-types';
import { Theme } from '../../lib/theming/Theme';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { ArrowTriangleUpDownIcon, ArrowChevronDownIcon, ArrowChevronUpIcon } from '../icons/16px';
import { isMobile } from '../../lib/client';
import { cx } from '../../lib/theming/Emotion';
import { getDOMRect } from '../../lib/dom/getDOMRect';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { ArrowCollapseCVOpenIcon16Regular } from '../icons2022/ArrowCollapseCVOpenIcon/ArrowCollapseCVOpenIcon16Regular';
import { ArrowCUpIcon16Regular } from '../icons2022/ArrowCUpIcon/ArrowCUpIcon16Regular';
import { ArrowCDownIcon16Regular } from '../icons2022/ArrowCDownIcon/ArrowCDownIcon16Regular';
import { isInstanceOf } from '../../lib/isInstanceOf';

import { globalClasses, styles } from './DateSelect.styles';

const itemHeight = 24;
const visibleYearsCount = 11;
const itemsToMoveCount = -5;
const monthsCount = 12;
const defaultMinMonth = 0;
const defaultMaxMonth = 11;
const defaultMinYear = 1900;
const defaultMaxYear = 2100;

export interface DateSelectProps {
  disabled?: boolean | null;
  onValueChange: (value: number) => void;
  type?: 'month' | 'year';
  value: number;
  width?: number | string;
  minValue?: number;
  maxValue?: number;
}

export interface DateSelectState {
  botCapped: boolean;
  current: Nullable<number>;
  height: number;
  opened: boolean;
  pos: number;
  top: number;
  topCapped: boolean;
  nodeTop: number;
}

const calculatePos = (pos: number, minPos: number, maxPos: number) => {
  if (maxPos <= pos) {
    return maxPos;
  }

  if (minPos >= pos) {
    return minPos;
  }

  return pos;
};

export const DateSelectDataTids = {
  caption: 'DateSelect__caption',
  menuItem: 'DateSelect__menuItem',
  menu: 'DateSelect__menu',
} as const;

type DefaultProps = Required<Pick<DateSelectProps, 'type' | 'width'>>;

@responsiveLayout
@locale('Calendar', DatePickerLocaleHelper)
export class DateSelect extends React.PureComponent<DateSelectProps, DateSelectState> {
  public static __KONTUR_REACT_UI__ = 'DateSelect';
  public static displayName = 'DateSelect';

  public static propTypes = {
    disabled: PropTypes.bool,

    type: PropTypes.string,

    value: PropTypes.number.isRequired,

    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    onValueChange: PropTypes.func,

    minValue: PropTypes.number,

    maxValue: PropTypes.number,
  };

  public static defaultProps: DefaultProps = {
    type: 'year',
    width: 'auto',
  };

  private getProps = createPropsGetter(DateSelect.defaultProps);

  public state = {
    botCapped: false,
    current: 0,
    height: 0,
    opened: false,
    pos: 0,
    top: 0,
    topCapped: false,
    nodeTop: Infinity,
  };

  private theme!: Theme;
  private readonly locale!: DatePickerLocale;
  private root: HTMLElement | null = null;
  private itemsContainer: HTMLElement | null = null;
  private listener: Nullable<ReturnType<typeof LayoutEvents.addListener>>;
  private timeout: SafeTimer;
  private longClickTimer: SafeTimer;
  private setPositionRepeatTimer: SafeTimer;
  private yearStep = 3;
  private touchStartY: Nullable<number> = null;
  private isMobileLayout!: boolean;

  public componentDidUpdate() {
    this.setNodeTop();
  }

  public componentDidMount() {
    this.listener = LayoutEvents.addListener(this.setNodeTop);
    this.setNodeTop();
    globalObject.addEventListener?.('keydown', this.handleKey);
  }

  public componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
    if (this.timeout) {
      globalObject.clearTimeout(this.timeout);
    }
    if (this.longClickTimer) {
      globalObject.clearTimeout(this.longClickTimer);
    }
    if (this.setPositionRepeatTimer) {
      globalObject.clearTimeout(this.setPositionRepeatTimer);
    }
    globalObject.removeEventListener?.('keydown', this.handleKey);
  }

  /**
   * @public
   */
  public open = () => {
    if (this.props.disabled) {
      return;
    }

    if (this.state.opened) {
      return;
    }

    this.setPosition(0);
    this.setState({
      opened: true,
      current: 0,
    });
  };

  /**
   * @public
   */
  public close = () => {
    if (!this.state.opened) {
      return;
    }

    this.setState({ opened: false });
  };

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeContext.Consumer>
    );
  }

  private menuId = DateSelectDataTids.menu + getRandomID();

  private renderMain() {
    if (isTheme2022(this.theme)) {
      return this.renderMain2022();
    }
    const isMobile = this.isMobileLayout;
    const { disabled } = this.props;
    const width = this.getProps().width;
    const isInteractiveElement = !disabled;
    const Tag = isInteractiveElement ? 'button' : 'span';
    const rootProps = {
      className: cx({
        [styles.root(this.theme)]: true,
        [styles.disabled()]: Boolean(disabled),
      }),
      style: { width },
      ref: this.refRoot,
      onClick: this.open,
      'aria-expanded': isInteractiveElement ? this.state.opened : undefined,
      'aria-controls': !disabled ? this.menuId : undefined,
      'aria-label': isInteractiveElement
        ? `${this.locale.selectChosenAriaLabel} ${
            this.getProps().type === 'year' ? this.locale.selectYearAriaLabel : this.locale.selectMonthAriaLabel
          } ${this.getItem(0)}`
        : undefined,
    };

    return (
      <Tag {...rootProps}>
        <div data-tid={DateSelectDataTids.caption} className={styles.caption()}>
          {this.getItem(0)}
          <div
            className={cx({
              [styles.arrow(this.theme)]: true,
              [styles.arrowDisabled()]: Boolean(disabled),
            })}
          >
            <ArrowTriangleUpDownIcon size={12} />
          </div>
        </div>
        {isMobile
          ? !disabled && this.renderMobileMenu(this.props, this.menuId)
          : this.state.opened && this.renderMenu(this.menuId)}
      </Tag>
    );
  }

  private renderMain2022() {
    const isMobile = this.isMobileLayout;
    const { disabled } = this.props;
    const width = this.getProps().width;
    const isInteractiveElement = !disabled;
    const Tag = isInteractiveElement ? 'button' : 'span';
    const rootProps = {
      className: cx(styles.root(this.theme), styles.root2022(), disabled && styles.disabled()),
      style: { width },
      ref: this.refRoot,
      onClick: this.open,
      'aria-expanded': isInteractiveElement ? this.state.opened : undefined,
      'aria-label': isInteractiveElement
        ? `${this.locale.selectChosenAriaLabel} ${
            this.getProps().type === 'year' ? this.locale.selectYearAriaLabel : this.locale.selectMonthAriaLabel
          } ${this.getItem(0)}`
        : undefined,
    };

    return (
      <Tag {...rootProps}>
        <div data-tid={DateSelectDataTids.caption} className={styles.caption()}>
          {this.getItem(0)}
        </div>
        {isInteractiveElement && (
          <ArrowCollapseCVOpenIcon16Regular className={cx(globalClasses.arrow)} color="#ADADAD" />
        )}
        {isMobile
          ? !disabled && this.renderMobileMenu(this.props, this.menuId)
          : this.state.opened && this.renderMenu(this.menuId)}
      </Tag>
    );
  }

  private refRoot = (element: HTMLElement | null) => {
    this.root = element;
  };

  private setNodeTop = () => {
    const root = this.root;
    if (!root) {
      return;
    }
    if (this.timeout) {
      globalObject.clearTimeout(this.timeout);
    }
    this.timeout = globalObject.setTimeout(
      () =>
        this.setState({
          nodeTop: getDOMRect(root).top,
        }),
      0,
    );
  };

  private disableItems(index: number) {
    const value = this.props.value + index;
    if (isNonNullable(this.props.maxValue) && isNonNullable(this.props.minValue)) {
      return value > this.props.maxValue || value < this.props.minValue;
    }

    if (isNonNullable(this.props.minValue)) {
      return value < this.props.minValue;
    }

    if (isNonNullable(this.props.maxValue)) {
      return value > this.props.maxValue;
    }
  }

  private renderMenu(id?: string): React.ReactNode {
    const { top, height, nodeTop } = this.state;

    let shift = this.state.pos % itemHeight;
    if (shift < 0) {
      shift += itemHeight;
    }

    const from = (this.state.pos - shift + top) / itemHeight;
    const to = from + Math.ceil((height + shift) / itemHeight);
    const items = [];

    for (let i = from; i < to; ++i) {
      const disableItems = this.disableItems(i) || false;
      const className = cx({
        [styles.menuItem(this.theme)]: true,
        [styles.menuItemSelected(this.theme)]: i === 0,
        [styles.menuItemActive(this.theme)]: i === this.state.current,
        [styles.menuItemDisabled(this.theme)]: disableItems,
      });
      const clickHandler = {
        onMouseDown: preventDefault,
        onClick: this.handleItemClick(i),
      };
      items.push(
        <button
          aria-label={`Выбрать ${this.getProps().type === 'year' ? 'год' : 'месяц'} ${this.getItem(i)}`}
          data-tid={DateSelectDataTids.menuItem}
          data-prop-disabled={disableItems}
          key={i}
          className={className}
          onMouseEnter={() => this.setState({ current: i })}
          onMouseLeave={() => this.setState({ current: null })}
          {...clickHandler}
        >
          {this.getItem(i)}
        </button>,
      );
    }
    const style: {
      left?: number | string;
      right?: number | string;
      top: number;
      width?: number | string;
    } = {
      top: top - 5,
      left: 0,
      right: 0,
    };

    const shiftStyle: React.CSSProperties = {
      position: 'relative',
      top: -shift,
    };

    const holderClass = cx({
      [styles.menuHolder(this.theme)]: true,
      [styles.isTopCapped()]: this.state.topCapped,
      [styles.isBotCapped()]: this.state.botCapped,
    });

    let dropdownOffset = -itemHeight;
    if (nodeTop < -top) {
      const overflowOffsetDelta = this.state.topCapped ? 6 : 17;
      dropdownOffset -= nodeTop + top - overflowOffsetDelta;
    }

    const iconUp = isTheme2022(this.theme) ? <ArrowCUpIcon16Regular color="#ADADAD" /> : <ArrowChevronUpIcon />;
    const iconDown = isTheme2022(this.theme) ? <ArrowCDownIcon16Regular color="#ADADAD" /> : <ArrowChevronDownIcon />;

    return (
      <RenderLayer onClickOutside={this.close} onFocusOutside={this.close} active>
        <DropdownContainer
          data-tid={DateSelectDataTids.menu}
          id={id}
          getParent={this.getAnchor}
          offsetY={dropdownOffset}
          offsetX={-10}
        >
          <div className={holderClass} style={style}>
            {!this.state.topCapped && (
              <div
                className={cx(styles.menu(this.theme), styles.menuUp())}
                onClick={this.handleUp}
                onMouseDown={this.handleLongClickUp}
                onMouseUp={this.handleLongClickStop}
                onMouseLeave={this.handleLongClickStop}
                onTouchStart={this.handleLongClickUp}
                onTouchEnd={this.handleLongClickStop}
              >
                <span>{iconUp}</span>
              </div>
            )}
            <div className={styles.itemsHolder()} style={{ height }}>
              <div ref={this.refItemsContainer} style={shiftStyle}>
                {items}
              </div>
            </div>
            {!this.state.botCapped && (
              <div
                className={cx(styles.menu(this.theme), styles.menuDown())}
                onClick={this.handleDown}
                onMouseDown={this.handleLongClickDown}
                onMouseUp={this.handleLongClickStop}
                onMouseLeave={this.handleLongClickStop}
                onTouchStart={this.handleLongClickDown}
                onTouchEnd={this.handleLongClickStop}
              >
                <span>{iconDown}</span>
              </div>
            )}
          </div>
        </DropdownContainer>
      </RenderLayer>
    );
  }

  private renderMobileMenu(
    { value, minValue, maxValue, onValueChange, type }: DateSelectProps,
    id?: string,
  ): JSX.Element {
    const from = type === 'month' ? defaultMinMonth : minValue ?? defaultMinYear;
    const to = type === 'month' ? defaultMaxMonth : maxValue ?? defaultMaxYear;

    const min = type === 'month' ? minValue ?? defaultMinMonth : minValue ?? defaultMinYear;
    const max = type === 'month' ? maxValue ?? defaultMaxMonth : maxValue ?? defaultMaxYear;

    const items: Array<{ item: number; disabled: boolean }> = [];
    for (let item = from; item <= to; ++item) {
      items.push({ item, disabled: item < min || item > max });
    }

    return (
      <select
        id={id}
        data-tid={type === 'month' ? CalendarDataTids.monthSelectMobile : CalendarDataTids.yearSelectMobile}
        className={styles.nativeSelect()}
        value={value}
        onChange={(e) => {
          onValueChange(parseInt(e.target.value));
        }}
      >
        {items.map(({ item, disabled }) => (
          <option key={item} value={item} disabled={disabled}>
            {type === 'month' ? this.locale.months?.[item] : item}
          </option>
        ))}
      </select>
    );
  }

  private refItemsContainer = (element: HTMLElement | null) => {
    if (!this.itemsContainer && element) {
      element.addEventListener('wheel', this.handleWheel, { passive: false });
    }
    if (this.itemsContainer && !element) {
      this.itemsContainer.removeEventListener('wheel', this.handleWheel);
    }

    if (isMobile) {
      if (!this.itemsContainer && element) {
        element.addEventListener('touchstart', this.handleTouchStart);
        element.addEventListener('touchmove', this.handleTouchMove);
      }
      if (this.itemsContainer && !element) {
        this.itemsContainer.removeEventListener('touchstart', this.handleTouchStart);
        this.itemsContainer.removeEventListener('touchmove', this.handleTouchMove);
      }
    }

    this.itemsContainer = element;
  };

  private handleLongClickUp = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    this.longClickTimer = globalObject.setTimeout(() => {
      this.setPositionRepeatTimer = globalObject.setInterval(() => this.setPosition(this.state.pos - itemHeight), 100);
    }, 200);
  };

  private handleLongClickDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    this.longClickTimer = globalObject.setTimeout(() => {
      this.setPositionRepeatTimer = globalObject.setInterval(() => this.setPosition(this.state.pos + itemHeight), 100);
    }, 200);
  };

  private handleLongClickStop = () => {
    globalObject.clearTimeout(this.longClickTimer);
    globalObject.clearTimeout(this.setPositionRepeatTimer);
  };

  private getAnchor = () => this.root;

  private handleWheel = (event: Event) => {
    if (!isInstanceOf(event, globalObject.WheelEvent)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    let deltaY = event.deltaY;
    if (event.deltaMode === 1) {
      deltaY *= itemHeight;
    } else if (event.deltaMode === 2) {
      deltaY *= itemHeight * 4;
    }
    const pos = this.state.pos + deltaY;
    this.setPosition(pos);
  };

  private handleTouchStart = (event: Event) => {
    if (!isInstanceOf(event, globalObject.TouchEvent)) {
      return;
    }

    this.touchStartY = event.targetTouches[0].clientY;
  };

  private handleTouchMove = (event: Event) => {
    if (!isInstanceOf(event, globalObject.TouchEvent) || !isBrowser(globalObject)) {
      return;
    }

    const { clientY } = event.changedTouches[0];
    const pixelRatio = globalObject.devicePixelRatio;

    const deltaY = ((this.touchStartY || 0) - clientY) / pixelRatio;
    const pos = this.state.pos + deltaY + deltaY / itemHeight;

    this.touchStartY = clientY;

    this.setPosition(pos);
  };

  private handleItemClick = (shift: number) => {
    return () => {
      const value = this.props.value + shift;
      if (this.props.onValueChange) {
        this.props.onValueChange(value);
      }
      this.setState({ opened: false });
    };
  };

  private handleKey = (e: KeyboardEvent) => {
    if (this.state.opened && isKeyEscape(e)) {
      e.preventDefault();
      this.close();
      e.stopPropagation();
    }
  };

  private handleUp = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setPosition(this.state.pos - itemHeight * this.yearStep);
  };

  private handleDown = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setPosition(this.state.pos + itemHeight * this.yearStep);
  };

  private getItem(index: number) {
    const value = this.props.value + index;
    if (this.getProps().type === 'month') {
      return this.locale.months?.[value];
    }
    return value;
  }

  private setPosition(pos: number) {
    let top = itemsToMoveCount * itemHeight;
    let height = visibleYearsCount * itemHeight;
    if (this.getProps().type === 'month') {
      top = -this.props.value * itemHeight;
      height = monthsCount * itemHeight;
    }

    const minPos = this.getMinPos() - top;
    const maxPos = this.getMaxPos() - top - height + itemHeight;

    const calculatedPos = calculatePos(pos, minPos, maxPos);
    const topCapped = calculatedPos <= minPos;
    const botCapped = calculatedPos >= maxPos;

    this.setState({ pos: calculatedPos, top, height, topCapped, botCapped });
  }

  private getMinPos() {
    const type = this.getProps().type;
    if (type === 'month') {
      return -this.props.value * itemHeight;
    } else if (type === 'year') {
      return ((this.props.minValue || defaultMinYear) - this.props.value) * itemHeight;
    }
    return -Infinity; // Be defensive.
  }

  private getMaxPos() {
    const type = this.getProps().type;
    if (type === 'month') {
      return (visibleYearsCount - this.props.value) * itemHeight;
    } else if (type === 'year') {
      return ((this.props.maxValue || defaultMaxYear) - this.props.value) * itemHeight;
    }
    return Infinity; // Be defensive.
  }
}

function preventDefault(e: React.SyntheticEvent) {
  e.preventDefault();
}
