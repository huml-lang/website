+++
title = "HUML specification"
+++

# HUML specification

HUML is a machine-readable markup language with a focus on readability by humans. It borrows YAML's visual appearance, but avoids its complexities, ambiguities, and dangerous footguns. It is very strict about indentation and spaces specifically to ensure consistent form across contexts for readability.

HUML is tailored for configuration, documents, and datasets.

## Motivation

- HUML was primarily born out of the numerous frustrations with YAML, where one easy-to-miss, accidental indentation change can dangerously alter the semantics of a document.
- JSON is universal, but lacks comments, does not have a strict form for consistent readability across contexts, has comma-related ambiguities, and bracket-matching woes which make human editing difficult.
- Other popular markup languages such as TOML and HCL are configuration-oriented. NestedText is an interesting approach, but is too primitive to be suitable for wider use cases.
- Of these, YAML is the one that comes closest to indicating structure and hierarchy visually.

Ultimately, a new markup language is a subjective endeavor (it was even in 2001, as evidenced by YAML's original name, "*Yet Another ...*"). HUML looks like YAML, but borrows characteristics from many existing languages with the primary focus on enforcing human readability and consistency across contexts.

But really, why? Why not!

## Goals
- Human readability and editability.
- Visual comprehension of data structures and hierarchies.
- Avoid footguns and ambiguities in syntax and data types.
- As few ways of representing something as possible to ensure consistency.
- Strictness for form and consistency.
- Avoid the need for visual formatters.

---

## Specification

### Encoding and basic structure

* UTF-8 encoding.
* Line breaks: Unix-style (`\n`).
* Blank lines are ignored.
* Optional version declaration at the top: `%HUML <version>` (e.g., `%HUML 0.1`). If this is not present, a parser is to apply the latest specification.

### Data types

HUML supports scalar (string, number, bool, null) and vector (list, dict) data types.

| Type | Description | Example |
|------|-------------|----------|
| **String** | Always quoted. | `"foo"`, `"Hello World"` |
| | Single-line strings: all `"` and `\` must be escaped. | `\"`, `\\` |
| | Multi-line strings are wrapped in ```` (three backticks) to preserve spaces or `"""` (three double quotes) to strip them. | |
| | Characters inside a multi-line string do not need to be escaped, and `\n`, `\t` are treated literally. | |
| **Number** | **Integer** | `123`, `+123`, `-123` |
| | **Float** (64-bit, IEEE 754 double-precision floating-point) | `3.14`, `-0.5` |
| | **Special values**. The special numerical values are unquoted. | `nan`, `inf`, `+inf`, `-inf` |
| | *Notations* | |
| | **Exponent**, denoted by a lowercase `e` | `1e10`, `6.022e23` |
| | **Hex**, begins with `0x` | `0x1A`, `0xCAFE` |
| | **Octal**, begins with `0o` | `0o12`, `0o755` |
| | **Binary**, begins with `0b` | `0b1010`, `0b11011001` |
| | Numbers can have arbitrary underscore characters for readability, which are simply ignored while parsing. | `1_00_0000` |
| **Boolean** | True or false values. | `true`, `false` |
| **Null** | Null value. | `null` |
| **List** | Array of arbitrary data types. | `1, 2, "three"` |
|          | Definition can be inline or multi-line. |  |
|          | Multi-line items are prefixed with a `-`, like a bullet point list. |  |
|          | `[]` is a special signifier used to denote an empty list, e.g., `items:: []`. | `[]` |
| **Dict** | Unordered map of key-value pairs. Keys are strings and values can be of arbitrary data types. | `hello: "world", num: 123` |
|          | Definition can be inline or multi-line. | |
|          | Duplicate keys inside a dict are not allowed. | |
|          | `{}` is a special signifier used to denote an empty dict, e.g., `items:: {}`. | `{}` |

------------

### Indentation

* Strictly 2 spaces per indentation level. For multi-line list and dict vector definitions, indentation represents hierarchy.

------------

### Spaces
The presence of space characters is strictly controlled.
* Trailing spaces are not allowed on any line, including empty lines and comment-only lines, except for content within multi-line strings, where they are treated as content.
* The comment marker `#` must be immediately followed by one space before the comment contents, e.g., `# Comment` and not `#Comment`.
* Only a single space is allowed after the indicators `:`, `::`, and `-` and before the subsequent value.
* For multi-line vectors, `::` must be immediately followed by a line break, unless it is a comment starting with `#`.
* In inline lists, commas must not have preceding spaces and must be followed by exactly one space, e.g., `1, 2, 3`.

------------

### Comments

* Lines beginning with `#` are comments. Comments can have preceding spaces, but not trailing spaces.
* After `#`, there must be at least one space before any other character.

```huml
# Comment-only line
key: "value"         # Inline comment with a lot of preceding spaces.
```

------------

### Keys and values

- Keys are case-sensitive Unicode strings.
  - If alphanumeric `a-zA-Z0-9_-`, they do not need to be quoted.<br />e.g., `foo: 123`, `foo-bar: "yes"`
  - If any other characters, including spaces, are present, keys must be quoted.<br />e.g., `foo: 123`, `"foo bar": 123, "ഭൂമി": "Earth"`
- Scalar keys are denoted by the key followed by a single colon (`:`).
- Vector keys are denoted by the key followed by double colons (`::`).
- No spaces are allowed before the `:` or `::`, and they must be followed by exactly one space before the value.

------------

### Scalars

Scalars (string, number, boolean, null) are denoted by a single colon (`:`).

```huml
key: "value"
number: 123
boolean: true
type: null
```

### Multi-line strings

In multi-line string blocks, no escaping is necessary. Characters are treated literally. Multi-line strings can be defined in two different ways. As the beginning and ending markers can be derived from the indentation, there is no need to escape the three double quotes or backticks themselves in the string content.

#### 1) Preserve spaces: ******` ``` `******
The content block must be indented by one level (2 spaces) relative to the key. These initial 2 spaces on each line are stripped. All other preceding and all trailing spaces are preserved as content.

````huml
description: ```
  Line 1
   Line 2
    Line 3
          All spaces are preserved.
```
````

is parsed as:

```
Line 1
 Line 2
  Line 3
        All spaces are preserved.
```

#### 2) Ignore preceding and trailing spaces: ******`"""`******
All leading and trailing whitespace on each line of content is stripped.

```huml
description: """
  Line 1
   Line 2
    Line 3
         All spaces are ignored.   
"""
```

is parsed as:
```
Line 1
Line 2
Line 3
All spaces are ignored.
```

------------

### Vectors

Vectors are denoted by double colons (`::`) and can be lists (arrays) or dicts (unordered key-value maps or dictionaries).

#### Lists

* **Inline:** Comma-separated without trailing commas. Inline list items can only be scalar values and cannot contain vectors or nesting.
* **Multi-line:** A hyphen `-` denotes a list item, indented by 2 spaces relative to its parent. Multi-line lists can be nested and can contain vectors.
* **Empty list:** A vector can be marked as an empty list with the special value `[]`.

```huml
inline_list:: 1, 2, "three"

multiline_list::
  - 1
  - 2
  - "three"

# [1, 2, "three", [1, 2, "three"]]
nested_list::
  - 1
  - 2
  - "three"
  - ::
    - 1
    - 2
    - "three"

# [{"one": 1, "foo": "bar"}, {"two": 2, "foo": "baz"}]
list_of_dicts::
   - ::
     one: 1
     foo: "bar"
   - ::
     two: 2
     foo: "baz"

empty_list:: []
```

#### Dicts

* **Inline:** Keys inside a dict are `key: value` pairs, comma-separated without trailing commas. Inline dicts can only contain scalar key-values and cannot contain vectors or nesting.
* **Multi-line:** Keys inside a dict are `key: value` on a line indented by 2 spaces relative to its parent. Multi-line dicts can be nested and can contain vectors.
* **Empty dict:** A vector can be marked as an empty dict with the special value `{}`.

```huml
inline_dict:: one: 1, foo: "bar"

multiline_dict::
  one: 1
  foo: "bar"

# {"one": 1, "foo": "bar", "nested": {"two": 2, "foo": "baz"}}
nested_dict::
  one: 1
  foo: "bar"
  nested::
    two: 2
    foo: "baz"

empty_dict:: {}
```

------------------

# Example

## Why `::`?

1) The indicator `::` immediately makes it apparent that what follows is a vector, to both human readers and parsers. Less guessing.

