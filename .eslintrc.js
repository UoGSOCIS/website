module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jquery": true,
        "mocha": true,
        "node": true,
    },
    "extends": "eslint:recommended",
    "rules": {
        /* errors */
        // enforce the more conscise brace style
        "brace-style": [
            "error",
            "1tbs"
        ],
        // enforce braces around arrow-lambda functions
        "arrow-body-style": [
            "error",
            "always"
        ],
        // enforce parens around arrow function parameters, as in:
        //      (foo) => {};
        "arrow-parens": ["error"],
        // require spaces around the arrow function operator
        "arrow-spacing": [
            "error",
            {"before": true, "after": true, }
        ],
        // enforce 4 space indent
        "indent": [
            "warn",
            4,
            {"MemberExpression": 0, }
        ],
        // do not allow extra unnecessary empty lines
        "no-multiple-empty-lines": [
            "error",
            {"max": 2, }
        ],
        // do not allow extra unnecessary spaces except where alignment may be
        // beneficial to increase legibility
        "no-multi-spaces": [
            "error",
            {
                "ignoreEOLComments": true,
                "exceptions": {
                    "Property": true,
                    "VariableDeclarator": true,
                    "ImportDeclaration": true,
                },
            }
        ],
        // enforce blank-lines after directives
        "padding-line-between-statements": [
            "error",
            {"blankLine": "always", "prev": "directive", "next": "*", },
            {"blankLine": "never", "prev": "directive", "next": "directive", },
        ],
        // do not all multiple variable declaration on a single line as in,
        //      var foo, bar, baz;  // not allowed
        //      let fizz, buzz;     // not allowed
        //      const a, b, c;      // not allowed
        "one-var": [
            "error",
            {"var": "never", "let": "never", "const": "never", }
        ],
        // require spaces before and after keywords such as 'if', 'for', ...
        "keyword-spacing": [
            "error",
            {"before": true, "after": true, }
        ],
        // always break before lines before binary operators
        "operator-linebreak": [
            "error",
            "before"
        ],
        // always require spaces around unary word operators like 'new',
        // never around unary symbolic operators like '++'
        "space-unary-ops": [
            "error",
            {"words": true, "nonwords": false, }
        ],
        // never permit padding array brackets with spaces, as in:
        //      let arr = [ 'foo', 'bar' ]; // not allowed
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        // enforce consistent array bracketing style over multiple lines for
        // long arrays
        //"array-element-newline": [
        //    "error",
        //    {"multiline": true, "minItems": 4, }
        //],
        // never permit padding parentheses with spaces, as in:
        //      function( 'foo', 'bar' ); // not allowed
        "space-in-parens": [
            "error",
            "never"
        ],
        // only permit one space after a comma, and no spaces before
        "comma-spacing": [
            "error",
            {"before": false, "after": true, }
        ],
        // commas must be preceded by something; they are not allowed to be
        // first on a line
        "comma-style": [
            "error",
            "last"
        ],
        // require trailing commas on object properties
        "comma-dangle": [
            "error",
            {
                "arrays": "only-multiline",
                "objects": "always",
                "functions": "never",
            }
        ],
        // do not allow spaces before semi-colons
        "semi-spacing": [
            "error",
            {"before": false, "after": true, }
        ],
        // always require semi-colons to terminate statements
        "semi": [
            "error",
            "always"
        ],
        // do not all terminating lines with extra semi-colons
        "no-extra-semi": ["error"],
        // always use unix line-endings
        "linebreak-style": [
            "error",
            "unix"
        ],
        // always use double quotes for strings
        "quotes": [
            "error",
            "double"
        ],
        // always require curly braces around if, for, do, while ...
        "curly": [
            "error",
            "all"
        ],
        // require that when Object.property access is split over lines, the dot
        // stays with the property, as in:
        //      Object
        //          .property()
        //          .another()
        "dot-location": [
            "error",
            "property"
        ],
        // enforce comparison with typesafe === operator, except when comparing
        // with null, where comparing `a == null` can be a useful shorthand
        "eqeqeq": [
            "error",
            "always",
            {"null": "ignore", }
        ],
        // simplify if-else statements by not allowing singular if statements
        // at the top level of an else block;
        // i.e. always use `if else` when possible
        "no-lonely-if": ["error"],
        // simplify if-else statements with conditional returns
        "no-else-return": [
            "error",
            { "allowElseIf": false, }
        ],
        // always require floating points have a leading or trailing zero after
        // the decimal point, as in:
        //      -42, 73, 0, 0.5, -0.7, 2.0, 0.0
        "no-floating-decimal": ["error"],
        // do not allow hard to read implicit type conversions, as in:
        //      !!foo; +foo; foo += ""; // etc
        "no-implicit-coercion": ["error"],
        // do not allow reckless Boolean casts as in:
        //      !!foo; /* or */ Boolean(foo);
        "no-extra-boolean-cast": ["error"],
        // do not allow initialization of a variable to be undefined, as in:
        //      let foo = undefined; // not allowed
        "no-undef-init": ["error"],
        // do not allow labeled statements
        "no-labels": ["error"],
        // do not allow functions to have arguments with the same name
        "no-dupe-args": ["error"],
        // do not allow switches to have duplicate cases
        "no-duplicate-case": ["error"],
        // do not allow use of process.exit(), because this can be called at any
        // time, sometimes unexpectedly during an async call and ruin everything
        "no-process-exit": ["error"],
        // sort es6 imports alphabetically
        "sort-imports": ["error"],
        // never allow comparisons where "literal" === variable, as in:
        //      true == flag
        //      "string" === value
        //      0 <= x
        "yoda": [
            "error",
            "never"
        ],

        /* warnings */
        // warn when a variable could be declared constant
        //"prefer-const": ["warn"],
        // warn about `new Object()` usage for creation of generic objects
        // the literal syntax is better
        "no-new-object": ["warn"],
        // warn about extended classes that define constructors that just call
        // the superclass constructor without modifications
        "no-useless-constructor": ["warn"],
        // warn about `console.log()` usage
        "no-console": ["warn"],
        // warn about unused variables
        "no-unused-vars": ["warn"],
        // warn about require() statements that are not at the top-level of a
        // module
        "global-require": ["warn"],
        // warn about using constructors from a require statement, as in:
        //      var foo = new require("bar");
        "no-new-require": ["warn"],
        // warn about concatonating __dirname and __filename with the + operator
        // it's more clear to instead use path.join()
        "no-path-concat": ["warn"],
        // warn about using process.env since this can be abused to create
        // reliance on global environment variables which may not reliable
        "no-process-env": ["warn"],
        // warn about arrow functions where they may be confused as comparison
        "no-confusing-arrow": [
            "warn",
            {"allowParens": false, }
        ],
        // warn about switch statements without default cases
        "default-case": ["warn"],
    },
};
