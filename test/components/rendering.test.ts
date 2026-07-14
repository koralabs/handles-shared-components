import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import ButtonGroupModule from "../../src/components/ButtonGroup/index.tsx";
import CustomSwitchModule from "../../src/components/CustomSwitch/index.tsx";
import FadeModule from "../../src/components/Fade/index.tsx";
import FilterDropdownModule from "../../src/components/FilterDropdown/index.tsx";
import PaginationModule from "../../src/components/Pagination/index.tsx";

type ComponentModule<T> = T | { default: T };

const unwrapDefault = <T>(module: ComponentModule<T>): T =>
  typeof module === "object" && module !== null && "default" in module ? module.default : module;

const ButtonGroup = unwrapDefault(ButtonGroupModule);
const CustomSwitch = unwrapDefault(CustomSwitchModule);
const Fade = unwrapDefault(FadeModule);
const FilterDropdown = unwrapDefault(FilterDropdownModule);
const Pagination = unwrapDefault(PaginationModule);
const render = (element: React.ReactElement) => renderToStaticMarkup(element);

test("Pagination renders edge pages, nearby pages, and ellipses", () => {
  const html = render(
    React.createElement(Pagination, {
      currentPage: 5,
      totalPages: 10,
      onPageChange: () => undefined,
      className: "pager",
    })
  );

  assert.match(html, /class="pager flex justify-center items-center text-white"/);
  assert.match(html, />1<\/button>/);
  assert.match(html, />3<\/button>/);
  assert.match(html, />5<\/button>/);
  assert.match(html, /bg-brand-400 text-white/);
  assert.match(html, />10<\/button>/);
  assert.equal((html.match(/<span>\.\.\.<\/span>/g) ?? []).length, 2);
});

test("Pagination renders every page when total pages stay within the current window", () => {
  const html = render(
    React.createElement(Pagination, {
      currentPage: 2,
      totalPages: 4,
      onPageChange: () => undefined,
    })
  );

  for (const page of [1, 2, 3, 4]) {
    assert.match(html, new RegExp(`>${page}<\\/button>`));
  }
  assert.doesNotMatch(html, /<span>\.\.\.<\/span>/);
});

test("ButtonGroup marks the selected button and applies custom classes", () => {
  const html = render(
    React.createElement(ButtonGroup, {
      buttons: [
        { value: "list", title: "List" },
        { value: "grid", title: "Grid" },
      ],
      selectedValue: "grid",
      onChange: () => undefined,
      activeClassName: "active-choice",
      wrapperClassName: "compact",
      buttonClassName: "choice",
    })
  );

  assert.match(html, /compact/);
  assert.match(html, /cursor-pointer/);
  assert.match(html, />List<\/div>/);
  assert.match(html, /active-choice/);
  assert.match(html, /choice/);
  assert.match(html, />Grid<\/div>/);
});

test("ButtonGroup renders disabled controls without active click affordance", () => {
  const html = render(
    React.createElement(ButtonGroup, {
      buttons: [
        { value: "yes", title: "Yes" },
        { value: "no", title: "No" },
      ],
      selectedValue: "yes",
      disabled: true,
      onChange: () => undefined,
    })
  );

  assert.match(html, /opacity-50/);
  assert.equal((html.match(/cursor-not-allowed/g) ?? []).length, 2);
});

test("CustomSwitch renders enabled and disabled visual states", () => {
  const enabledHtml = render(React.createElement(CustomSwitch, { enabled: true, className: "switch-shell" }));
  const disabledHtml = render(React.createElement(CustomSwitch, { enabled: false, allowToggle: false }));

  assert.match(enabledHtml, /switch-shell/);
  assert.match(enabledHtml, /aria-checked="true"/);
  assert.match(enabledHtml, /bg-blue-400/);
  assert.match(enabledHtml, /translate-x-5/);
  assert.match(disabledHtml, /disabled=""/);
  assert.match(disabledHtml, /aria-checked="false"/);
  assert.match(disabledHtml, /bg-brand-100/);
});

test("FilterDropdown renders selected labels and a closed menu by default", () => {
  const html = render(
    React.createElement(FilterDropdown, {
      value: "active",
      label: "Status",
      onChange: () => undefined,
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
      ],
    })
  );

  assert.match(html, />Active<\/span>/);
  assert.doesNotMatch(html, />All<\/button>/);
});

test("FilterDropdown falls back to the prompt label when no value is selected", () => {
  const html = render(
    React.createElement(FilterDropdown, {
      value: "",
      label: "Choose status",
      onChange: () => undefined,
      options: [{ value: "active", label: "Active" }],
    })
  );

  assert.match(html, />Choose status<\/span>/);
});

test("Fade wraps children with the requested transition duration", () => {
  const html = render(
    React.createElement(
      Fade,
      { fadeKey: "profile", fadeDuration: 0.2 },
      React.createElement("span", null, "Loaded")
    )
  );

  assert.match(html, /<span>Loaded<\/span>/);
  assert.match(html, /opacity:0/);
});
