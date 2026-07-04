# DataForge - XML & JSON Studio

A browser-based developer tool for inspecting, validating, converting,
and exporting JSON and XML structured data. Built with HTML5, CSS3,
and Vanilla JavaScript only.

## Live Links

- GitHub Repository: [fazal305/dataforge](https://github.com/fazal305/dataforge)
- Live Demo: [https://fazal305.github.io/dataforge/](https://fazal305.github.io/dataforge/)

## Overview

DataForge is a focused developer utility for working with structured JSON and XML in the browser. It validates pasted or imported data, renders a readable tree explorer, shows useful statistics, converts between formats, and exports results without any backend or build step.

As a portfolio project, it demonstrates practical DOM work, browser-native parsing APIs, recursive rendering, and careful UI feedback in a polished single-page tool.

## Features

- Auto-detect JSON or XML input
- Validate JSON with `JSON.parse`
- Validate XML with `DOMParser`
- Pretty-print JSON and XML
- Inspect data in a collapsible tree explorer
- Search JSON keys and values or XML tags, attributes, and text
- View format, depth, key/tag, array, attribute, and size statistics
- Convert JSON to XML
- Convert XML to JSON
- Import local JSON, XML, or text files
- Copy formatted and converted output
- Download formatted and converted output
- Load realistic sample JSON and XML data
- Fully responsive cyberpunk interface

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- DOMParser
- XMLSerializer
- Blob API
- Clipboard API
- FileReader-compatible file input
- URL.createObjectURL

## Learning Outcomes

- Parsing JSON with `JSON.parse`
- Formatting JSON with `JSON.stringify`
- Parsing XML with `DOMParser`
- Serializing XML with `XMLSerializer`
- Building recursive tree renderers
- Escaping HTML before rendering dynamic highlights
- Serializing and deserializing structured data
- Importing files in the browser
- Exporting files with `Blob` and `URL.createObjectURL`
- Validating syntax and showing friendly UI feedback
- Converting between JSON and XML structures

## Folder Structure

```text
dataforge/
  index.html
  styles.css
  script.js
  README.md
  LICENSE
  .gitignore
```

## How To Run Locally

```powershell
git clone https://github.com/fazal305/dataforge.git
cd dataforge
start index.html
```

You can also open `index.html` directly in any modern browser.

## How To Use

1. Paste JSON or XML into the source data editor.
2. Keep Auto-detect selected, or choose JSON/XML manually.
3. Click Parse or Validate.
4. Review the pretty-printed output, stats, and tree explorer.
5. Search the tree to highlight matching keys, tags, values, attributes, or text.
6. Convert JSON to XML or XML to JSON when the matching format is loaded.
7. Copy or download the formatted and converted output.

## Sample Data

### Sample JSON

```json
{
  "status": "success",
  "user": {
    "id": 305,
    "name": "Fazal Khan",
    "active": true,
    "profile": {
      "role": "Frontend Developer",
      "tags": ["portfolio", "javascript", "api-tools"]
    }
  }
}
```

### Sample XML

```xml
<catalog updated="2026-07-04">
  <book id="bk-101" genre="frontend">
    <title>JavaScript Interfaces</title>
    <author>Amara Shah</author>
    <price currency="USD">39.00</price>
  </book>
</catalog>
```

## Future Improvements

- JSONPath query support
- YAML conversion
- XML Schema and JSON Schema validation
- JSON Schema generation
- Diff two structured inputs
- Share data through encoded URLs

## License

MIT License
