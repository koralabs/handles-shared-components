import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { basename } from "node:path";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const requireForAssets = createRequire(import.meta.url);

requireForAssets.extensions[".svg"] = (module, filename) => {
  module.exports = `mock-svg:${basename(filename)}`;
};

requireForAssets.extensions[".css"] = (module) => {
  module.exports = {};
};

type ComponentModule<T> = T | { default: T };

const unwrapDefault = <T>(module: ComponentModule<T>): T =>
  typeof module === "object" && module !== null && "default" in module ? module.default : module;

const render = (element: React.ReactElement) => renderToStaticMarkup(element);

test("Button renders link, disabled, and loading variants", async () => {
  const Button = unwrapDefault(
    (await import("../../src/components/Button/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );

  const externalHtml = render(
    React.createElement(
      Button,
      {
        href: "https://example.com",
        internal: false,
        className: "cta",
        "data-track": "external",
      },
      "Open"
    )
  );
  assert.match(externalHtml, /^<a /);
  assert.match(externalHtml, /href="https:\/\/example\.com"/);
  assert.match(externalHtml, /data-track="external"/);
  assert.match(externalHtml, />Open<\/a>/);

  const disabledHtml = render(
    React.createElement(Button, { disabled: true, className: "muted" }, "Save")
  );
  assert.match(disabledHtml, /^<button /);
  assert.match(disabledHtml, /disabled=""/);
  assert.match(disabledHtml, /muted/);
  assert.match(disabledHtml, />Save<\/button>/);

  const loadingHtml = render(React.createElement(Button, { loading: true, loadingSize: 32 }));
  assert.match(loadingHtml, /disabled=""/);
  assert.match(loadingHtml, /mock-svg:loader1\.svg/);
  assert.match(loadingHtml, /mock-svg:loader2\.svg/);
});

test("CustomInput renders controlled input with icons and error state", async () => {
  const CustomInput = unwrapDefault(
    (await import("../../src/components/CustomInput/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );

  const html = render(
    React.createElement(CustomInput, {
      value: "ada",
      placeholder: "Name",
      disabled: true,
      leftIcon: React.createElement("svg", { "aria-label": "search" }),
      errorMessage: "Required",
      fullWidth: true,
      className: "profile-input",
    })
  );

  assert.match(html, /placeholder="Name"/);
  assert.match(html, /value="ada"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-label="search"/);
  assert.match(html, /w-full/);
  assert.match(html, /pl-8/);
  assert.match(html, /border-red-500/);
  assert.match(html, /profile-input/);
  assert.match(html, />Required<\/div>/);
});

test("CustomInput delegates field props to react-hook-form register", async () => {
  const CustomInput = unwrapDefault(
    (await import("../../src/components/CustomInput/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );
  const registerCalls: Array<{ name: string; options: unknown }> = [];
  const register = (name: string, options: unknown) => {
    registerCalls.push({ name, options });
    return { name, defaultValue: "registered", "data-registered": "yes" };
  };

  const html = render(
    React.createElement(CustomInput, {
      value: "controlled",
      name: "email",
      register,
      registerOptions: { required: "Email is required" },
    })
  );

  assert.deepEqual(registerCalls, [
    { name: "email", options: { required: "Email is required" } },
  ]);
  assert.match(html, /name="email"/);
  assert.match(html, /data-registered="yes"/);
  assert.match(html, /value="registered"/);
  assert.doesNotMatch(html, /controlled/);
});

test("Loader sizes both image rings from the requested size", async () => {
  const { Loader } = await import("../../src/components/Loader/index.tsx");

  const html = render(React.createElement(Loader, { size: 40, className: "spinner" }));

  assert.match(html, /class="spinner"/);
  assert.match(html, /width:40px/);
  assert.match(html, /height:40px/);
  assert.match(html, /width:20px/);
  assert.match(html, /height:20px/);
  assert.match(html, /left:10px/);
  assert.match(html, /top:10px/);
  assert.equal((html.match(/<img/g) ?? []).length, 2);
  assert.match(html, /mock-svg:loader1\.svg/);
  assert.match(html, /mock-svg:loader2\.svg/);
});

test("CustomSelect renders the selected option while the menu is closed", async () => {
  const CustomSelect = unwrapDefault(
    (await import("../../src/components/CustomSelect/index.tsx")) as unknown as ComponentModule<React.FC<any>>
  );

  const html = render(
    React.createElement(CustomSelect, {
      currentValue: "ada",
      setValue: () => undefined,
      options: [
        { value: "ada", label: "Ada", icon: React.createElement("span", null, "A") },
        { value: "grace", label: "Grace", icon: React.createElement("span", null, "G") },
      ],
    })
  );

  assert.match(html, /bg-dark-250/);
  assert.match(html, />A<\/span>/);
  assert.match(html, />Ada<\/span>/);
  assert.doesNotMatch(html, />Grace<\/span>/);
});

test("Header switches between anonymous and signed-in actions", async () => {
  const { Header } = await import("../../src/components/Header/index.tsx");
  const handlers = {
    onLogin: () => undefined,
    onLogout: () => undefined,
    onCreateAccount: () => undefined,
  };

  const anonymousHtml = render(React.createElement(Header, handlers));
  assert.match(anonymousHtml, /<h1>Acme<\/h1>/);
  assert.match(anonymousHtml, /label="Log in"/);
  assert.match(anonymousHtml, /label="Sign up"/);
  assert.doesNotMatch(anonymousHtml, /Welcome,/);

  const signedInHtml = render(React.createElement(Header, { ...handlers, user: { name: "Ada" } }));
  assert.match(signedInHtml, /Welcome, <b>Ada<\/b>!/);
  assert.match(signedInHtml, /label="Log out"/);
  assert.doesNotMatch(signedInHtml, /label="Log in"/);
});
