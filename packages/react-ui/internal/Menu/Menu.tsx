import React, { CSSProperties, HTMLAttributes } from 'react';

import { isKeyArrowDown, isKeyArrowUp, isKeyEnter } from '../../lib/events/keyboard/identifiers';
import { MenuSeparator } from '../../components/MenuSeparator';
import { ThemeFactory } from '../../lib/theming/ThemeFactory';
import { getDOMRect } from '../../lib/dom/getDOMRect';
import { isHTMLElement } from '../../lib/SSRSafe';
import { responsiveLayout } from '../../components/ResponsiveLayout/decorator';
import { isNonNullable, isNullable } from '../../lib/utils';
import { ScrollContainer, ScrollContainerScrollState } from '../../components/ScrollContainer';
import { Nullable } from '../../typings/utility-types';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { cx } from '../../lib/theming/Emotion';
import { getRootNode, rootNode, TSetRootNode } from '../../lib/rootNode';
import { addIconPaddingIfPartOfMenu } from '../InternalMenu/addIconPaddingIfPartOfMenu';
import { isIE11 } from '../../lib/client';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { isIconPaddingEnabled } from '../InternalMenu/isIconPaddingEnabled';

import { styles } from './Menu.styles';
import { MenuNavigation } from './MenuNavigation';
import { MenuContext } from './MenuContext';

export interface MenuProps extends Pick<HTMLAttributes<HTMLDivElement>, 'id'> {
  children: React.ReactNode;
  hasShadow?: boolean;
  /**
   * Максимальная высота применяется только для скролл контейнера
   *
   * Высота `header` и `footer` в нее не включены
   */
  maxHeight?: number | string;
  onItemClick?: (event: React.SyntheticEvent<HTMLElement>) => void;
  width?: number | string;
  preventWindowScroll?: boolean;
  /**
   * Отключение кастомного скролла контейнера
   */
  disableScrollContainer?: boolean;
  align?: 'left' | 'right';
  /**
   * Предотвращает выравнивание текста всех пунктов меню относительно друг друга.
   * Так, если хотя бы у одного пункта меню есть иконка, текст в  остальных пунктах меню будет выровнен относительно пункта меню с иконкой
   */
  preventIconsOffset?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;

  header?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Циклический перебор айтемов меню (по-дефолтну включен)
   */
  cyclicSelection?: boolean;
  initialSelectedItemIndex?: number;
}

export interface MenuState {
  maxHeight: number | string;
  scrollState: ScrollContainerScrollState;
  isMounted: boolean;
}

export const MenuDataTids = {
  root: 'Menu__root',
} as const;

type DefaultProps = Required<
  Pick<
    MenuProps,
    | 'align'
    | 'width'
    | 'maxHeight'
    | 'hasShadow'
    | 'preventWindowScroll'
    | 'cyclicSelection'
    | 'initialSelectedItemIndex'
  >
>;

@responsiveLayout
@rootNode
export class Menu extends React.PureComponent<MenuProps, MenuState> {
  public static __KONTUR_REACT_UI__ = 'Menu';
  private menuNavigation: MenuNavigation | null = null;

  public static defaultProps: DefaultProps = {
    align: 'left',
    width: 'auto',
    maxHeight: 300,
    hasShadow: true,
    preventWindowScroll: true,
    cyclicSelection: true,
    initialSelectedItemIndex: -1,
  };

  private getProps = createPropsGetter(Menu.defaultProps);

  public state: MenuState = {
    maxHeight: this.getProps().maxHeight || 'none',
    scrollState: 'top',
    isMounted: false,
  };

  private theme!: Theme;
  private scrollContainer: Nullable<ScrollContainer>;
  private isMobileLayout!: boolean;

  private setRootNode!: TSetRootNode;
  private header: Nullable<HTMLDivElement>;
  private footer: Nullable<HTMLDivElement>;

  public componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  public componentDidMount() {
    this.setInitialSelection();
    this.calculateMaxHeight();
    this.menuNavigation = new MenuNavigation(getRootNode(this));
    this.setState({ isMounted: true });
  }

