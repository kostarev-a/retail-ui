import { exposeGetters } from '../../lib/theming/ThemeHelpers';

import { NewTheme2022Internal } from './newTheme';

export class Theme2022Dark extends (class {} as typeof NewTheme2022Internal) {
  //#region Common variables
  public static green: '#23A14A';
  public static greenDark: '#1C8A3F';

  public static red = '#ED3F3F';
  public static redDark = '#DD3333';
  public static errorMain = '#ED3F3F';

  public static borderColorFocus = '#EBEBEB';
  public static outlineColorFocus = '#EBEBEB';

  //#endregion Common variables

  //#region Button
  public static btnFocusShadowWidth = '2px';
  public static btnOutlineColorFocus = '#1f1f1f';

  public static btnDefaultBg = 'rgba(255, 255, 255, 0.1)';
  public static btnDefaultHoverBg = 'rgba(255, 255, 255, 0.16)';
  public static btnDefaultHoverBgStart = 'none';
  public static btnDefaultHoverBgEnd = 'none';
  public static btnDefaultActiveBg = 'rgba(255, 255, 255, 0.1)';
  public static btnDefaultBorderColor = 'rgba(255, 255, 255, 0.16)';
  public static btnDefaultTextColor = 'rgba(255, 255, 255, 0.87)';

  public static btnPrimaryBg = '#EBEBEB';
  public static btnPrimaryHoverBg = '#FFFFFF';
  public static btnPrimaryActiveBg = '#C2C2C2';
  public static btnPrimaryTextColor = 'rgba(0, 0, 0, 0.865)';

  public static get btnSuccessBg() {
    return this.green;
  }
  public static get btnSuccessBorderColor() {
    return this.btnSuccessBg;
  }

  public static btnSuccessHoverBg = '#26AD50';
  public static get btnSuccessHoverBorderColor() {
    return this.btnSuccessHoverBg;
  }

  public static get btnSuccessActiveBg() {
    return this.greenDark;
  }
  public static get btnSuccessActiveBorderColor() {
    return this.btnSuccessActiveBg;
  }

  public static btnPayBg = '#FCB73E';
  public static btnPayHoverBg = '#FCC660';
  public static btnPayActiveBg = '#F69912';
  public static get btnPayBorderColor() {
    return this.btnPayBg;
  }
  public static get btnPayHoverBorderColor() {
    return this.btnPayHoverBg;
  }
  public static get btnPayActiveBorderColor() {
    return this.btnPayActiveBg;
  }

  public static get btnDangerBg() {
    return this.errorMain;
  }
  public static get btnDangerBorderColor() {
    return this.btnDangerBg;
  }

  public static btnDangerHoverBg = '#FE4C4C';
  public static get btnDangerHoverBorderColor() {
    return this.btnDangerHoverBg;
  }

  public static btnDangerActiveBg = '#CC2626';
  public static get btnDangerActiveBorderColor() {
    return this.btnDangerActiveBg;
  }

  public static btnBacklessBg = 'transparent !important';
  public static btnBacklessHoverBg = 'rgba(255, 255, 255, 0.1) !important';
  public static btnBacklessActiveBg = 'rgba(255, 255, 255, 0.06) !important';
  public static btnBacklessBorderColor = 'rgba(255, 255, 255, 0.16) !important';
  public static btnBacklessDisabledBorderColor = 'rgba(255, 255, 255, 0.06) !important';
  public static btnBacklessHoverBorderColor = 'rgba(255, 255, 255, 0.1)';
  public static btnBacklessTextColor = 'rgba(255, 255, 255, 0.87)';

  public static btnTextBg = 'transparent !important';
  public static btnTextHoverBg = 'rgba(255, 255, 255, 0.1)';
  public static btnTextActiveBg = 'rgba(255, 255, 255, 0.06)';
  public static btnTextBorderColor = 'transparent';

  public static btnWarningSecondary = 'rgba(212, 100, 33, 1)';
  public static btnErrorSecondary = '#AB0D0D';

  public static btnDisabledBg = 'rgba(255, 255, 255, 0.04)';
  public static btnDisabledTextColor = 'rgba(255, 255, 255, 0.32)';
  public static btnDisabledBorderColor = 'transparent';

