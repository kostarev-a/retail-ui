import React, { AriaAttributes, HTMLAttributes } from 'react';
import FocusLock from 'react-focus-lock';
import throttle from 'lodash.throttle';
import { globalObject } from '@skbkontur/global-object';
import type { Emotion } from '@emotion/css/create-instance';

import { isNonNullable } from '../../lib/utils';
import { isKeyEscape } from '../../lib/events/keyboard/identifiers';
import * as LayoutEvents from '../../lib/LayoutEvents';
import { RenderContainer } from '../../internal/RenderContainer';
import { ZIndex } from '../../internal/ZIndex';
import { stopPropagation } from '../../lib/events/stopPropagation';
import { HideBodyVerticalScroll } from '../../internal/HideBodyVerticalScroll';
import { ModalStack, ModalStackSubscription } from '../../lib/ModalStack';
import { ResizeDetector } from '../../internal/ResizeDetector';
import { Theme, ThemeIn } from '../../lib/theming/Theme';
import { isIE11 } from '../../lib/client';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { EmotionConsumer } from '../../lib/theming/Emotion';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { ResponsiveLayout } from '../ResponsiveLayout';
import { ThemeContext } from '../../lib/theming/ThemeContext';

import { ModalContext, ModalContextProps } from './ModalContext';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalClose } from './ModalClose';
import { getStyles } from './Modal.styles';
import { getModalTheme } from './getModalTheme';

let mountedModalsCount = 0;

export interface ModalProps
  extends CommonProps,
    Pick<HTMLAttributes<unknown>, 'role'>,
    Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  /**
   * Отключает событие onClose, также дизейблит кнопку закрытия модалки
   */
  disableClose?: boolean;

  /**
   * Выравнивание окна по верху страницы.
   */
  alignTop?: boolean;

  /**
   * Не закрывать окно при клике на фон.
   */
  ignoreBackgroundClick?: boolean;

  /**
   * Не показывать крестик для закрытия окна.
   */
  noClose?: boolean;
  width?: number | string;

  /**
   * Вызывается, когда пользователь запросил закрытие окна (нажал на фон, на
   * Escape или на крестик).
   */
  onClose?: () => void;

  /**
   * Не использовать фокус-лок внутри модалки.
   * По умолчанию true для IE11.
   */
  disableFocusLock?: boolean;

  /**
   * Обычный объект с переменными темы.
   * Он будет объединён с темой из контекста.
   */
  theme?: ThemeIn;
}

export interface ModalState {
  stackPosition: number;
  hasBackground: boolean;
  horizontalScroll: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  hasPanel: boolean;
}

export const ModalDataTids = {
  container: 'modal-container',
  content: 'modal-content',
  close: 'modal-close',
} as const;

type DefaultProps = Required<Pick<ModalProps, 'disableFocusLock' | 'role'>>;

/**
 * Модальное окно
 *
 * Содержит в себе три компоненты: **Modal.Header**,
 * **Modal.Body** и **Modal.Footer**
 *
 * Для отображения серой плашки в футере в компонент
 * **Footer** необходимо передать пропс **panel**
 *
 * Для отключения прилипания шапки и футера
 * в соответствующий компонент нужно передать
 * проп **sticky** со значением **false**
 * (по-умолчанию прилипание включено)
 */
export class Modal extends React.Component<ModalProps, ModalState> {
  public static __KONTUR_REACT_UI__ = 'Modal';
  public static displayName = 'Modal';

  public static Header = ModalHeader;
  public static Body = ModalBody;
  public static Footer = ModalFooter;

  public static defaultProps: DefaultProps = {
    // NOTE: в ie нормально не работает
    disableFocusLock: isIE11,
    role: 'dialog',
  };

  private getProps = createPropsGetter(Modal.defaultProps);

  public state: ModalState = {
    stackPosition: 0,
    hasBackground: true,
    horizontalScroll: false,
    hasHeader: false,
    hasFooter: false,
    hasPanel: false,
  };

