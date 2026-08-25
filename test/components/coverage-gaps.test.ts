import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { basename } from 'node:path';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const requireForAssets = createRequire(import.meta.url);

requireForAssets.extensions['.svg'] = (module, filename) => {
  module.exports = `mock-svg:${basename(filename)}`;
};

requireForAssets.extensions['.css'] = (module) => {
  module.exports = {};
};

type ComponentModule<T> = T | { default: T };

type HookRun<T> = {
  result: T;
  states: unknown[];
  cleanups: Array<() => void>;
};

type HookOptions = {
  runEffects?: boolean;
  refs?: unknown[];
};

const unwrapDefault = <T>(module: ComponentModule<T>): T =>
  typeof module === 'object' && module !== null && 'default' in module ? module.default : module;

const reactInternals = (React as unknown as {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentDispatcher: { current: unknown };
  };
}).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

const renderWithHooks = <T>(
  callback: () => T,
  initialStates: unknown[] = [],
  options: HookOptions = {}
): HookRun<T> => {
  const states = [...initialStates];
  const cleanups: Array<() => void> = [];
  const effects: Array<() => void | (() => void)> = [];
  let stateIndex = 0;
  let refIndex = 0;

  const dispatcher = {
    useState(initialState: unknown) {
      const index = stateIndex++;
      if (states.length <= index) {
        states[index] = typeof initialState === 'function' ? (initialState as () => unknown)() : initialState;
      }

      const setState = (nextValue: unknown) => {
        states[index] =
          typeof nextValue === 'function'
            ? (nextValue as (previousValue: unknown) => unknown)(states[index])
            : nextValue;
      };

      return [states[index], setState];
    },
    useRef(initialValue: unknown) {
      const index = refIndex++;
      const current = options.refs && index < options.refs.length ? options.refs[index] : initialValue;
      return { current };
    },
    useEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
    useLayoutEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
    useInsertionEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
  };

  const previousDispatcher = reactInternals.ReactCurrentDispatcher.current;
  reactInternals.ReactCurrentDispatcher.current = dispatcher;

  try {
    const result = callback();

    if (options.runEffects) {
      for (const effect of effects) {
        const cleanup = effect();
        if (typeof cleanup === 'function') {
          cleanups.push(cleanup);
        }
      }
    }

    return { result, states, cleanups };
  } finally {
    reactInternals.ReactCurrentDispatcher.current = previousDispatcher;
  }
};

const childrenOf = (element: React.ReactElement): React.ReactElement[] =>
  React.Children.toArray((element as any).props.children) as React.ReactElement[];

test('package entrypoint exposes the shared component API', async () => {
  const shared = (await import('../../src/index.ts')) as Record<string, unknown>;
  const publicFunctions = [
    'Button',
    'Loader',
    'ButtonGroup',
    'CustomInput',
    'CustomSelect',
    'CustomSwitch',
    'CustomTooltip',
    'FilterDropdown',
    'listAvailableWallets',
    'enableWallet',
    'getWalletConnection',
  ];

  for (const key of publicFunctions) {
    assert.equal(typeof shared[key], 'function', key);
  }
});

test('Button renders the internal link branch with forwarded props', async () => {
  const Button = unwrapDefault(
    (await import('../../src/components/Button/index.tsx')) as unknown as ComponentModule<React.FC<any>>
  );

  const html = renderToStaticMarkup(
    React.createElement(Button, { href: '/settings', id: 'account-link', className: 'nav-link' }, 'Settings')
  );

  assert.ok(html.startsWith('<a '));
  assert.ok(html.includes('/settings'));
  assert.ok(html.includes('account-link'));
  assert.ok(html.includes('Settings'));
});

test('CustomSelect exposes menu toggles and option selection handlers', async () => {
  const CustomSelect = unwrapDefault(
    (await import('../../src/components/CustomSelect/index.tsx')) as unknown as ComponentModule<React.FC<any>>
  );
  const selected: string[] = [];

  const select = renderWithHooks(
    () =>
      CustomSelect({
        currentValue: 'ada',
        setValue: (value: string) => selected.push(value),
        options: [
          { value: 'ada', label: 'Ada', icon: React.createElement('span', null, 'A') },
          { value: 'grace', label: 'Grace', icon: React.createElement('span', null, 'G') },
        ],
      }),
    [true, 240],
    { refs: [{ offsetWidth: 240 }] }
  );

  const [frame] = childrenOf(select.result as React.ReactElement);
  const [menu] = childrenOf(frame);
  const [trigger, transition] = childrenOf(menu);

  trigger.props.onClick();
  assert.equal(select.states[0], false);

  const menuItems = transition.props.children as React.ReactElement;
  assert.deepEqual(menuItems.props.style, { width: 240 });

  const optionRows = childrenOf(menuItems);
  const [secondOption] = childrenOf(optionRows[1]);
  secondOption.props.onClick();

  assert.deepEqual(selected, ['grace']);
  assert.equal(select.states[0], false);
});

