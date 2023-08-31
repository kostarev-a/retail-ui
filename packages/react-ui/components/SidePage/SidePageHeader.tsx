import React from 'react';

import { Sticky } from '../Sticky';
import { isFunction } from '../../lib/utils';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { responsiveLayout } from '../ResponsiveLayout/decorator';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { getDOMRect } from '../../lib/dom/getDOMRect';
import { ModalSeparator } from '../Modal/ModalSeparator';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { globalThat } from '../../lib/globalThat';

import { styles } from './SidePage.styles';
import { SidePageContext, SidePageContextType } from './SidePageContext';
import { SidePageCloseButton } from './SidePageCloseButton';

export interface SidePageHeaderProps extends Omit<CommonProps, 'children'> {
  children?: React.ReactNode | ((fixed: boolean) => React.ReactNode);
  sticky?: boolean;
  hasSeparator?: boolean;
}

export interface SidePageHeaderState {
  isReadyToFix: boolean;
}

export const SidePageHeaderDataTids = {
  root: 'SidePageHeader__root',
  close: 'SidePage__close',
} as const;

/**
 * Шапка сайдпейджа
 *
 * @visibleName SidePage.Header
 */
@responsiveLayout
@rootNode
export class SidePageHeader extends React.Component<SidePageHeaderProps, SidePageHeaderState> {
  public static __KONTUR_REACT_UI__ = 'SidePageHeader';

  public static contextType = SidePageContext;
  public context: SidePageContextType = this.context;

  private isMobileLayout!: boolean;

  public state: SidePageHeaderState = {
    isReadyToFix: false,
  };

  public static defaultProps: Partial<SidePageHeaderProps> = {
    hasSeparator: false,
  };

  private theme!: Theme;
  private wrapper: HTMLElement | null = null;
  private sticky: Sticky | null = null;
  private lastRegularHeight = 0;
  private setRootNode!: TSetRootNode;

  public get regularHeight(): number {
    const { isReadyToFix } = this.state;
    if (!this.wrapper) {
      return 0;
    }
    if (!isReadyToFix) {
      this.lastRegularHeight = getDOMRect(this.wrapper).height;
    }
    return this.lastRegularHeight;
  }

  public get fixedHeaderHeight(): number {
    const { theme } = this;
    return parseInt(theme.sidePageHeaderFixedLineHeight) + parseInt(theme.sidePageHeaderFixedPaddingY) * 2;
  }

  public componentDidMount = () => {
    globalThat.addEventListener('scroll', this.update, true);
    this.context.setHasHeader?.();
    this.context.headerRef(this);
  };

  public componentWillUnmount = () => {
    globalThat.removeEventListener('scroll', this.update, true);
    this.context.setHasHeader?.(false);
    this.context.headerRef(null);
  };

  public update = () => {
    this.sticky?.reflow();
    this.updateReadyToFix();
  };

  public render(): JSX.Element {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeContext.Consumer>
    );
  }

  public getStickyProp() {
    if (typeof this.props.sticky !== 'undefined') {
      return this.props.sticky;
    }

    if (this.isMobileLayout) {
      return false;
    }

    return true;
  }

  private renderMain() {
    const { isReadyToFix } = this.state;

    const isStickyDesktop = !this.isMobileLayout && this.getStickyProp() && isReadyToFix;
    const isStickyMobile = this.isMobileLayout && this.getStickyProp();

    const header = isTheme2022(this.theme) ? this.renderHeader2022 : this.renderHeader;

    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <div data-tid={SidePageHeaderDataTids.root} ref={this.wrapperRef} className={styles.headerWrapper()}>
          {isStickyDesktop || isStickyMobile ? (
            <Sticky ref={this.stickyRef} side="top">
              {header}
            </Sticky>
          ) : (
            header()
          )}
        </div>
      </CommonWrapper>
    );
  }

  private renderHeader = (fixed = false) => {
    return (
      <div
        className={cx(styles.header(this.theme), {
          [styles.headerFixed(this.theme)]: fixed,
          [styles.mobileHeader(this.theme)]: this.isMobileLayout,
        })}
      >
        {this.renderClose(fixed)}
        <div
          className={cx(styles.title(this.theme), {
            [styles.mobileTitle(this.theme)]: this.isMobileLayout,
            [styles.titleFixed()]: fixed,
          })}
        >
          {isFunction(this.props.children) ? this.props.children(fixed) : this.props.children}
        </div>
      </div>
    );
  };

  private renderHeader2022 = (fixed = false) => {
    const isDisplayed = this.props.hasSeparator || fixed;
    return (
      <div>
        {this.renderHeader(fixed)}
        {isDisplayed && <ModalSeparator fixed={fixed} />}
      </div>
    );
  };

  private renderClose = (fixed: boolean) => {
    const stickyOffset = parseInt(this.theme.sidePageHeaderStickyOffset);
    return (
      <div
        className={cx(styles.wrapperClose(this.theme), {
          [styles.wrapperCloseFixed(this.theme)]: fixed,
          [styles.mobileWrapperClose(this.theme)]: this.isMobileLayout,
        })}
      >
        {this.isMobileLayout ? (
          <SidePageCloseButton />
        ) : (
          <Sticky side="top" offset={stickyOffset}>
            <SidePageCloseButton />
          </Sticky>
        )}
      </div>
    );
  };

  private updateReadyToFix = () => {
    if (this.wrapper) {
      const wrapperScrolledUp = getDOMRect(this.wrapper).top;
      const isReadyToFix = this.regularHeight + wrapperScrolledUp <= this.fixedHeaderHeight;
      this.setState((state) => (state.isReadyToFix !== isReadyToFix ? { ...state, isReadyToFix } : state));
    }
  };

  private wrapperRef = (el: HTMLElement | null) => {
    this.wrapper = el;
  };

  private stickyRef = (el: Sticky | null) => {
    this.sticky = el;
  };
}
