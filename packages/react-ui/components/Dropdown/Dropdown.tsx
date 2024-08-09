import React, { AriaAttributes } from 'react';

import { filterProps } from '../../lib/filterProps';
import { MenuHeader } from '../MenuHeader';
import { MenuItem } from '../MenuItem';
import { MenuSeparator } from '../MenuSeparator';
import { Select } from '../Select';
import { Nullable } from '../../typings/utility-types';
import { ButtonUse } from '../Button';
import { CommonWrapper, CommonProps, CommonWrapperRestProps } from '../../internal/CommonWrapper';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { DropdownContainerProps } from '../../internal/DropdownContainer';
import { SizeProp } from '../../lib/types/props';

import { getDropdownTheme } from './getDropdownTheme';

const PASS_PROPS = {
  _renderButton: true,
  error: true,
  disabled: true,
  disablePortal: true,
  menuAlign: true,
  menuWidth: true,
  maxMenuHeight: true,
  use: true,
  size: true,
  warning: true,
  width: true,
  onOpen: true,
  onClose: true,
  onMouseEnter: true,
  onMouseLeave: true,
  onMouseOver: true,
  menuPos: true,
  'aria-describedby': true,
};

export interface DropdownProps
  extends Pick<AriaAttributes, 'aria-label' | 'aria-describedby'>,
    CommonProps,
    Pick<DropdownContainerProps, 'menuPos'> {
  /**
   * Подпись на кнопке.
   */
  caption: React.ReactNode;
  /**
   * Иконка слева от текста кнопки
   */
  icon?: React.ReactElement<any>;
  width?: React.CSSProperties['width'];

  /** @ignore */
  _renderButton?: (params: any) => JSX.Element;

  /**
   * Отключает использование портала
   */
  disablePortal?: boolean;

  /**
   * Визуально отключает Dropdown
   */
  disabled?: boolean;

  /**
   * Состояние валидации при ошибке.
   */
  error?: boolean;
  /**
   * Состояние валидации при предупреждении.
   */
  warning?: boolean;
  maxMenuHeight?: number;
  menuAlign?: 'left' | 'right';
  menuWidth?: number | string;
  size?: SizeProp;

  /**
   * Смотри Button.
   */
  use?: ButtonUse;

  /**
   * Вызывается при закрытии меню.
   */
  onClose?: () => void;
  /**
   * Вызывается при открытии меню.
   */
  onOpen?: () => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseOver?: (event: React.MouseEvent<HTMLElement>) => void;
}

type DropdownSelectType = Select<React.ReactNode, React.ReactNode>;

export const DropdownDataTids = {
  root: 'Dropdown__root',
} as const;

/**
 * Выпадающее меню.
 *
 */
@rootNode
export class Dropdown extends React.Component<DropdownProps> {
  public static __KONTUR_REACT_UI__ = 'Dropdown';
  public static displayName = 'Dropdown';

  public static Header = MenuHeader;
  public static MenuItem = MenuItem;
  public static Separator = MenuSeparator;

  private _select: Nullable<DropdownSelectType>;
  private setRootNode!: TSetRootNode;
  private theme!: Theme;

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = getDropdownTheme(theme);
          return <ThemeContext.Provider value={this.theme}>{this.renderMain(this.props)}</ThemeContext.Provider>;
        }}
      </ThemeContext.Consumer>
    );
  }

  public renderMain = ({ caption, icon, ...props }: CommonWrapperRestProps<DropdownProps>) => {
    const items = React.Children.map(this.props.children, (item) => item) || [];

    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <Select<React.ReactNode, React.ReactNode>
          data-tid={DropdownDataTids.root}
          ref={this._refSelect}
          {...filterProps(props, PASS_PROPS)}
          value={caption}
          items={items}
          _icon={icon}
          renderValue={renderValue}
          size={this.props.size}
          aria-label={this.props['aria-label']}
        />
      </CommonWrapper>
    );
  };

  /**
   * @public
   */
  public open() {
    if (this._select) {
      this._select.open();
    }
  }

  /**
   * @public
   */
  public close() {
    if (this._select) {
      this._select.close();
    }
  }

  private _refSelect = (element: DropdownSelectType): void => {
    this._select = element;
  };
}

function renderValue(value: any) {
  return value;
}