  public static btnCheckedBg = '#EBEBEB';
  public static btnCheckedTextColor = 'rgba(0, 0, 0, 0.865)';
  public static btnCheckedDisabledBg = 'rgba(255, 255, 255, 0.32) !important';
  public static btnCheckedDisabledColor = 'rgba(0, 0, 0, 0.48)';
  //#endregion Button

  //#region Select
  public static selectMenuArrowColor = 'rgba(255, 255, 255, 0.54)';
  //#endregion Select

  //#region Link
  public static linkColor = 'rgba(255, 255, 255, 0.87)';
  public static linkHoverColor = '#ffffff';
  public static linkActiveColor = '#c2c2c2';
  public static linkHoverTextDecoration = 'none';

  public static linkSuccessColor = '#46CD68';
  public static linkSuccessHoverColor = '#67D881';
  public static get linkSuccessActiveColor() {
    return this.green;
  }

  public static linkDangerColor = '#FE6C6C';
  public static linkDangerHoverColor = '#FE8C8C';
  public static get linkDangerActiveColor() {
    return this.errorMain;
  }

  public static linkGrayedColor = 'rgba(255, 255, 255, 0.54)';
  public static linkGrayedHoverColor = '#FFFFFF';
  public static linkGrayedActiveColor = '#C2C2C2';

  public static linkDisabledColor = 'rgba(255, 255, 255, 0.48)';
  public static linkFocusOutlineColor = '#EBEBEB';
  //#endregion Link

  //#region Input
  public static inputBlinkColor = '#EBEBEB';
  public static inputTextColor = 'rgba(255, 255, 255, 0.865)';
  public static inputBg = 'rgba(255, 255, 255, 0.1)';
  public static inputBorderColor = 'rgba(255, 255, 255, 0.06)';
  public static inputBackgroundClip = 'border-box';
  public static inputBorderColorHover = 'rgba(255, 255, 255, 0.16)';
  public static inputBorderColorFocus = 'rgba(235, 235, 235, 1)';
  public static get inputFocusShadow() {
    return `0 0 0 1px ${this.inputBorderColorFocus}`;
  }

  public static inputBorderColorWarning = 'rgba(252, 183, 62, 1)';
  public static inputBorderColorError = 'FE6C6C';
  public static inputOutlineWidth = '1px';

  public static inputTextColorDisabled = 'rgba(255, 255, 255, 0.32)';
  public static inputDisabledBg = 'rgba(255, 255, 255, 0.04)';
  public static inputDisabledBorderColor = 'rgba(255, 255, 255, 0.04)';
  //#endregion Input

  //#region TokenInput
  public static inputDisabledBackgroundClip = 'border-box';
  //#endregion TokenInput

  //#region Textarea
  public static get textareaBg() {
    return this.inputBg;
  }
  public static get textareaBorderColorFocus() {
    return this.inputBorderColorFocus;
  }
  public static get textareaDisabledBorderColor() {
    return this.inputDisabledBorderColor;
  }
  public static get textareaBorderColor() {
    return this.inputBorderColor;
  }
  public static get textareaTextColorDisabled() {
    return this.inputTextColorDisabled;
  }
  //#endregion Textarea

  //#region Menu
  public static get menuBgDefault() {
    return this.bgSecondary;
  }

  public static menuItemTextColor = 'rgba(255, 255, 255, 0.87)';
  public static menuItemHoverBg = 'rgba(255, 255, 255, 0.1)';
  public static menuItemSelectedBg = 'rgba(255, 255, 255, 0.16)';

  public static menuItemCommentColor = 'rgba(255, 255, 255, 0.54)';
  public static menuItemCommentOpacity = '1';

  public static menuSeparatorBorderColor = 'rgba(255, 255, 255, 0.1)';

  public static menuItemDisabledColor = 'rgba(255, 255, 255, 0.32)';
  //#endregion Menu

  //#region Token
  public static tokenShadowDisabled = '';
  public static tokenBorderColorDisabled = 'transparent';

