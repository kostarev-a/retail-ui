import React from 'react';

import { ThemeContext } from '../../lib/theming/ThemeContext';
import type { Theme } from '../../lib/theming/Theme';
import { ZIndex } from '../../internal/ZIndex';
import type { CommonProps } from '../../internal/CommonWrapper';
import { CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { responsiveLayout } from '../ResponsiveLayout/decorator';
import * as LayoutEvents from '../../lib/LayoutEvents';
import { ResizeDetector } from '../../internal/ResizeDetector';
import type { TSetRootNode } from '../../lib/rootNode';
import { rootNode } from '../../lib/rootNode';

import { ModalContext } from './ModalContext';
import { styles } from './Modal.styles';
import { getModalBodyTheme } from './getModalBodyTheme';

export interface ModalBodyProps extends CommonProps {
  /**
   * убирает отступы
   */
  noPadding?: boolean;
}

/**
 * Контейнер с отступами от края модалки
 *
 * @visibleName Modal.Body
 */
@responsiveLayout
@rootNode
export class ModalBody extends React.Component<ModalBodyProps> {
  public static __KONTUR_REACT_UI__ = 'ModalBody';
  public static displayName = 'ModalBody';
  public static __MODAL_BODY__ = true;

  private theme!: Theme;
  private isMobileLayout!: boolean;
  private setRootNode!: TSetRootNode;

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = getModalBodyTheme(theme);
          return <ThemeContext.Provider value={this.theme}>{this.renderMain()}</ThemeContext.Provider>;
        }}
      </ThemeContext.Consumer>
    );
  }

  private handleResize = () => {
    LayoutEvents.emit();
  };

  public renderMain(): JSX.Element {
    const { noPadding } = this.props;
    return (
      <ModalContext.Consumer>
        {({ additionalPadding, hasHeader }) => (
          <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
            <ZIndex
              className={cx({
                [styles.body(this.theme)]: true,
                [styles.mobileBody(this.theme)]: this.isMobileLayout,
                [styles.bodyWithoutHeader(this.theme)]: !hasHeader,
                [styles.mobileBodyWithoutHeader()]: !hasHeader && this.isMobileLayout,
                [styles.bodyAddPaddingForPanel(this.theme)]: additionalPadding,
                [styles.mobileBodyAddPaddingForPanel(this.theme)]: additionalPadding && this.isMobileLayout,
                [styles.bodyWithoutPadding()]: noPadding,
              })}
            >
              {this.isMobileLayout ? (
                <ResizeDetector onResize={this.handleResize}>{this.props.children}</ResizeDetector>
              ) : (
                this.props.children
              )}
            </ZIndex>
          </CommonWrapper>
        )}
      </ModalContext.Consumer>
    );
  }
}
