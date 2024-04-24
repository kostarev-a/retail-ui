import React from 'react';
import { globalObject, SafeTimer } from '@skbkontur/global-object';
import isEqual from 'lodash.isequal';

import {
  getFullReactUIFlagsContext,
  ReactUIFeatureFlags,
  ReactUIFeatureFlagsContext,
} from '../../lib/featureFlagsContext';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { ThemeFactory } from '../../lib/theming/ThemeFactory';
import { Theme } from '../../lib/theming/Theme';
import { DUMMY_LOCATION, Popup, PopupPositionsType, ShortPopupPositionsType } from '../../internal/Popup';
import { Nullable } from '../../typings/utility-types';
import { MouseEventType } from '../../typings/event-types';
import { isTestEnv } from '../../lib/currentEnvironment';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { InstanceWithAnchorElement } from '../../lib/InstanceWithAnchorElement';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { PopupHelper } from '../../internal/Popup/PopupHelper';

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
  pos?: ShortPopupPositionsType | PopupPositionsType;
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

type DefaultProps = Required<
  Pick<HintProps, 'pos' | 'allowedPositions' | 'manual' | 'opened' | 'maxWidth' | 'disableAnimations' | 'useWrapper'>
>;

/**
 * Всплывающая подсказка, которая по умолчанию отображается при наведении на элемент. <br/> Можно задать другие условия отображения.
 */
@rootNode
export class Hint extends React.PureComponent<HintProps, HintState> implements InstanceWithAnchorElement {
  public static __KONTUR_REACT_UI__ = 'Hint';
  public static displayName = 'Hint';

  public static defaultProps: DefaultProps = {
    pos: 'top',
    manual: false,
    opened: false,
    maxWidth: 200,
    allowedPositions: Positions,
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
  public featureFlags!: ReactUIFeatureFlags;
  private setRootNode!: TSetRootNode;
  private positions: Nullable<PopupPositionsType[]> = null;

  private popupRef = React.createRef<Popup>();

  public componentDidUpdate(prevProps: HintProps) {
    const { opened, manual, pos, allowedPositions } = this.getProps();
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

    if (this.featureFlags.popupUnifyPositioning) {
      const posChanged = prevProps.pos !== pos;
      const allowedChanged = !isEqual(prevProps.allowedPositions, allowedPositions);

      if (posChanged || allowedChanged) {
        this.positions = null;
      }
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
      <ReactUIFeatureFlagsContext.Consumer>
        {(flags) => {
          const hasPin = !getFullReactUIFlagsContext(flags).kebabHintRemovePin || !isTheme2022(this.theme);
          return (
            <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
              <Popup
                hasPin={hasPin}
                opened={this.state.opened}
                anchorElement={this.props.children}
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
        }}
      </ReactUIFeatureFlagsContext.Consumer>
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

  public getPositions = (): PopupPositionsType[] => {
    if (this.featureFlags.popupUnifyPositioning) {
      if (!this.positions) {
        const { allowedPositions, pos } = this.getProps();
        this.positions = PopupHelper.processShortPosition(pos, allowedPositions);
      }
      return this.positions;
    }
    return Positions.filter((x) => x.startsWith(this.getProps().pos));
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