test('CustomTooltip toggles hover state and renders positioned labels', async () => {
  const CustomTooltip = unwrapDefault(
    (await import('../../src/components/CustomTooltip/index.tsx')) as unknown as ComponentModule<React.FC<any>>
  );
  const renderTooltip = () =>
    CustomTooltip({
      label: 'Copy value',
      position: 'right',
      color: 'green',
      minWidth: 160,
      className: 'tooltip-extra',
      children: React.createElement('button', null, 'Copy'),
    });

  const hidden = renderWithHooks(renderTooltip);
  (hidden.result as React.ReactElement).props.onMouseEnter();
  assert.equal(hidden.states[0], true);

  const visible = renderWithHooks(renderTooltip, [true]);
  const [presence] = childrenOf(visible.result as React.ReactElement);
  const [tooltip, childWrapper] = React.Children.toArray(presence.props.children) as React.ReactElement[];

  assert.match(tooltip.props.className, /left-full ml-2/);
  assert.match(tooltip.props.className, /tooltip-extra/);
  assert.equal(tooltip.props.style.minWidth, 160);
  assert.equal(tooltip.props.children, 'Copy value');
  assert.equal(childWrapper.props.className, 'text-white');

  (visible.result as React.ReactElement).props.onMouseLeave();
  assert.equal(visible.states[0], false);
});

test('FilterDropdown closes on outside clicks and cleans up the document listener', async () => {
  const FilterDropdown = unwrapDefault(
    (await import('../../src/components/FilterDropdown/index.tsx')) as unknown as ComponentModule<React.FC<any>>
  );
  const originalDocument = (globalThis as { document?: unknown }).document;
  const listeners: Record<string, ((event: { target: unknown }) => void) | undefined> = {};
  const documentStub = {
    addEventListener(type: string, listener: (event: { target: unknown }) => void) {
      listeners[type] = listener;
    },
    removeEventListener(type: string, listener: (event: { target: unknown }) => void) {
      if (listeners[type] === listener) {
        delete listeners[type];
      }
    },
  };
  (globalThis as { document?: unknown }).document = documentStub;

  const insideTarget = {};
  const outsideTarget = {};
  const refNode = { contains: (target: unknown) => target === insideTarget };

  try {
    const open = renderWithHooks(
      () =>
        FilterDropdown({
          value: 'all',
          label: 'Status',
          onChange: () => undefined,
          options: [
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
          ],
        }),
      [true],
      { runEffects: true, refs: [refNode] }
    );

    assert.equal(typeof listeners.mousedown, 'function');
    listeners.mousedown?.({ target: insideTarget });
    assert.equal(open.states[0], true);

    listeners.mousedown?.({ target: outsideTarget });
    assert.equal(open.states[0], false);

    open.cleanups[0]();
    assert.equal(listeners.mousedown, undefined);
  } finally {
    if (originalDocument === undefined) {
      delete (globalThis as { document?: unknown }).document;
    } else {
      (globalThis as { document?: unknown }).document = originalDocument;
    }
  }
});

test('IPFSImage resolves IPFS sources and transitions between load states', async () => {
  const IPFSImage = unwrapDefault(
    (await import('../../src/components/IPFSImage/index.tsx')) as unknown as ComponentModule<React.FC<any>>
  );

  const resolved = renderWithHooks(
    () => IPFSImage({ src: 'ipfs://QmHash', alt: 'Handle' }),
    [],
    { runEffects: true }
  );
  assert.equal(resolved.states[0], true);
  assert.equal(resolved.states[4], 'https://public-handles.myfilebase.com/ipfs/QmHash');

  const direct = renderWithHooks(
    () => IPFSImage({ src: 'https://example.test/image.png' }),
    [],
    { runEffects: true }
  );
  assert.equal(direct.states[0], false);
  assert.equal(direct.states[4], 'https://example.test/image.png');

  const loading = renderWithHooks(
    () =>
      IPFSImage({
        src: 'ipfs://QmHash',
        alt: 'Handle',
        className: 'avatar',
        objectFit: 'contain',
      }),
    [true, 0, true, false, 'https://public-handles.myfilebase.com/ipfs/QmHash']
  );
  const [, image] = childrenOf(loading.result as React.ReactElement);
  assert.equal(image.props.alt, 'Handle');
  assert.match(image.props.className, /hidden/);
  assert.match(image.props.className, /object-contain/);

  image.props.onError();
  assert.equal(loading.states[1], 1);
  assert.equal(loading.states[2], true);
  assert.equal(loading.states[3], false);

  image.props.onLoad();
  assert.equal(loading.states[2], false);
  assert.equal(loading.states[3], false);

  const exhausted = renderWithHooks(
    () => IPFSImage({ src: 'ipfs://QmHash' }),
    [true, 2, true, false, 'https://ipfs.io/ipfs/QmHash']
  );
  const [, exhaustedImage] = childrenOf(exhausted.result as React.ReactElement);
  exhaustedImage.props.onError();
  assert.equal(exhausted.states[3], true);

  const broken = renderWithHooks(
    () => IPFSImage({ src: 'ipfs://QmHash', className: 'avatar' }),
    [true, 2, true, true, '']
  );
  const [icon] = childrenOf(broken.result as React.ReactElement);
  assert.match((broken.result as React.ReactElement).props.className, /avatar/);
  assert.match(icon.props.className, /w-8 h-8/);
});
