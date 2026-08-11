import assert from "node:assert/strict";
import test from "node:test";

import React from "react";

import ButtonGroupModule from "../../src/components/ButtonGroup/index.tsx";
import CustomInputModule from "../../src/components/CustomInput/index.tsx";
import CustomSwitchModule from "../../src/components/CustomSwitch/index.tsx";
import FilterDropdownModule from "../../src/components/FilterDropdown/index.tsx";

type ComponentModule<T> = T | { default: T };

type HookRun<T> = {
  result: T;
  states: unknown[];
};

const unwrapDefault = <T>(module: ComponentModule<T>): T =>
  typeof module === "object" && module !== null && "default" in module ? module.default : module;

const ButtonGroup = unwrapDefault(ButtonGroupModule) as React.FC<any>;
const CustomInput = unwrapDefault(CustomInputModule) as React.FC<any>;
const CustomSwitch = unwrapDefault(CustomSwitchModule) as React.FC<any>;
const FilterDropdown = unwrapDefault(FilterDropdownModule) as React.FC<any>;

const reactInternals = (React as unknown as {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentDispatcher: { current: unknown };
  };
}).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

const renderWithHooks = <T>(callback: () => T, initialStates: unknown[] = []): HookRun<T> => {
  const states = [...initialStates];
  let stateIndex = 0;
  let refIndex = 0;

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
    useReducer(reducer: (state: unknown, action: unknown) => unknown, initialArg: unknown, init?: (value: unknown) => unknown) {
      const index = stateIndex++;
      if (states.length <= index) {
        states[index] = init ? init(initialArg) : initialArg;
      }

      const dispatch = (action: unknown) => {
        states[index] = reducer(states[index], action);
      };

      return [states[index], dispatch];
    },
    useRef(initialValue: unknown) {
      refIndex += 1;
      return { current: initialValue };
    },
    useEffect() {},
    useLayoutEffect() {},
    useInsertionEffect() {},
    useMemo(factory: () => unknown) {
      return factory();
    },
    useCallback(callbackValue: unknown) {
      return callbackValue;
    },
    useContext() {
      return undefined;
    },
    useDebugValue() {},
    useDeferredValue(value: unknown) {
      return value;
    },
    useTransition() {
      return [false, (callbackValue: () => void) => callbackValue()];
    },
    useId() {
      return `test-id-${refIndex}`;
    },
    useImperativeHandle() {},
    useSyncExternalStore(_subscribe: unknown, getSnapshot: () => unknown) {
      return getSnapshot();
    },
  };

  const previousDispatcher = reactInternals.ReactCurrentDispatcher.current;
  reactInternals.ReactCurrentDispatcher.current = dispatcher;

  try {
    return { result: callback(), states };
  } finally {
    reactInternals.ReactCurrentDispatcher.current = previousDispatcher;
  }
};

const childrenOf = (element: React.ReactElement): React.ReactElement[] =>
  React.Children.toArray((element as any).props.children) as React.ReactElement[];

test("ButtonGroup updates active state and calls onChange from enabled clicks", () => {
  const selectedValues: string[] = [];
  const { result, states } = renderWithHooks(() =>
    ButtonGroup({
      buttons: [
        { value: "list", title: "List" },
        { value: "grid", title: "Grid" },
      ],
      selectedValue: "list",
      onChange: (value: string) => selectedValues.push(value),
    })
  );

  const buttonWrappers = childrenOf(result as React.ReactElement);
  buttonWrappers[1].props.onClick();

  assert.deepEqual(selectedValues, ["grid"]);
  assert.equal(states[0], "grid");
});

test("CustomInput stores local edits before delegating onChange", () => {
  const changedValues: string[] = [];
  const { result, states } = renderWithHooks(() =>
    CustomInput({
      value: "",
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => changedValues.push(event.target.value),
    })
  );

  const [fieldWrapper] = childrenOf(result as React.ReactElement);
  const input = childrenOf(fieldWrapper).find((child) => child.type === "input");
  assert.ok(input);

  input.props.onChange({ target: { value: "kora" } });

  assert.deepEqual(changedValues, ["kora"]);
  assert.equal(states[0], "kora");
});

test("CustomSwitch toggles internal state and emits the next value", () => {
  const changedValues: Array<boolean | undefined> = [];
  const { result, states } = renderWithHooks(() =>
    CustomSwitch({
      enabled: false,
      onChange: (enabled?: boolean) => changedValues.push(enabled),
    })
  );

  const [switchElement] = childrenOf(result as React.ReactElement);
  assert.equal(switchElement.props.checked, false);

  switchElement.props.onChange();

  assert.deepEqual(changedValues, [true]);
  assert.equal(states[0], true);
});

test("FilterDropdown opens from the trigger and closes after selecting an option", () => {
  const options = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
  ];
  const closed = renderWithHooks(() =>
    FilterDropdown({
      value: "all",
      label: "Status",
      onChange: () => undefined,
      options,
    })
  );
  const [trigger] = childrenOf(closed.result as React.ReactElement);

  trigger.props.onClick();
  assert.equal(closed.states[0], true);

  const selectedValues: string[] = [];
  const open = renderWithHooks(
    () =>
      FilterDropdown({
        value: "all",
        label: "Status",
        onChange: (value: string) => selectedValues.push(value),
        options,
      }),
    [true]
  );
  const [, menuPresence] = childrenOf(open.result as React.ReactElement);
  const menu = menuPresence.props.children as React.ReactElement;
  const optionButtons = childrenOf(menu);

  optionButtons[1].props.onClick();

  assert.deepEqual(selectedValues, ["active"]);
  assert.equal(open.states[0], false);
});
