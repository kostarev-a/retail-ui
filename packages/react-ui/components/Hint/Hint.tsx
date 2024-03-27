import React from 'react';
import { globalObject, SafeTimer } from '@skbkontur/global-object';

import {
  ReactUIFeatureFlags,
  ReactUIFeatureFlagsContext,
  getFullReactUIFlagsContext,
} from '../../lib/featureFlagsContext';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { ThemeFactory } from '../../lib/theming/ThemeFactory';
import { Theme } from '../../lib/theming/Theme';
import { DUMMY_LOCATION, Popup, PopupPositionsType } from '../../internal/Popup';
import { Nullable } from '../../typings/utility-types';
import { MouseEventType } from '../../typings/event-types';
import { isTestEnv } from '../../lib/currentEnvironment';
import { CommonWrapper, CommonProps } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { InstanceWithAnchorElement } from '../../lib/InstanceWithAnchorElement';
import { createPropsGetter } from '../../lib/createPropsGetter';

import { styles } from './Hint.styles';

const HINT_BORDER_COLOR = 'transparent';

export interface HintProps extends CommonProps {
  children?: React.ReactNode;
  /**
   * Переводит отображение подсказки в _"ручной режим"_.
   *
   * В _"ручном режиме"_ подсказку можно активировать только задав значение пропу `opened`.
   */
  manual?: boolean;
  /**
   * Задаёт максимальную ширину подсказки.
   */
  maxWidth?: React.CSSProperties['maxWidth'];
  /**
   * HTML-событие `mouseenter`.
   */
  onMouseEnter?: (event: MouseEventType) => void;
  /**
   * HTML-событие `mouseleave`.
   */
  onMouseLeave?: (event: MouseEventType) => void;
  /**
   * Если `true` - подсказка будет открыта.
   *
   * _Примечание_: работает только при `manual=true`.
   */
  opened?: boolean;
  /**
   * Приоритетное расположение подсказки относительно текста.
   *
   * **Допустимые значения**: `"top"`, `"right"`, `"bottom"`, `"left"`, `"top left"`, `"top center"`, `"top right"`, `"right top"`, `"right middle"`, `"right bottom"`, `"bottom left"`, `"bottom center"`, `"bottom right"`, `"left top"`, `"left middle"`, `"left bottom"`.
   */
  pos?: PopupPositionsType;
  /**
   * Текст подсказки.
   */
  text: React.ReactNode;
  /**
   Список позиций, которые Hint может занимать. Если положение Hint'а в определенной позиции будет выходить за край экрана, то будет выбрана следующая позиция. Обязательно должен включать позицию указанную в `pos`.
   */
  allowedPositions?: PopupPositionsType[];
  /**
   * Отключает анимацию.
   */
  disableAnimations?: boolean;
  /**
   * Явно указывает, что вложенные элементы должны быть обёрнуты в `<span/>`. <br/> Используется для корректного позиционирования хинта при двух и более вложенных элементах.
   *
   * _Примечание_: при **двух и более** вложенных элементах обёртка будет добавлена автоматически.
   */
  useWrapper?: boolean;
}

export interface HintState {
  opened: boolean;
  position: PopupPositionsType;
}

/**
 * @deprecated This variable will be removed in the next version because of applying popupUnifyPositioning feature flag.
 */
const Positions: PopupPositionsType[] = [
  'top center',
  'top left',
  'top right',
  'bottom center',
  'bottom left',
  'bottom right',
  'left middle',
  'left top',
  'left bottom',
  'right middle',
  'right top',
  'right bottom',
];

type DefaultProps = Required<Pick<HintProps, 'manual' | 'opened' | 'maxWidth' | 'disableAnimations' | 'useWrapper'>>;

/**
 * Всплывающая подсказка, которая по умолчанию отображается при наведении на элемент. <br/> Можно задать другие условия отображения.
 */
@rootNode
export class Hint extends React.PureComponent<HintProps, HintState> implements InstanceWithAnchorElement {
  public static __KONTUR_REACT_UI__ = 'Hint';

