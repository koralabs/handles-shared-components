import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import typescript from "@rollup/plugin-typescript";
import ignore from "rollup-plugin-ignore";
import postcss from "rollup-plugin-postcss";
import nodePolyfills from "rollup-plugin-node-polyfills";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import dts from "rollup-plugin-dts";

// This is required to read package.json file when
// using Native ES modules in Node.js
// https://rollupjs.org/command-line-interface/#importing-package-json
import { createRequire } from "node:module";
const requireFile = createRequire(import.meta.url);
const packageJson = requireFile("./package.json");

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      peerDepsExternal({ includeDependencies: false }),
      resolve({
        preferBuiltins: false,
        browser: true,
        skip: ["react", "react-dom", "qr-code-styling"],
      }),
      commonjs(),
      nodePolyfills(),
      typescript(),
      postcss({
        extensions: [".css"],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      image(),
      ignore("qr-code-styling"),
    ],
  },
  {
    input: "lib/index.d.ts",
    output: [{ file: "lib/index.d.ts", format: "es" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
