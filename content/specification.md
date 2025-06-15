+++
title = "HUML specification"
+++

# HUML specification

HUML is a machine-readable markup language with a focus on readability by humans. It is heavily inspired by YAML and shares significant similarities, but eliminates its complexities, ambiguities, and footguns. It is strict not just with indendentation, but aspects such as preceding and trailing spaces, specifically to ensure consistent form across contexts.

HUML is ideal for documents, datasets, and configuration files amongst other things.

## Motivation

- HUML was primarily born out of the numerous frustrations with YAML, where one easy-to-miss, accidental indentation can dangerously change the semantics of a document.
- JSON is universal, but lacks comments, is verbose, and is not strict to enforce form for readability.
- Other popular markup languages such as TOML and HCL are configuration oriented. NestedText is an interesting approach, but is too primitive to be suitable for wider usecases.

Ultimately, a new markup language is a subjective endevaour as evidenced by YAML's original "*Yet Another ...*" name from 2001. HUML borrows facets from many existing languages with the primary focus on enforcing human redability and accessibility.


---

## Specification

### Encoding and basic structure

* UTF-8 encoding.
* Line breaks: Unix-style (`\n`).
* Blank lines are ignored.
* Optional version declaration at the top: `%HUML <version>` (e.g., `%HUML 0.1`).

### Data types

HUML supports scalar (string, number, bool, null) and vector (list, dict) datatypes. 

| Type | Description | Example |
|------|-------------|----------|
| **String** | Always quoted | `"foo"`, `"Hello World"` |
| | Single-line strings, all `"` and `\` should be escaped. | `\"`, `\\` |
| | Multi-line strings wrapped in ``` (three backticks) preserve preceding spaces and `"""` do not.| |
| | Characters inside a multi-line string do not need be escaped and `\n`, `\t` are treated literally.| |
| **Number** | **Integer** | `123`, `+123`, `-123` |
| | **Float** (64 bit, IEEE 754 double precision floating point) | `3.14`, `-0.5` |
| | **Special values**. The special numerical values are unquoted. | `nan`, `inf`, `+inf`, `-inf` |
| | *Notations* | |
| | **Exponent**, denoted with lowercase `e` | `1e10`, `6.022e23` |
| | **Hex**, begins with `0x` | `0x1A`, `0xCAFE` |
| | **Octal**, begins with `0o` | `0o12`, `0o755` |
| | **Binary**, begins with `0b` | `0b1010`, `0b11011001` |
| | Numbers can have arbitrary underscore characters for readability. They are simply ignored while parsing. | `1_00_0000` |
| **Boolean** | True or false values | `true`, `false` |
| **Null** | Null value | `null` |
| **List** | Array of arbitrary datatypes. Definition can be inline or multi-line | `1, 2, "three"` |
|          | `[]` is a special signifier used to denote an empty list | `items: []` |
| **Dict** | Unordered map of key-value pairs. Keys are strings and values can be of arbitrary data types. | `hello: "world", num: 123` |
|          | Definition can be inline or multi-line. | |
|          | Duplicate keys inside a dict are not allowed. | |
|          | `{}` is a special signifier used to denote an empty dict | `objects: {}` |


------------

### Indentation

* Strictly 2 spaces per indentation level. For multi-line list and dict vector definitions, indentation represents hierarchy.

------------

### Spaces
The presence of space characters are strictly controlled.
* Only a single space is allowed after the indicator (`:`, `::`, `-`) and the subsequent value.
* Trailing spaces on lines are not allowed anywhere except in content lines inside multi-line strings.
* Preceding spaces are allowed before comments, anywhere `#` appears.

------------

### Comments

* Lines beginning with `#` are comments. Comments anywhere can have preceding spaces.
* After `#`, there must be minimum one space before any other character.

```huml
# Entire line comment
key: "value"  # Inline comment
```

------------

### Keys and values

- Keys are case-sensitive unicode strings.
  - If  alphanumeric `a-zA-Z0-9_-`, no need to be quoted. Eg: `foo: 123`, `foo-bar: "yes"`
  - If any other characters including spaces are present, keys have to be quoted Eg: `foo: 123`,  `"foo bar": 123`
- Scalar keys are denoted with the key followed by a single colon `:`
- Vector keys are denoted with the key followed by a double colon `::`
- Must have a space following colon(s) before value or inline comment.

------------

### Scalars

Scalars (string, number, boolean, null) are denoted with single colon `:`

```huml
key: "value"
number: 123
boolean: true
type: null
```

### Multi-line strings

In multi-line string blocks, no escaping is necessary. Characters are treated literally. Multi-line strings can be defined in two different ways, with three backticks (literal, preserves preceding spaces) or three double quotes (ignored preceding spaces)

#### 1) Preserve preceding spaces ******` ``` `******
All indentations are preserved starting from the minimum required indenation level (2 spaces from the beginning of the key)

````huml
description: ```
  Line 1
   Line 2
    Line 3
          All indentations are preserved.
````

is parsed as:

```
Line 1
 Line 2
  Line 3
        All indentations are preserved.
```

#### 2) Ignore preceding spaces ******`"""`******
All preceding spaces are ignored.


```huml
description: """
  Line 1
   Line 2
    Line 3
         All indentations are ignored.
"""
```

is parsed as:
```
Line 1
Line 2
Line 3
All indentations are ignored.
```

------------

### Vectors

Vectors are denoted with double colons `::` and can be lists (arrays) or dicts (unordered key-value maps or dictionaries).

#### Lists

* **Inline:** Comma-separated without trailing commas. Inline list items can only be scalar values and not vectors or nesting.
* **Multi-line:** A hyphen `-` denotes a list item, indented exactly by 2 spaces from the beginning of the parent key. Multi-line lists can be nested and can contain vectors.
* **Empty list:** A vector can be marked as an empty list with the special value `[]`

```huml
inline_list:: 1, 2, "three"

multiline_list::
  - 1
  - 2
  - "three"

# [1, 2, "threee", [1, 2, "three"]]
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

* **Inline:** `key: value` pairs comma separated without trailing commas. Inline dicts can only contain scalar key-values and not vectors or nesting.
* **Multiline:** `key: value` on a line indented exactly by 2 spaces from the beginning of the parent key. Multi-line dicts can be nested and can contain vectors.
* **Empty dict:** A vector can be marked as an empty dict with the special value `{}`

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

empty_dict: {}
```

### Key-less documents

A HUML document does not need to be a dict at the root. Similar to JSON, it can be a key-less scalar or a vector list.

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
    - 192.168.1.100 # IP address as string, or could be number
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
