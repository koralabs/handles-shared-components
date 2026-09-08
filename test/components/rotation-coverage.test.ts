import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import React from "react";

const requireForAssets = createRequire(import.meta.url);

requireForAssets.extensions[".css"] = (module) => {
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
};

const unwrapDefault = <T>(module: ComponentModule<T>): T =>
  typeof module === "object" && module !== null && "default" in module ? module.default : module;

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

  const dispatcher = {
    useState(initialState: unknown) {
      const index = stateIndex++;
      if (states.length <= index) {
        states[index] = typeof initialState === "function" ? (initialState as () => unknown)() : initialState;
      }

      const setState = (nextValue: unknown) => {
        states[index] =
          typeof nextValue === "function"
            ? (nextValue as (previousValue: unknown) => unknown)(states[index])
            : nextValue;
      };

      return [states[index], setState];
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
        if (typeof cleanup === "function") {
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

const restoreGlobal = (key: string, value: unknown) => {
  if (value === undefined) {
    delete (globalThis as Record<string, unknown>)[key];
  } else {
    (globalThis as Record<string, unknown>)[key] = value;
  }
};

test("ZoomSlider forwards zoom and offset settings to rc-slider", async () => {
  const ZoomSlider = unwrapDefault(
    (await import("../../src/components/ZoomSlider/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );
  const changedValues: unknown[] = [];

  const zoomTree = ZoomSlider({
    type: "zoom",
    value: 125,
    min: 50,
    max: 250,
    onChange: (value: unknown) => changedValues.push(value),
  }) as React.ReactElement;
  const [zoomFrame] = childrenOf(zoomTree);
  const [zoomCustomSlider] = childrenOf(zoomFrame);
  const zoomSliderFrame = (zoomCustomSlider.type as React.FC<any>)(zoomCustomSlider.props) as React.ReactElement;
  const [zoomSlider] = childrenOf(zoomSliderFrame);

  assert.equal(zoomSlider.props.value, 125);
  assert.equal(zoomSlider.props.startPoint, 100);
  assert.equal(zoomSlider.props.min, 50);
  assert.equal(zoomSlider.props.max, 250);

  zoomSlider.props.onChange(150);
  zoomSlider.props.onChange([90, 110]);
  assert.deepEqual(changedValues, [150, [90, 110]]);

  const offsetTree = ZoomSlider({
    type: "offset",
    value: -12,
    min: -100,
    max: 100,
    startPoint: 20,
    onChange: (value: unknown) => changedValues.push(value),
  }) as React.ReactElement;
  const [offsetFrame] = childrenOf(offsetTree);
  const [offsetCustomSlider] = childrenOf(offsetFrame);
  const offsetSliderFrame = (offsetCustomSlider.type as React.FC<any>)(
    offsetCustomSlider.props
  ) as React.ReactElement;
  const [offsetSlider] = childrenOf(offsetSliderFrame);

  assert.equal(offsetSlider.props.value, -12);
  assert.equal(offsetSlider.props.startPoint, 20);
  assert.equal(offsetSlider.props.min, -100);
  assert.equal(offsetSlider.props.max, 100);

  offsetSlider.props.onChange(-16);
  assert.deepEqual(changedValues, [150, [90, 110], -16]);
});

test("useContainerDimensions reads ref dimensions and clears listeners", async () => {
  const { useContainerDimensions } = await import("../../src/hooks/useContainerDimensions.tsx");
  const originalWindow = (globalThis as Record<string, unknown>).window;
  const originalResizeObserver = (globalThis as Record<string, unknown>).ResizeObserver;
  const listeners: Record<string, (() => void) | undefined> = {};
  const designContainer = {};
  const observed: unknown[] = [];
  const unobserved: unknown[] = [];

  class ResizeObserverStub {
    constructor(_callback: () => void) {}

    observe(element: unknown) {
      observed.push(element);
    }

    unobserve(element: unknown) {
      unobserved.push(element);
    }
  }

  (globalThis as Record<string, unknown>).window = {
    addEventListener(type: string, listener: () => void) {
      listeners[type] = listener;
    },
    removeEventListener(type: string, listener: () => void) {
      if (listeners[type] === listener) {
        delete listeners[type];
      }
    },
    document: {
      getElementById(id: string) {
        return id === "design_container" ? designContainer : null;
      },
    },
  };
  (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;

  const ref = { current: { offsetWidth: 320, offsetHeight: 180 } };

  try {
    const run = renderWithHooks(
      () => useContainerDimensions(ref as React.RefObject<any>),
      [],
      { runEffects: true }
    );

    assert.deepEqual(run.result, { width: 0, height: 0 });
    assert.deepEqual(run.states[0], { width: 320, height: 180 });
    assert.deepEqual(Object.keys(listeners).sort(), ["load", "resize", "scroll"]);
    assert.deepEqual(observed, [designContainer]);

    ref.current.offsetWidth = 640;
    ref.current.offsetHeight = 360;
    listeners.resize?.();
    assert.deepEqual(run.states[0], { width: 640, height: 360 });

    run.cleanups[0]();
    assert.deepEqual(Object.keys(listeners), []);
    assert.deepEqual(unobserved, [designContainer]);
  } finally {
    restoreGlobal("window", originalWindow);
    restoreGlobal("ResizeObserver", originalResizeObserver);
  }
});

test("useContainerDimensions keeps zero dimensions without a mounted ref", async () => {
  const { useContainerDimensions } = await import("../../src/hooks/useContainerDimensions.tsx");
  const originalWindow = (globalThis as Record<string, unknown>).window;
  const originalResizeObserver = (globalThis as Record<string, unknown>).ResizeObserver;
  const listeners: Record<string, (() => void) | undefined> = {};
  const observed: unknown[] = [];

  class ResizeObserverStub {
    constructor(_callback: () => void) {}

    observe(element: unknown) {
      observed.push(element);
    }

    unobserve(_element: unknown) {}
  }

  (globalThis as Record<string, unknown>).window = {
    addEventListener(type: string, listener: () => void) {
      listeners[type] = listener;
    },
    removeEventListener(type: string, listener: () => void) {
      if (listeners[type] === listener) {
        delete listeners[type];
      }
    },
    document: {
      getElementById() {
        return null;
      },
    },
  };
  (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;

  try {
    const run = renderWithHooks(() => useContainerDimensions(null), [], { runEffects: true });

    assert.deepEqual(run.result, { width: 0, height: 0 });
    assert.deepEqual(run.states[0], { width: 0, height: 0 });
    assert.deepEqual(observed, []);

    listeners.load?.();
    assert.deepEqual(run.states[0], { width: 0, height: 0 });

    run.cleanups[0]();
    assert.deepEqual(Object.keys(listeners), []);
  } finally {
    restoreGlobal("window", originalWindow);
    restoreGlobal("ResizeObserver", originalResizeObserver);
  }
});

test("CustomSwitch syncs internal state from enabled prop effects", async () => {
  const CustomSwitch = unwrapDefault(
    (await import("../../src/components/CustomSwitch/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );

  const run = renderWithHooks(
    () => CustomSwitch({ enabled: true, onChange: () => undefined }),
    [false],
    { runEffects: true }
  );

  const [switchElement] = childrenOf(run.result as React.ReactElement);
  assert.equal(switchElement.props.checked, false);
  assert.equal(run.states[0], true);
});

test("CustomTooltip renders alternate positions and color branches", async () => {
  const CustomTooltip = unwrapDefault(
    (await import("../../src/components/CustomTooltip/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );

  const top = renderWithHooks(
    () =>
      CustomTooltip({
        label: "Top label",
        position: "top",
        color: "red",
        children: React.createElement("span", null, "Top child"),
      }),
    [true]
  );
  const [topPresence] = childrenOf(top.result as React.ReactElement);
  const [topTooltip] = React.Children.toArray(topPresence.props.children) as React.ReactElement[];
  assert.match(topTooltip.props.className, /bottom-full mb-2/);
  assert.equal(topTooltip.props.style.minWidth, 100);

  const bottom = renderWithHooks(
    () =>
      CustomTooltip({
        label: "Bottom label",
        position: "bottom",
        children: React.createElement("span", null, "Bottom child"),
      }),
    [true]
  );
  const [bottomPresence] = childrenOf(bottom.result as React.ReactElement);
  const [bottomTooltip] = React.Children.toArray(bottomPresence.props.children) as React.ReactElement[];
  assert.match(bottomTooltip.props.className, /top-full mt-2/);

  const left = renderWithHooks(
    () =>
      CustomTooltip({
        label: "Left label",
        position: "left",
        color: "white",
        children: React.createElement("span", null, "Left child"),
      }),
    [true]
  );
  const [leftPresence] = childrenOf(left.result as React.ReactElement);
  const [leftTooltip] = React.Children.toArray(leftPresence.props.children) as React.ReactElement[];
  assert.match(leftTooltip.props.className, /right-full mr-2/);
});