  public static tokenDefaultIdleColor = 'rgba(255, 255, 255, 0.865)';
  public static tokenDefaultIdleBg = 'rgba(255, 255, 255, 0.1)';
  public static tokenDefaultIdleBorderColor = 'rgba(255, 255, 255, 0.06)';
  public static tokenDefaultIdleColorHover = 'rgba(255, 255, 255, 0.87)';
  public static tokenDefaultIdleBgHover = 'rgba(255, 255, 255, 0.16)';
  public static tokenDefaultIdleBorderColorHover = 'rgba(255, 255, 255, 0.06)';
  public static tokenDefaultActiveColor = 'rgba(0, 0, 0, 0.87)';
  public static tokenDefaultActiveBg = '#EBEBEB';
  public static tokenDefaultActiveBorderColor = 'transparent';
  //#endregion Token

  //#region FileUploader
  public static fileUploaderBg = 'none';
  public static fileUploaderUploadButtonBg = 'rgba(255, 255, 255, 0.1)';
  public static fileUploaderHoveredBg = 'rgba(255, 255, 255, 0.16)';
  public static fileUploaderIconColor = 'rgba(255, 255, 255, 0.87)';
  public static fileUploaderLinkColor = 'rgba(255, 255, 255, 0.87)';
  public static fileUploaderAfterLinkColor = 'rgba(255, 255, 255, 0.54)';
  public static fileUploaderDisabledBorderColor = 'rgba(255, 255, 255, 0.1)';
  public static fileUploaderDragOverShadow = '0px 0px 0px 4px #EBEBEB';
  public static get fileUploaderBorderColorFocus() {
    return this.btnBorderColorFocus;
  }
  public static get fileUploaderBorderColorError() {
    return this.errorMain;
  }
  //#endregion FileUploader

  //#region Radio
  public static radioFocusShadow = 'inset 0 0 0 1px rgba(0, 0, 0, 0.87)';

  public static radioDisabledBg = 'rgba(255, 255, 255, 0.04)';
  public static radioDisabledShadow = 'none';
  public static radioCheckedDisabledBulletBg = 'rgba(255, 255, 255, 0.16)';

  public static radioCheckedBgColor = '#FFFFFF';
  public static radioCheckedBulletColor = 'rgba(0, 0, 0, 0.87)';
  public static radioCheckedBorderColor = 'transparent';
  //#endregion Radio

  //#region Checkbox
  public static checkboxCheckedBg = '#EBEBEB';
  public static checkboxCheckedColor = 'rgba(0, 0, 0, 0.87)';
  public static checkboxHoverBg = 'rgba(255, 255, 255, 0.16)';
  public static get checkboxCheckedHoverBg() {
    return this.checkboxCheckedBg;
  }
  public static checkboxOutlineColorFocus = 'rgba(0, 0, 0, 0.87)';
  public static checkboxBgDisabled = 'rgba(255, 255, 255, 0.04)';
  public static checkboxShadowDisabled = 'none';
  //#endregion Checkbox

  //#region Toggle
  public static toggleBaseBg = 'none';
  public static toggleHandleBoxShadowOld = 'none';
  public static toggleOutlineColorFocus = '#1F1F1F';

  // idle
  public static toggleContainerBg = 'rgba(255, 255, 255, 0.1)';
  public static toggleContainerBoxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';
  public static toggleHandleBg = 'rgba(255, 255, 255, 0.32)';
  public static toggleHandleBoxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';

  // idle :hover
  public static toggleBgHover = 'rgba(255, 255, 255, 0.16)';
  public static toggleContainerBoxShadowHover = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';
  public static toggleHandleBgHover = 'rgba(255, 255, 255, 0.32)';
  public static toggleHandleBoxShadowHover = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';

  // checked
  public static toggleBgChecked = 'rgba(255, 255, 255, 0.1)';
  public static toggleContainerBoxShadowChecked = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';
  public static toggleHandleBgChecked = '#EBEBEB';
  public static toggleHandleBoxShadowChecked = 'none';

