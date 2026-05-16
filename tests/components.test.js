const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

require.extensions['.css'] = (module) => {
  module.exports = '';
};
require.extensions['.svg'] = (module, filename) => {
  module.exports = filename;
};
require('sucrase/register');

const { isValidColor, hexStringToColor, assertIsNode } = require('../src/helpers/index.ts');
const Button = require('../src/components/Button/index.tsx').default;
const ButtonGroup = require('../src/components/ButtonGroup/index.tsx').default;
const CustomInput = require('../src/components/CustomInput/index.tsx').default;
const CustomSwitch = require('../src/components/CustomSwitch/index.tsx').default;
const FilterDropdown = require('../src/components/FilterDropdown/index.tsx').default;
const Pagination = require('../src/components/Pagination/index.tsx').default;
const { Loader } = require('../src/components/Loader/index.tsx');

test('helpers validate and normalize handle colors', () => {
  assert.equal(isValidColor('#abcdef'), true);
  assert.equal(isValidColor('#ABCDEF80'), true);
  assert.equal(isValidColor('abcdef'), false);
  assert.equal(isValidColor('#abc'), false);

  assert.equal(hexStringToColor('0x123456'), '#123456');
  assert.equal(hexStringToColor('0x12345678'), '#12345678');
  assert.equal(hexStringToColor('not-a-color', '#000000'), '#000000');
  assert.equal(hexStringToColor('not-a-color'), '#ffffff00');
});

test('assertIsNode rejects non-node event targets', () => {
  assert.doesNotThrow(() => assertIsNode({ nodeType: 1 }));
  assert.throws(() => assertIsNode(null), /Node expected/);
  assert.throws(() => assertIsNode({}), /Node expected/);
});

test('Button renders button, external link, internal link, and loading states', () => {
  assert.match(renderToStaticMarkup(React.createElement(Button, null, 'Mint')), /<button[^>]*>Mint<\/button>/);
  assert.match(
    renderToStaticMarkup(React.createElement(Button, { href: 'https://handle.me', internal: false }, 'Visit')),
    /<a href="https:\/\/handle.me"[^>]*>Visit<\/a>/
  );
  assert.match(
    renderToStaticMarkup(React.createElement(Button, { href: '/profile' }, 'Profile')),
    /<a href="\/profile"><a[^>]*>Profile<\/a><\/a>/
  );

  const loadingMarkup = renderToStaticMarkup(React.createElement(Button, { loading: true, loadingSize: 16 }, 'Saving'));
  assert.match(loadingMarkup, /disabled=""/);
  assert.match(loadingMarkup, /loader1\.svg/);
});

test('ButtonGroup marks the selected value and disabled wrapper', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ButtonGroup, {
      selectedValue: 'owned',
      disabled: true,
      activeClassName: 'active-choice',
      wrapperClassName: 'segmented',
      buttonClassName: 'choice',
      onChange: () => {},
      buttons: [
        { value: 'all', title: 'All' },
        { value: 'owned', title: 'Owned' },
        { value: 'listed', title: 'Listed' },
      ],
    })
  );

  assert.match(markup, /segmented/);
  assert.match(markup, /opacity-50/);
  assert.match(markup, /active-choice/);
  assert.match(markup, />Owned<\/div>/);
});

test('CustomInput renders controlled, decorated, disabled, and error states', () => {
  const icon = React.createElement('svg', { 'data-testid': 'search-icon' });
  const markup = renderToStaticMarkup(
    React.createElement(CustomInput, {
      value: 'ada',
      onChange: () => {},
      placeholder: 'Search handles',
      errorMessage: 'Required',
      leftIcon: icon,
      disabled: true,
      fullWidth: true,
      className: 'extra-input',
      name: 'handle',
    })
  );

  assert.match(markup, /value="ada"/);
  assert.match(markup, /placeholder="Search handles"/);
  assert.match(markup, /pl-8/);
  assert.match(markup, /border-red-500/);
  assert.match(markup, /opacity-50/);
  assert.match(markup, />Required<\/div>/);
});

test('CustomInput delegates field wiring when register is provided', () => {
  const markup = renderToStaticMarkup(
    React.createElement(CustomInput, {
      name: 'handle',
      register: (name, options) => ({ name, 'data-required': options.required }),
      registerOptions: { required: 'required' },
    })
  );

  assert.match(markup, /name="handle"/);
  assert.match(markup, /data-required="required"/);
});

test('FilterDropdown shows the active option label or fallback label while closed', () => {
  const options = [
    { value: 'recent', label: 'Recently listed' },
    { value: 'price', label: 'Price low to high' },
  ];

  const selectedMarkup = renderToStaticMarkup(
    React.createElement(FilterDropdown, {
      value: 'price',
      onChange: () => {},
      options,
      label: 'Sort by',
    })
  );
  assert.match(selectedMarkup, /Price low to high/);

  const fallbackMarkup = renderToStaticMarkup(
    React.createElement(FilterDropdown, {
      value: '',
      onChange: () => {},
      options,
      label: 'Sort by',
    })
  );
  assert.match(fallbackMarkup, /Sort by/);
});

test('Pagination renders boundaries, nearby pages, ellipses, and active page', () => {
  const markup = renderToStaticMarkup(
    React.createElement(Pagination, {
      currentPage: 5,
      totalPages: 10,
      onPageChange: () => {},
      className: 'pager',
    })
  );

  assert.match(markup, /pager/);
  assert.match(markup, />1<\/button>/);
  assert.match(markup, />3<\/button>/);
  assert.match(markup, />5<\/button>/);
  assert.match(markup, />7<\/button>/);
  assert.match(markup, />10<\/button>/);
  assert.equal((markup.match(/\.\.\./g) || []).length, 2);
  assert.match(markup, /bg-brand-400 text-white/);
});

test('CustomSwitch and Loader render their state-derived styles', () => {
  const switchMarkup = renderToStaticMarkup(
    React.createElement(CustomSwitch, { enabled: true, allowToggle: false, className: 'switch-shell' })
  );
  assert.match(switchMarkup, /switch-shell/);
  assert.match(switchMarkup, /bg-blue-400/);
  assert.match(switchMarkup, /translate-x-5/);

  const loaderMarkup = renderToStaticMarkup(React.createElement(Loader, { size: 32, className: 'loader-shell' }));
  assert.match(loaderMarkup, /loader-shell/);
  assert.match(loaderMarkup, /width:32px/);
  assert.match(loaderMarkup, /loader1\.svg/);
  assert.match(loaderMarkup, /loader2\.svg/);
});