  public static defaultProps: DefaultProps = {
    manual: false,
    opened: false,
    maxWidth: 200,
    disableAnimations: isTestEnv,
    useWrapper: false,
  };

  private getProps = createPropsGetter(Hint.defaultProps);

  public state: HintState = {
    opened: this.getProps().manual ? !!this.getProps().opened : false,
    position: DUMMY_LOCATION.position,
  };

  private timer: SafeTimer;
  private theme!: Theme;
  private featureFlags!: ReactUIFeatureFlags;
  private setRootNode!: TSetRootNode;

  private popupRef = React.createRef<Popup>();

  public componentDidUpdate(prevProps: HintProps) {
    const { opened, manual } = this.getProps();
    if (!manual) {
      return;
    }
    if (this.timer) {
      globalObject.clearTimeout(this.timer);
      this.timer = null;
    }
    if (opened !== prevProps.opened) {
      this.setState({ opened: !!opened });
    }
  }

  public componentWillUnmount() {
    if (this.timer) {
      globalObject.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public render() {
    return (
      <ReactUIFeatureFlagsContext.Consumer>
        {(flags) => {
          this.featureFlags = getFullReactUIFlagsContext(flags);
          return (
            <ThemeContext.Consumer>
              {(theme) => {
                this.theme = theme;
                return (
                  <ThemeContext.Provider
                    value={ThemeFactory.create(
                      {
                        popupPinOffset: theme.hintPinOffset,
                        popupMargin: theme.hintMargin,
                        popupBorder: theme.hintBorder,
                        popupBorderRadius: theme.hintBorderRadius,
                      },
                      this.theme,
                    )}
                  >
                    {this.renderMain()}
                  </ThemeContext.Provider>
                );
              }}
            </ThemeContext.Consumer>
          );
        }}
      </ReactUIFeatureFlagsContext.Consumer>
    );
  }

  public renderMain() {
    const { disableAnimations, useWrapper } = this.getProps();
    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <Popup
          hasPin
          opened={this.state.opened}
          anchorElement={this.props.children}
          pos={this.props.pos}
          positions={this.getPositions()}
          backgroundColor={this.theme.hintBgColor}
          borderColor={HINT_BORDER_COLOR}
          onPositionChange={(position) => this.setState({ position })}
          disableAnimations={disableAnimations}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          useWrapper={useWrapper}
          ref={this.popupRef}
          withoutMobile
        >
          {this.renderContent()}
        </Popup>
      </CommonWrapper>
    );
  }

  public getAnchorElement = (): Nullable<Element> => {
    return this.popupRef.current?.anchorElement;
  };

  private renderContent() {
    if (!this.props.text) {
      return null;
    }

    const { maxWidth } = this.getProps();
    const centerAlignPositions = ['top', 'top center', 'bottom', 'bottom center'];
    const className = cx({
      [styles.content(this.theme)]: true,
      [styles.contentCenter(this.theme)]: centerAlignPositions.includes(this.state.position),
    });
    return (
      <div className={className} style={{ maxWidth }}>
        {this.props.text}
      </div>
    );
  }

  private getPositions = (): PopupPositionsType[] | undefined => {
    if (this.featureFlags.popupUnifyPositioning) {
      const { allowedPositions, pos } = this.props;
      if (allowedPositions && pos) {
        const index = allowedPositions.indexOf(pos);
        if (index === -1) {
          throw new Error('Unexpected position passed to Hint. Expected one of: ' + allowedPositions.join(', '));
        }
      }
      return allowedPositions;
    }
    return Positions.filter((x) => x.startsWith(this.props.pos ?? 'top'));
  };

  private handleMouseEnter = (e: MouseEventType) => {
    if (!this.getProps().manual && !this.timer) {
      this.timer = globalObject.setTimeout(this.open, 400);
    }

    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e);
    }
  };

  private handleMouseLeave = (e: MouseEventType) => {
    if (!this.getProps().manual && this.timer) {
      globalObject.clearTimeout(this.timer);
      this.timer = null;
      this.setState({ opened: false });
    }

    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(e);
    }
  };

  private open = () => {
    this.setState({ opened: true });
  };
}
