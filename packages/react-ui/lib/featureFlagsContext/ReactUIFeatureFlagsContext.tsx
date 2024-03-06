import React from 'react';

export interface ReactUIFeatureFlags {
  tokenInputRemoveWhitespaceFromDefaultDelimiters?: boolean;
  kebabHintRemovePin?: boolean;
  sidePageEnableFocusLockWhenBackgroundBlocked?: boolean;
  spinnerLoaderRemoveDefaultCaption?: boolean;
  menuItemsAtAnyLevel?: boolean;
  textareaUseSafari17Workaround?: boolean;
  linkFocusOutline?: boolean;
}

export const reactUIFeatureFlagsDefault: ReactUIFeatureFlags = {
  tokenInputRemoveWhitespaceFromDefaultDelimiters: false,
  kebabHintRemovePin: false,
  sidePageEnableFocusLockWhenBackgroundBlocked: false,
  spinnerLoaderRemoveDefaultCaption: false,
  menuItemsAtAnyLevel: false,
  textareaUseSafari17Workaround: false,
  linkFocusOutline: false,
};

export const ReactUIFeatureFlagsContext = React.createContext<ReactUIFeatureFlags>(reactUIFeatureFlagsDefault);
ReactUIFeatureFlagsContext.displayName = 'ReactUIFeatureFlagsContext';