  private theme!: Theme;
  private emotion!: Emotion;
  private stackSubscription: ModalStackSubscription | null = null;
  private containerNode: HTMLDivElement | null = null;
  private mouseDownTarget: EventTarget | null = null;
  private mouseUpTarget: EventTarget | null = null;

  public componentDidMount() {
    this.stackSubscription = ModalStack.add(this, this.handleStackChange);

    if (mountedModalsCount === 0) {
      globalObject.addEventListener?.('resize', this.throttledCheckHorizontalScroll);
    }

    mountedModalsCount++;
    globalObject.addEventListener?.('keydown', this.handleKeyDown);
    this.checkHorizontalScrollAppearance();

    if (this.containerNode) {
      this.containerNode.addEventListener('scroll', LayoutEvents.emit);
    }
  }

  public componentWillUnmount() {
    if (--mountedModalsCount === 0) {
      globalObject.removeEventListener?.('resize', this.throttledCheckHorizontalScroll);
      LayoutEvents.emit();
    }

    globalObject.removeEventListener?.('keydown', this.handleKeyDown);
    if (isNonNullable(this.stackSubscription)) {
      this.stackSubscription.remove();
    }
    ModalStack.remove(this);

    if (this.containerNode) {
      this.containerNode.removeEventListener('scroll', LayoutEvents.emit);
    }
  }

  public render(): JSX.Element {
    return (
      <EmotionConsumer>
        {(emotion) => {
          this.emotion = emotion;
          return (
            <ThemeContext.Consumer>
              {(theme) => {
                this.theme = getModalTheme(theme, this.props.theme);
                return <ThemeContext.Provider value={this.theme}>{this.renderMain()}</ThemeContext.Provider>;
              }}
            </ThemeContext.Consumer>
          );
        }}
      </EmotionConsumer>
    );
  }

  private renderMain() {
    const {
      noClose,
      disableClose,
      width,
      alignTop,
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    } = this.props;
    const { hasHeader, hasFooter, hasPanel } = this.state;
    const { role, disableFocusLock } = this.getProps();

    const modalContextProps: ModalContextProps = {
      hasHeader,
      horizontalScroll: this.state.horizontalScroll,
      setHasHeader: this.setHasHeader,
      setHasFooter: this.setHasFooter,
      setHasPanel: this.setHasPanel,
    };
    if (!noClose) {
      modalContextProps.close = {
        disableClose,
        requestClose: this.requestClose,
      };
    }
    if (!hasFooter) {
      modalContextProps.additionalPadding = true;
    }
    if (hasFooter && hasPanel) {
      modalContextProps.additionalPadding = true;
    }

    const style: { width?: number | string } = {};
    const containerStyle: { width?: number | string } = {};

    if (width) {
      style.width = width;
    } else {
      containerStyle.width = 'auto';
    }

    const styles = getStyles(this.emotion);

    return (
      <RenderContainer>
        <CommonWrapper {...this.props}>
          <ZIndex priority={'Modal'} className={styles.root()}>
            <HideBodyVerticalScroll />
            {this.state.hasBackground && (
              <div
                onMouseDown={this.handleContainerMouseDown}
                onMouseUp={this.handleContainerMouseUp}
                onClick={this.handleContainerClick}
                className={styles.bg(this.theme)}
              />
            )}
            <ResponsiveLayout>
              {({ isMobile }) => (
                <div
                  aria-labelledby={ariaLabelledby}
                  ref={this.refContainer}
                  className={this.emotion.cx(styles.container(), isMobile && styles.containerMobile(this.theme))}
                  onMouseDown={this.handleContainerMouseDown}
                  onMouseUp={this.handleContainerMouseUp}
                  onClick={this.handleContainerClick}
                  data-tid={ModalDataTids.container}
                >
                  <div
                    aria-modal
                    aria-label={ariaLabel}
                    role={role}
                    className={this.emotion.cx({
                      [styles.centerContainer()]: true,
                      [styles.mobileCenterContainer()]: isMobile,
                      [styles.alignTop()]: Boolean(alignTop),
                    })}
                    style={isMobile ? undefined : containerStyle}
                    data-tid={ModalDataTids.content}
                  >
                    <div
                      className={this.emotion.cx({
                        [styles.window(this.theme)]: true,
                        [styles.mobileWindow()]: isMobile,
                      })}
                      style={isMobile ? undefined : style}
                    >
                      <ResizeDetector onResize={this.handleResize} fullHeight={isMobile}>
                        <FocusLock
                          disabled={disableFocusLock}
                          autoFocus={false}
                          className={this.emotion.cx(
                            { [styles.columnFlexContainer()]: isMobile },
                            'focus-lock-container',
                          )}
                        >
                          {!hasHeader && !noClose && (
                            <ZIndex
                              className={this.emotion.cx({
                                [styles.closeWrapper(this.theme)]: true,
                                [styles.mobileCloseWrapper(this.theme)]: isMobile,
                              })}
                            >
                              <ModalClose
                                className={this.emotion.cx({
                                  [styles.mobileCloseWithoutHeader()]: isMobile && !this.state.hasHeader,
                                })}
                                requestClose={this.requestClose}
                                disableClose={disableClose}
                              />
                            </ZIndex>
                          )}
                          <ModalContext.Provider value={modalContextProps}>{children}</ModalContext.Provider>
                        </FocusLock>
                      </ResizeDetector>
                    </div>
                  </div>
                </div>
              )}
            </ResponsiveLayout>
          </ZIndex>
        </CommonWrapper>
      </RenderContainer>
    );
  }