  public componentDidUpdate(prevProps: MenuProps) {
    if (this.shouldRecalculateMaxHeight(prevProps)) {
      this.calculateMaxHeight();
    }

    if (prevProps.maxHeight !== this.getProps().maxHeight) {
      this.setState({
        maxHeight: this.props.maxHeight || 'none',
      });
    }
  }

  public focus() {
    this.focusOnRootElement();
  }

  private focusOnRootElement = (): void => {
    const rootNode = getRootNode(this);
    if (isHTMLElement(rootNode)) {
      rootNode?.focus();
    }
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

  /**
   * @public
   */
  public up() {
    this.menuNavigation?.move(-1, this.getProps().cyclicSelection, this.scrollContainer);
  }

  /**
   * @public
   */
  public down() {
    this.menuNavigation?.move(1, this.getProps().cyclicSelection, this.scrollContainer);
  }

  /**
   * @public
   */
  public enter(event: React.SyntheticEvent<HTMLElement>) {
    return this.menuNavigation?.select(true, event, this.props.onItemClick);
  }

  /**
   * @public
   */
  public reset() {
    this.menuNavigation?.reset();
  }

  /**
   * @public
   */
  public hasHighlightedItem() {
    return !!this.menuNavigation?.highlightedItem;
  }

  public highlightItem(index: number) {
    this.menuNavigation?.highlightByIndex(index);
  }

  public scrollToSelected() {
    this.menuNavigation?.scrollToSelected?.(this.scrollContainer);
  }

  private renderMain() {
    if (this.isEmpty()) {
      return null;
    }
    const { hasShadow, maxHeight, preventWindowScroll } = this.getProps();

    const offsetY = isTheme2022(this.theme)
      ? {
          top: `${this.theme.scrollContainerScrollBarOffsetY}`,
          right: 0,
          bottom: `${this.theme.scrollContainerScrollBarOffsetY}`,
        }
      : {};

    const isMobile = this.isMobileLayout;
    return (
      <div
        data-tid={MenuDataTids.root}
        className={cx(getAlignRightClass(this.props), {
          [styles.root(this.theme)]: true,
          [styles.mobileRoot(this.theme)]: isMobile,
          [styles.shadow(this.theme)]: hasShadow && !isMobile,
        })}
        style={this.getStyle(this.props)}
        id={this.props.id}
        onKeyDown={this.handleKeyDown}
        ref={this.setRootNode}
        tabIndex={0}
      >
        {this.props.header && this.renderHeader()}
        <ScrollContainer
          ref={this.refScrollContainer}
          maxHeight={maxHeight}
          preventWindowScroll={preventWindowScroll}
          onScrollStateChange={this.handleScrollStateChange}
          disabled={this.props.disableScrollContainer}
          offsetY={offsetY}
        >
          <div
            className={cx({
              [styles.scrollContainer(this.theme)]: true,
              [styles.scrollContainerMobile(this.theme)]: isMobile,
            })}
          >
            <MenuContext.Provider
              value={{
                navigation: this.menuNavigation,
                onItemClick: this.props.onItemClick,
              }}
            >
              {this.getChildList()}
            </MenuContext.Provider>
          </div>
        </ScrollContainer>
        {this.props.footer && this.renderFooter()}
      </div>
    );
  }

  private renderHeader = () => {
    return (
      <div
        className={cx({
          [styles.wrapper()]: true,
          [styles.headerWrapper()]: true,
        })}
        ref={(el) => (this.header = el)}
      >
        <div className={styles.contentWrapper()}>{this.props.header}</div>
        <div className={styles.menuSeparatorWrapper(this.theme)}>
          {this.state.scrollState !== 'top' && this.renderMenuSeparatorWithNoMargin()}
        </div>
      </div>
    );
  };

  private renderFooter = () => {
    return (
      <div
        className={cx({
          [styles.wrapper()]: true,
          [styles.footerWrapper()]: true,
        })}
        ref={(el) => (this.footer = el)}
      >
        <div className={styles.menuSeparatorWrapper(this.theme)}>
          {this.state.scrollState !== 'bottom' && this.renderMenuSeparatorWithNoMargin()}
        </div>
        <div className={styles.contentWrapper()}>{this.props.footer}</div>
      </div>
    );
  };

  private renderMenuSeparatorWithNoMargin = () => {
    return (
      <ThemeContext.Provider value={ThemeFactory.create({ menuSeparatorMarginY: '0' }, this.theme)}>
        <MenuSeparator />
      </ThemeContext.Provider>
    );
  };

  private getChildList = () => {
    if (!this.state.isMounted) {
      return null;
    }
    const enableIconPadding = isIconPaddingEnabled(this.props.children, this.props.preventIconsOffset);

    return React.Children.map(this.props.children, (child) => {
      if (typeof child === 'string' || typeof child === 'number' || isNullable(child)) {
        return child;
      }

      return addIconPaddingIfPartOfMenu(child, enableIconPadding);
    });
  };

  private setInitialSelection = () => {
    for (let i = this.getProps().initialSelectedItemIndex; i > -1; i--) {
      setTimeout(() => this.down(), 0);
    }
  };

  private shouldRecalculateMaxHeight = (prevProps: MenuProps): boolean => {
    const { header, footer, children } = this.props;
    const maxHeight = this.getProps().maxHeight;
    const prevMaxHeight = prevProps.maxHeight;
    const prevHeader = prevProps.header;
    const prevFooter = prevProps.footer;
    const prevChildrenCount = React.Children.count(prevProps.children);

    return (
      maxHeight !== prevMaxHeight ||
      footer !== prevFooter ||
      header !== prevHeader ||
      React.Children.count(children) !== prevChildrenCount
    );
  };

  private calculateMaxHeight = () => {
    const maxHeight = this.getProps().maxHeight;
    let parsedMaxHeight = maxHeight;
    const rootNode = getRootNode(this);

    if (typeof maxHeight === 'string' && typeof window !== 'undefined' && rootNode) {
      const rootElementMaxHeight = window.getComputedStyle(rootNode).maxHeight;

      if (rootElementMaxHeight) {
        parsedMaxHeight = parseFloat(rootElementMaxHeight);
      }
    }

    const calculatedMaxHeight =
      typeof parsedMaxHeight === 'number'
        ? parsedMaxHeight +
          ((this.header && getDOMRect(this.header).height) || 0) +
          ((this.footer && getDOMRect(this.footer).height) || 0)
        : maxHeight;

    this.setState({
      maxHeight: calculatedMaxHeight || 'none',
    });
  };

  private refScrollContainer = (scrollContainer: Nullable<ScrollContainer>) => {
    this.scrollContainer = scrollContainer;
  };

  private isEmpty() {
    const { children } = this.props;
    return !children || !childrenToArray(children).filter(isNonNullable).length;
  }

  private handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (typeof this.props.onKeyDown === 'function') {
      this.props.onKeyDown(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (isKeyArrowUp(event)) {
      event.preventDefault();
      this.up();
    } else if (isKeyArrowDown(event)) {
      event.preventDefault();
      this.down();
    } else if (isKeyEnter(event)) {
      this.menuNavigation?.select(false, event, this.props.onItemClick);
    }
  };

  private getStyle = (props: MenuProps): CSSProperties => {
    if (props.align === 'right') {
      return {
        maxWidth: props.width,
        minWidth: props.width,
        maxHeight: this.state.maxHeight,
      };
    }

    return {
      width: props.width,
      maxHeight: this.state.maxHeight,
    };
  };

  private handleScrollStateChange = (scrollState: ScrollContainerScrollState) => {
    if (this.state.scrollState !== scrollState) {
      this.setState({ scrollState });
    }
  };
}

function childrenToArray(children: React.ReactNode): React.ReactNode[] {
  const ret: React.ReactNode[] = [];
  // Use forEach instead of map to avoid cloning for key unifying.
  React.Children.forEach(children, (child) => {
    ret.push(child);
  });
  return ret;
}

const getAlignRightClass = (props: MenuProps) => {
  if (props.align === 'right') {
    return cx({
      [styles.alignRight()]: !isIE11,
      [styles.alignRightIE11()]: isIE11,
      [styles.alignRightIE11FixAutoWidth()]: isIE11 && props.width === 'auto',
    });
  }

  return null;
};