```huml
# Inline list: [1, 2, 3, "four"]
foo:: 1, 2, 3, "four"

# Inline dict: {"foo": {"bar": "baz", "one": 1}}
foo:: bar: "baz", one: 1

# Multi-line list
foo::
  - 1
  - 2
  - 3

# Multi-line dict
foo::
  bar: "baz"
  one: 1
```

2) It permits vectors to be defined inline without additional syntax such as `[ ... ]` or `{ ... }`. Opening and closing enclosures bring in complexities of keeping track of nesting and balancing closures, both for humans and parsers.

```huml
# This is a list with one item: key = ["one"]
key:: "one"

# Without :: it is not possible to represent an inline list
# without an enclosure such as [ ... ]. For example, key: ["one"]
# Here, key = "one"
key: "one"
```

3) It avoids several ambiguities. In YAML, for example:
```yaml
# Although this looks like a list, it is a string: foo = "1, 2, 3"
foo: 1, 2, 3

# Square brackets denote a list.
foo: [1, 2, 3]

# Square brackets over multiple lines are also a list.
foo: [
1,
 2,
  3,
]

# And this is also a list.
foo:
- 1
- 2
- 3

# Although this looks like a nested list,
# it actually translates to: {"foo": ["1 - 2 - 3"]}
# WUT?
foo:
 - 1
  - 2
  - 3
```

