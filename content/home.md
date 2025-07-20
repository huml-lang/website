+++
title = "Home"
+++

````huml
# A sample HUML document.
website::
  hostname: "huml.io"
  ports:: 80, 443 # Inline list.
  enabled: true
  factor: 3.14
  props:: mime_type: "text/html", encoding: "gzip" # Inline dict.
  tags:: # Multi-line list.
    - "markup"
    - "webpage"
    - "schema"

haikus::
  one: """
    A quiet language
    Lines fall into their places
    Nothing out of place
  """
````

<br />

## Motivation

- HUML was primarily born out of the numerous frustrations with YAML, where one easy-to-miss, accidental indentation change can dangerously alter the semantics of a document.
- Other popular markup languages such as TOML and HCL are configuration-oriented. NestedText is an interesting approach, but is too primitive to be suitable for wider use cases. JSON is universal, but lacks comments, does not have a strict form for consistent readability across contexts, and has bracket-matching and formatting woes which make human editing difficult.
- Of these, YAML is the one that comes closest to indicating structure and hierarchy visually.

Ultimately, a new markup language is a subjective endeavor (it was even in 2001, as evidenced by YAML's original name, *Yet Another ...*). HUML looks like YAML, but borrows characteristics from many existing languages with the primary focus on enforcing human readability and consistency across contexts.

Still, why YET another markup language? <strong>Why not?</strong>

---

## Goals
- Ensure human readability and editability above all else.
- Enable visual comprehension of data structures and hierarchies.
- Avoid footguns and ambiguities in syntax and data types.
- Provide as few ways as possible—preferably one—of representing something.
- Maintain strict formatting for uniformity, eliminating the need for formatters.

<br />[Read the specs &rarr;](/specifications/v0-1-0)