  // checked :hover
  public static get toggleContainerBgCheckedHover() {
    return this.toggleContainerBgHover;
  }
  public static toggleContainerBoxShadowCheckedHover = 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)';
  public static toggleHandleBgCheckedHover = '#FFFFFF';
  public static toggleHandleBoxShadowCheckedHover = 'none';

  // disabled
  public static toggleContainerBgDisabled = 'rgba(255, 255, 255, 0.04)';
  public static toggleContainerBoxShadowDisabled = 'none';
  public static toggleHandleBgDisabled = 'rgba(0, 0, 0, 0.16)';
  public static toggleHandleBoxShadowDisabled = 'none';

  // disabled checked
  public static toggleContainerBgDisabledChecked = 'rgba(255, 255, 255, 0.06)';
  public static toggleContainerBoxShadowDisabledChecked = 'none';
  public static toggleHandleBgDisabledChecked = 'rgba(0, 0, 0, 0.16)';
  public static toggleHandleBoxShadowDisabledChecked = 'none';

  //#endregion Toggle

  //#region Modal
  public static modalBg = '#222';
  public static get modalFixedHeaderBg() {
    return this.modalBg;
  }
  public static modalSeparatorBorderBottom = 'solid 1px rgba(255, 255, 255, 0.1)';
  public static modalBackBg = '#000';
  public static modalBackOpacity = '0.7';
  //#endregion Modal

  //#region SideMenu
  public static sidePageBgDefault = '#222';
  public static sidePageBackingBg = '#000';
  public static sidePageBackingBgOpacity = '0.7';
  //#endregion SideMenu

  //#region Tab, Tabs
  public static tabColorHover = 'rgba(255, 255, 255, 0.16)';
  //#endregion Tab, Tabs

  //#region Toast
  public static toastColor = 'rgba(44, 44, 44, 1.0)';
  public static toastBg = 'rgba(255, 255, 255, 0.8)';
  public static toastLinkColor = 'rgba(44, 44, 44, 1.0)';
  public static toastLinkBgHover = 'rgba(255, 255, 255, 0.87)';
  public static toastLinkBgActive = 'rgba(0, 0, 0, 0.16)';
  public static toastCloseColor = 'rgba(0, 0, 0, 0.32)';
  public static toastCloseHoverColor = 'rgba(0, 0, 0, 0.87)';
  //#endregion Toast

  //#region Hint
  public static hintColor = 'rgba(44, 44, 44, 1.0)';
  public static hintBgColor = 'rgba(255, 255, 255, 0.8)';
  //#endregion Hint

  //#region Tooltip
  public static tooltipBg = '#333333';
  //#endregion Tooltip

  //#region Paging
  public static pagingPageLinkHoverBg = 'rgba(255, 255, 255, 0.06)';
  public static pagingPageLinkActiveBg = 'rgba(255, 255, 255, 0.1)';
  public static pagingForwardLinkColor = 'rgba(255, 255, 255, 0.87)';
  //#endregion Paging

  //#region GlobalLoader
  public static globalLoaderColor = 'rgba(238, 80, 66, 1)';
  //#endregion GlobalLoader

  //#region DateInput
  public static dateInputComponentSelectedBgColor = '';
  public static dateInputComponentSelectedTextColor = '';
  //#endregion DateInput

  //#region Calendar
  public static calendarCellHoverBgColor = 'rgba(255, 255, 255, 0.06)';
  public static calendarCellHoverColor = 'rgba(255, 255, 255, 0.87)';
  public static calendarCellSelectedBgColor = 'rgba(255, 255, 255, 0.1)';
  public static calendarCellSelectedFontColor = 'rgba(255, 255, 255, 0.87)';
  public static calendarCellWeekendColor = '#FE6C6C';

  //#endregion Calendar

  //#region DateSelect
  public static dateSelectMenuItemBgActive = 'rgba(255, 255, 255, 0.06)';
  public static dateSelectMenuItemBgSelected = 'rgba(255, 255, 255, 0.1)';
  //#endregion DateSelect

  //#region CloseIcon, CloseButtonIcon
  public static closeBtnIconColor = 'rgba(255, 255, 255, 0.32)';
  //#endregion CloseIcon, CloseButtonIcon

  //#region react-ui-validations
  public static get validationsTextColorError() {
    return this.errorMain;
  }
  //#endregion
}

export const NewTheme2022DarkInternal = Object.setPrototypeOf(
  exposeGetters(Theme2022Dark),
  NewTheme2022Internal,
) as typeof Theme2022Dark;