  private requestClose = () => {
    if (this.props.disableClose) {
      return;
    }
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  private refContainer = (center: HTMLDivElement | null) => {
    this.containerNode = center;
  };

  private handleStackChange = (stack: readonly React.Component[]) => {
    this.setState({ stackPosition: stack.indexOf(this), hasBackground: ModalStack.isBlocking(this) });
  };

  private handleContainerMouseDown = (event: React.MouseEvent) => {
    this.mouseDownTarget = event.target;
  };

  private handleContainerMouseUp = (event: React.MouseEvent) => {
    this.mouseUpTarget = event.target;
  };

  private handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.props.ignoreBackgroundClick) {
      const { target, currentTarget } = event;
      if (target === currentTarget && this.mouseDownTarget === currentTarget && this.mouseUpTarget === currentTarget) {
        this.requestClose();
      }
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.state.stackPosition !== 0) {
      return;
    }
    if (isKeyEscape(e)) {
      stopPropagation(e);
      this.requestClose();
    }
  };

  private checkHorizontalScrollAppearance = () => {
    let hasScroll = false;

    if (this.containerNode) {
      const containerClientWidth = this.containerNode.clientWidth;
      const containerScrollWidth = this.containerNode.scrollWidth;
      hasScroll = containerClientWidth < containerScrollWidth;
    }
    if (hasScroll && !this.state.horizontalScroll) {
      this.setState({ horizontalScroll: true });
    } else if (this.state.horizontalScroll) {
      this.setState({ horizontalScroll: false });
    }
  };

  private throttledCheckHorizontalScroll = throttle(this.checkHorizontalScrollAppearance, 100);

  private handleResize = () => {
    LayoutEvents.emit();
  };

  private setHasHeader = (hasHeader = true) => {
    this.state.hasHeader !== hasHeader && this.setState({ hasHeader });
  };

  private setHasFooter = (hasFooter = true) => {
    this.state.hasFooter !== hasFooter && this.setState({ hasFooter });
  };

  private setHasPanel = (hasPanel = false) => {
    this.state.hasPanel !== hasPanel && this.setState({ hasPanel });
  };
}
