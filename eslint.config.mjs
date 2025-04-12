import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    ...compat.config({
        rules: {
            // Indentation
            "indent": ["error", 4, {
                flatTernaryExpressions: false,
                ignoreComments: false,
            }],

            // Error prevention
            "no-console": "error",
            "no-debugger": "error",
            "no-alert": "error",
            "no-var": "error",
            "prefer-const": "error",
            "no-unused-vars": "error",
            "no-multiple-empty-lines": ["error", {
                max: 1,
            }],
            "eqeqeq": ["error", "always"],

            // Semicolons
            "semi": ["error", "always"],
            "semi-spacing": ["error", {
                before: false,
                after: true,
            }],
            "semi-style": ["error", "last"],
            "no-extra-semi": "error",

            // Quotes and Strings
            "quotes": ["error", "double"],
            "quote-props": ["error", "consistent-as-needed"],

            // Spacing and Layout
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "space-in-parens": ["error", "never"],
            "space-before-blocks": ["error", "always"],
            "space-before-function-paren": ["error", {
                anonymous: "always",
                named: "never",
                asyncArrow: "always",
            }],
            "space-infix-ops": "error",
            "keyword-spacing": ["error", {
                before: true,
                after: true,
            }],
            "arrow-spacing": ["error", {
                before: true,
                after: true,
            }],
            "computed-property-spacing": ["error", "never"],
            "func-call-spacing": ["error", "never"],

            // Line Management
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    prev: "*",
                    next: "return",
                },
                {
                    blankLine: "always",
                    prev: ["const", "let"],
                    next: "*",
                },
                {
                    blankLine: "any",
                    prev: ["const", "let"],
                    next: ["const", "let"],
                },
                {
                    blankLine: "always",
                    prev: "directive",
                    next: "*",
                },
                {
                    blankLine: "always",
                    prev: "block-like",
                    next: "*",
                },
            ],
            "newline-before-return": "error",
            "eol-last": ["error", "always"],

            // Commas
            "comma-dangle": ["error", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                functions: "always-multiline",
            }],
            "comma-spacing": ["error", {
                before: false,
                after: true,
            }],
            "comma-style": ["error", "last"],

            // Functions
            "arrow-parens": ["error", "always"],
            "arrow-body-style": ["error", "as-needed"],

            // Objects
            "object-shorthand": ["error", "always"],
            "key-spacing": ["error", {
                beforeColon: false,
                afterColon: true,
            }],

            // Arrays
            "array-callback-return": "error",

            // TypeScript specific
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/consistent-type-imports": "error",

            // Object formatting
            "object-curly-newline": ["error", {
                ObjectExpression: "always",
                ObjectPattern: {
                    multiline: true,
                },
                ImportDeclaration: {
                    multiline: true, minProperties: 3,
                },
                ExportDeclaration: {
                    multiline: true, minProperties: 3,
                },
            }],
            "object-property-newline": ["error", {
                allowAllPropertiesOnSameLine: true,
            }],

            // Function parameters
            "function-paren-newline": ["error", "consistent"],
            "function-call-argument-newline": ["error", "consistent"],
            "max-len": ["error", {
                code: 160,
                ignorePattern: "^import\\s.+\\sfrom\\s.+;$",
                ignoreUrls: true,
            }],

            // JSX specific rules
            "react/jsx-curly-spacing": ["error", {
                when: "never",
                children: false,
            }],
            "react/jsx-tag-spacing": ["error", {
                closingSlash: "never",
                beforeSelfClosing: "always",
                afterOpening: "never",
                beforeClosing: "never",
            }],
            "react/jsx-max-props-per-line": ["error", {
                maximum: 1,
                when: "multiline",
            }],
            "react/jsx-first-prop-new-line": ["error", "multiline"],
            "react/jsx-closing-bracket-location": ["error", "line-aligned"],
            "react/jsx-closing-tag-location": "error",
            "react/jsx-curly-newline": ["error", {
                multiline: "consistent",
                singleline: "consistent",
            }],
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
            "react/jsx-wrap-multilines": ["error", {
                declaration: "parens-new-line",
                assignment: "parens-new-line",
                return: "parens-new-line",
                arrow: "parens-new-line",
                condition: "parens-new-line",
                logical: "parens-new-line",
                prop: "parens-new-line",
            }],
            // Remove whitespace issues
            "no-multi-spaces": "error",
            "no-trailing-spaces": "error",
            "react/jsx-no-useless-fragment": "error",
        },
        ignorePatterns: ["src/generated/**/*"],
    }),
];

export default eslintConfig;
