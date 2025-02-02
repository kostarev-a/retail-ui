const { commonSections, versionsSection, ROOT_DIR, removeUnsupportedConfigOptions } = require('../helpers');

const baseConfig = require('./base.config');

const config = Object.assign({}, baseConfig, {
  styleguideDir: ROOT_DIR,
  sections: [...commonSections, versionsSection],
});

module.exports = removeUnsupportedConfigOptions(config);