## Key-less documents

An empty HUML document is evaluated as an empty dict by default. However, a document does not need to be a dict at the root. Similar to JSON, it can be a key-less scalar or a list.

```huml
true
```

```huml
"Hello, world"
```

```huml
:: 1, 2, 3
```

```huml
::
  - "first"
  - "second"
```

```huml
# Special indicator for an empty dict.
:: {}
```

```huml
# Special indicator for an empty list.
:: []
```

---

## Kitchensink example

```huml
%HUML 0.1 # Document version declaration

# This is the root dictionary for our application configuration.
application_config::
  application_name: "HUML Showcase Suite"
  version: "1.0.0-beta"
  environment: "development" # Can be 'production', 'staging', etc.
  debug_mode: true
  retry_attempts: 5
  timeout_seconds: 30.5
  feature_flags:: # A nested dictionary for feature toggles
    new_dashboard_enabled: true
    user_experiment_ab: false
    "legacy-system.compatibility_mode": true # Quoted key

  # Contact information
  contact_points::
    - :: # List item: inline dictionary for admin
      type: "admin"
      email: "admin@example.com"
      phone: null # Null value example
    - :: # List item: multi-line dictionary for support
      type: "support"
      email: "support@example.com"
      availability::
        weekdays: "9am - 6pm"
        weekends: "10am - 2pm"

  # Numeric data types showcase
  numerical_data::
    integer_val: 1_234_567
    float_val: -0.00789
    scientific_notation_val: 6.022e23
    hex_val: 0xCAFEBABE
    octal_val: 0o755
    binary_val: 0b11011001
    infinity_positive: +inf
    infinity_negative: -inf
    not_a_number: nan
    empty_integer_list:: [] # Empty list
    empty_mapping:: {}    # Empty dictionary

  # String variations
  string_examples::
    simple_greeting: "Hello, \"Universe\"!"
    path_example: "C:\\Users\\Default\\Documents"
    multiline_preserved_poem: ```
      The HUML spec, so clear and bright,
        Makes data shine with pure delight.
      No ambiguity, no YAML fright,
      Just structured sense, and pure insight.
    ```
    multiline_stripped_script: """
          #!/bin/bash
          echo "Starting service..."
          # This script has leading spaces stripped.
            # Even this indented comment.
          exit 0
    """

  # List variations
  data_sources::
    - "primary_db_connection_string"
    - "secondary_api_endpoint_url"
    - "192.168.1.100" # IP address as a string
    - :: # A list of lists
      - "alpha"
      - "beta"
      - "gamma"
    - true # A boolean in a list

  inline_collections::
    simple_list:: "red", "green", "blue"
    simple_dict:: color: "yellow", intensity: 0.8, transparent: false
    # List of inline dictionaries
    points_of_interest::
      - :: x: 10, y: 20, label: "Start"
      - :: x: 15, y: 25, label: "Checkpoint 1"
      - :: x: 30, y: 10, label: "End"

  # Example of a more complex nested structure
  server_nodes::
    - :: # First server node (dictionary)
      id: "node-alpha-001"
      ip_address: "10.0.0.1"
      roles:: "web", "api" # Inline list
      status: "active"
      "metadata with space": "custom server info" # Quoted key
      config_file_content: ```
        # Sample config for node-alpha-001
        port = 8080
        threads = 16
      ```
    - :: # Second server node (dictionary)
      id: "node-beta-002"
      ip_address: "10.0.0.2"
      roles::
        - "database_primary"
        - "replication_master"
      status: "pending_maintenance"
      hardware_specs::
        cpu_cores: 8
        ram_gb: 64
        storage_tb: 2

# Another top-level key, independent of 'application_config'
# This demonstrates that a HUML file can have multiple top-level keys,
# implicitly forming a root dictionary.
user_preferences::
  theme: "solarized_dark"
  font_size_pt: 12
  show_tooltips: true

```