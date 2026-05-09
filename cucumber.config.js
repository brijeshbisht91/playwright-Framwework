/**
 * Cucumber-js + Playwright — `npm test`
 * Headed: `npm run test:headed`
 */
import './config/load-env.js';

export default {
  default: {
    paths: ['features/**/*.feature'],
    import: [
      'features/support/world.js',
      'features/support/hooks.js',
      'features/step_definitions/**/*.js',
    ],
    format: ['progress', 'html:reports/cucumber-report.html'],
    publishQuiet: true,
  },
};
