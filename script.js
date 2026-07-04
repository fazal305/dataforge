const sourceInput = document.querySelector("#sourceInput");
const fileInput = document.querySelector("#fileInput");
const parseBtn = document.querySelector("#parseBtn");
const validateBtn = document.querySelector("#validateBtn");
const clearBtn = document.querySelector("#clearBtn");
const statusMessage = document.querySelector("#statusMessage");
const statsBar = document.querySelector("#statsBar");
const prettyPanel = document.querySelector("#prettyPanel");
const treePanel = document.querySelector("#treePanel");
const treeSearch = document.querySelector("#treeSearch");
const matchCount = document.querySelector("#matchCount");
const copyPrettyBtn = document.querySelector("#copyPrettyBtn");
const downloadPrettyBtn = document.querySelector("#downloadPrettyBtn");
const jsonToXmlBtn = document.querySelector("#jsonToXmlBtn");
const xmlToJsonBtn = document.querySelector("#xmlToJsonBtn");
const convertedOutputPanel = document.querySelector("#convertedOutput");
const copyConvertedBtn = document.querySelector("#copyConvertedBtn");
const downloadConvertedBtn = document.querySelector("#downloadConvertedBtn");
const sampleJsonBtn = document.querySelector("#sampleJsonBtn");
const sampleXmlBtn = document.querySelector("#sampleXmlBtn");
const tabButtons = document.querySelectorAll(".tab-btn");

let currentData = null;
let currentFormat = "auto";
let currentRawText = "";
let detectedFormat = null;
let convertedOutput = "";

const sampleJSON = {
  status: "success",
  requestId: "api_2026_0704_01",
  user: {
    id: 305,
    name: "Fazal Khan",
    active: true,
    profile: {
      role: "Frontend Developer",
      location: "Karachi",
      tags: ["portfolio", "javascript", "api-tools"]
    },
    addresses: [
      {
        type: "home",
        city: "Karachi",
        postalCode: "74000"
      },
      {
        type: "office",
        city: "Lahore",
        postalCode: "54000"
      }
    ]
  },
  meta: {
    page: 1,
    total: 2,
    cached: false
  }
};

const sampleXML = `<catalog updated="2026-07-04">
  <book id="bk-101" genre="frontend">
    <title>JavaScript Interfaces</title>
    <author>Amara Shah</author>
    <price currency="USD">39.00</price>
    <tags>
      <tag>javascript</tag>
      <tag>developer-tools</tag>
    </tags>
  </book>
  <book id="bk-102" genre="data">
    <title>Structured Data Patterns</title>
    <author>Ray Chen</author>
    <price currency="USD">44.50</price>
    <tags>
      <tag>xml</tag>
      <tag>json</tag>
    </tags>
  </book>
</catalog>`;

/** Detects whether source text looks like JSON or XML. */
function detectFormat(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }
  if (trimmed.startsWith("<")) {
    return "xml";
  }
  return null;
}

/** Validates JSON text and returns parsed data or an error. */
function validateJSON(text) {
  try {
    return { valid: true, data: JSON.parse(text) };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/** Validates XML text and returns a parsed document or an error. */
function validateXML(text) {
  const xmlDoc = new DOMParser().parseFromString(text, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    return { valid: false, error: parserError.textContent.trim() || "Invalid XML document." };
  }
  return { valid: true, doc: xmlDoc };
}

/** Parses the input, updates application state, and renders all output panels. */
async function handleParse() {
  setLoading(true);
  await Promise.resolve();

  const text = sourceInput.value.trim();
  currentRawText = sourceInput.value;

  if (!text) {
    handleClear();
    showStatus("Paste JSON or XML to begin.", "error");
    setLoading(false);
    return;
  }

  const format = currentFormat === "auto" ? detectFormat(text) : currentFormat;
  if (!format) {
    showStatus("Could not detect a format. Choose JSON or XML, then try again.", "error");
    setLoading(false);
    return;
  }

  const result = format === "json" ? validateJSON(text) : validateXML(text);
  if (!result.valid) {
    currentData = null;
    detectedFormat = null;
    showStatus(`${format.toUpperCase()} validation failed: ${result.error}`, "error");
    setControlsEnabled(false);
    setLoading(false);
    return;
  }

  currentData = format === "json" ? result.data : result.doc;
  detectedFormat = format;
  convertedOutput = "";
  convertedOutputPanel.value = "";
  renderPretty(currentData, detectedFormat);
  renderTree(currentData, detectedFormat);
  renderStats(currentData, detectedFormat);
  setControlsEnabled(true);
  showStatus(`${detectedFormat.toUpperCase()} parsed successfully.`, "success");
  setLoading(false);
}

/** Renders formatted JSON or XML in the pretty print panel. */
function renderPretty(data, format) {
  prettyPanel.textContent = format === "json" ? JSON.stringify(data, null, 2) : prettyPrintXML(data);
}

/** Serializes and indents an XML document. */
function prettyPrintXML(xmlDoc) {
  const raw = new XMLSerializer().serializeToString(xmlDoc);
  const withoutDeclaration = raw.replace(/>\s*</g, ">\n<");
  const lines = withoutDeclaration.split("\n");
  let indent = 0;

  return lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("</")) {
      indent = Math.max(indent - 1, 0);
    }
    const formatted = `${"  ".repeat(indent)}${trimmed}`;
    if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.match(/^<[^>]+>.*<\/[^>]+>$/)) {
      indent += 1;
    }
    return formatted;
  }).join("\n");
}

/** Renders a collapsible JSON or XML tree. */
function renderTree(data, format) {
  const searchTerm = treeSearch.value.trim();
  treePanel.textContent = "";
  const rootNode = format === "json"
    ? createTreeNode("root", data, searchTerm, true)
    : createXMLTreeNode(data.documentElement, searchTerm, true);
  treePanel.appendChild(rootNode);
}

/** Creates a recursive JSON tree node. */
function createTreeNode(key, value, searchTerm = "", isRoot = false) {
  const node = document.createElement("div");
  const valueType = getValueType(value);
  node.className = "tree-node";

  const row = document.createElement("div");
  row.className = "tree-row";
  const canExpand = valueType === "object" || valueType === "array";

  if (canExpand) {
    const toggle = document.createElement("button");
    toggle.className = "toggle-btn";
    toggle.type = "button";
    toggle.textContent = "-";
    toggle.setAttribute("aria-label", `Toggle ${key}`);
    toggle.addEventListener("click", () => {
      node.classList.toggle("collapsed");
      toggle.textContent = node.classList.contains("collapsed") ? "+" : "-";
    });
    row.appendChild(toggle);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "toggle-spacer";
    row.appendChild(spacer);
  }

  const keyEl = document.createElement("span");
  keyEl.className = "key";
  keyEl.innerHTML = isRoot ? "root" : highlightMatches(key, searchTerm);
  row.appendChild(keyEl);

  if (canExpand) {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = valueType === "array" ? `${value.length} items` : `${Object.keys(value).length} keys`;
    row.appendChild(badge);
  } else {
    const valueEl = document.createElement("span");
    valueEl.className = `value-${valueType}${valueType === "boolean" ? ` ${value}` : ""}`;
    valueEl.innerHTML = valueType === "string"
      ? `"${highlightMatches(value, searchTerm)}"`
      : highlightMatches(String(value), searchTerm);
    row.appendChild(valueEl);
  }

  node.appendChild(row);

  if (canExpand) {
    const children = document.createElement("div");
    children.className = "tree-children";
    if (Array.isArray(value)) {
      value.forEach((item, index) => children.appendChild(createTreeNode(`[${index}]`, item, searchTerm, false)));
    } else {
      Object.entries(value).forEach(([childKey, childValue]) => {
        children.appendChild(createTreeNode(childKey, childValue, searchTerm, false));
      });
    }
    node.appendChild(children);
  }

  return node;
}

/** Creates a recursive XML tree node. */
function createXMLTreeNode(nodeValue, searchTerm = "", isRoot = false) {
  const node = document.createElement("div");
  node.className = "tree-node";

  const row = document.createElement("div");
  row.className = "tree-row";
  const childNodes = Array.from(nodeValue.childNodes).filter((child) => child.nodeType === Node.ELEMENT_NODE || child.textContent.trim());
  const canExpand = childNodes.length > 0;

  if (canExpand) {
    const toggle = document.createElement("button");
    toggle.className = "toggle-btn";
    toggle.type = "button";
    toggle.textContent = "-";
    toggle.setAttribute("aria-label", `Toggle ${nodeValue.nodeName}`);
    toggle.addEventListener("click", () => {
      node.classList.toggle("collapsed");
      toggle.textContent = node.classList.contains("collapsed") ? "+" : "-";
    });
    row.appendChild(toggle);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "toggle-spacer";
    row.appendChild(spacer);
  }

  const tagEl = document.createElement("span");
  tagEl.className = "tag-name";
  tagEl.innerHTML = isRoot ? `&lt;${highlightMatches(nodeValue.nodeName, searchTerm)}&gt;` : `&lt;${highlightMatches(nodeValue.nodeName, searchTerm)}&gt;`;
  row.appendChild(tagEl);

  Array.from(nodeValue.attributes || []).forEach((attr) => {
    const attrEl = document.createElement("span");
    attrEl.className = "attr-pill";
    attrEl.innerHTML = `${highlightMatches(attr.name, searchTerm)}="${highlightMatches(attr.value, searchTerm)}"`;
    row.appendChild(attrEl);
  });

  node.appendChild(row);

  if (canExpand) {
    const children = document.createElement("div");
    children.className = "tree-children";
    childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        children.appendChild(createXMLTreeNode(child, searchTerm, false));
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        const textNode = document.createElement("div");
        textNode.className = "tree-row";
        textNode.innerHTML = `<span class="toggle-spacer"></span><span class="value-text">${highlightMatches(child.textContent.trim(), searchTerm)}</span>`;
        children.appendChild(textNode);
      }
    });
    node.appendChild(children);
  }

  return node;
}

/** Renders format, depth, count, and size statistics. */
function renderStats(data, format) {
  const stats = format === "json"
    ? [
      ["Format", "JSON"],
      ["Keys", countKeys(data)],
      ["Max Depth", getMaxDepth(data, 1)],
      ["Arrays", countArrays(data)],
      ["Attributes", "N/A"],
      ["Size", formatBytes(new Blob([currentRawText]).size)]
    ]
    : [
      ["Format", "XML"],
      ["Tags", countXMLElements(data)],
      ["Max Depth", getMaxXMLDepth(data.documentElement, 1)],
      ["Arrays", "N/A"],
      ["Attributes", countXMLAttributes(data)],
      ["Size", formatBytes(new Blob([currentRawText]).size)]
    ];

  statsBar.innerHTML = stats.map(([label, value]) => (
    `<div class="stat-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`
  )).join("");
  statsBar.hidden = false;
}

/** Counts keys recursively in JSON data. */
function countKeys(obj) {
  if (obj === null || typeof obj !== "object") {
    return 0;
  }
  if (Array.isArray(obj)) {
    return obj.reduce((total, item) => total + countKeys(item), 0);
  }
  return Object.entries(obj).reduce((total, [, value]) => total + 1 + countKeys(value), 0);
}

/** Counts arrays recursively in JSON data. */
function countArrays(obj) {
  if (obj === null || typeof obj !== "object") {
    return 0;
  }
  const childCount = Array.isArray(obj)
    ? obj.reduce((total, item) => total + countArrays(item), 0)
    : Object.values(obj).reduce((total, value) => total + countArrays(value), 0);
  return Array.isArray(obj) ? childCount + 1 : childCount;
}

/** Finds maximum nesting depth in JSON data. */
function getMaxDepth(obj, depth = 1) {
  if (obj === null || typeof obj !== "object") {
    return depth;
  }
  const values = Array.isArray(obj) ? obj : Object.values(obj);
  if (values.length === 0) {
    return depth;
  }
  return Math.max(...values.map((value) => getMaxDepth(value, depth + 1)));
}

/** Counts XML element nodes. */
function countXMLElements(xmlDoc) {
  return xmlDoc.getElementsByTagName("*").length;
}

/** Counts XML attributes across all elements. */
function countXMLAttributes(xmlDoc) {
  return Array.from(xmlDoc.getElementsByTagName("*")).reduce((total, element) => total + element.attributes.length, 0);
}

/** Finds maximum XML element depth. */
function getMaxXMLDepth(node, depth = 1) {
  const children = Array.from(node.children);
  if (children.length === 0) {
    return depth;
  }
  return Math.max(...children.map((child) => getMaxXMLDepth(child, depth + 1)));
}

/** Converts a JavaScript object into XML text. */
function convertJSONtoXML(jsonObj) {
  const buildNode = (key, value) => {
    const safeKey = sanitizeTagName(key);
    if (Array.isArray(value)) {
      return value.map((item) => buildNode(safeKey, item)).join("");
    }
    if (value !== null && typeof value === "object") {
      const children = Object.entries(value).map(([childKey, childValue]) => buildNode(childKey, childValue)).join("");
      return `<${safeKey}>${children}</${safeKey}>`;
    }
    return `<${safeKey}>${escapeXml(String(value))}</${safeKey}>`;
  };

  if (jsonObj === null || typeof jsonObj !== "object") {
    return prettyPrintXML(new DOMParser().parseFromString(`<root>${escapeXml(String(jsonObj))}</root>`, "application/xml"));
  }

  if (Array.isArray(jsonObj)) {
    return prettyPrintXML(new DOMParser().parseFromString(`<root>${jsonObj.map((item) => buildNode("item", item)).join("")}</root>`, "application/xml"));
  }

  const entries = Object.entries(jsonObj);
  const xml = entries.length === 1 ? buildNode(entries[0][0], entries[0][1]) : `<root>${entries.map(([key, value]) => buildNode(key, value)).join("")}</root>`;
  return prettyPrintXML(new DOMParser().parseFromString(xml, "application/xml"));
}

/** Converts an XML document into a JavaScript object. */
function convertXMLtoJSON(xmlDoc) {
  const convertElement = (element) => {
    const result = {};
    if (element.attributes.length) {
      result["@attributes"] = {};
      Array.from(element.attributes).forEach((attr) => {
        result["@attributes"][attr.name] = attr.value;
      });
    }

    const elementChildren = Array.from(element.children);
    const textContent = Array.from(element.childNodes)
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent.trim())
      .filter(Boolean)
      .join(" ");

    elementChildren.forEach((child) => {
      const childValue = convertElement(child);
      if (Object.prototype.hasOwnProperty.call(result, child.nodeName)) {
        if (!Array.isArray(result[child.nodeName])) {
          result[child.nodeName] = [result[child.nodeName]];
        }
        result[child.nodeName].push(childValue);
      } else {
        result[child.nodeName] = childValue;
      }
    });

    if (textContent) {
      if (Object.keys(result).length === 0) {
        return textContent;
      }
      result["#text"] = textContent;
    }

    return result;
  };

  return { [xmlDoc.documentElement.nodeName]: convertElement(xmlDoc.documentElement) };
}

/** Converts current data in the requested direction. */
function handleConvert(direction) {
  if (!currentData || !detectedFormat) {
    showStatus("Parse data before converting.", "error");
    return;
  }

  if (direction === "json-to-xml" && detectedFormat !== "json") {
    showStatus("Current data is not JSON.", "error");
    return;
  }

  if (direction === "xml-to-json" && detectedFormat !== "xml") {
    showStatus("Current data is not XML.", "error");
    return;
  }

  convertedOutput = direction === "json-to-xml"
    ? convertJSONtoXML(currentData)
    : JSON.stringify(convertXMLtoJSON(currentData), null, 2);

  convertedOutputPanel.value = convertedOutput;
  copyConvertedBtn.disabled = false;
  downloadConvertedBtn.disabled = false;
  showStatus("Conversion complete.", "success");
}

/** Re-renders tree search highlights and match count. */
function handleSearch() {
  if (!currentData || !detectedFormat) {
    return;
  }
  const term = treeSearch.value.trim();
  renderTree(currentData, detectedFormat);
  const matches = countMatches(currentData, term, detectedFormat);
  matchCount.textContent = `${matches} ${matches === 1 ? "match" : "matches"}`;
}

/** Counts search matches in JSON or XML structures. */
function countMatches(data, term, format) {
  if (!term) {
    return 0;
  }
  const needle = term.toLowerCase();
  let total = 0;
  const addMatches = (value) => {
    const haystack = String(value).toLowerCase();
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      total += 1;
      index = haystack.indexOf(needle, index + needle.length);
    }
  };

  const walkJSON = (value, key = "") => {
    if (key) {
      addMatches(key);
    }
    if (value !== null && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach((item, index) => walkJSON(item, `[${index}]`));
      } else {
        Object.entries(value).forEach(([childKey, childValue]) => walkJSON(childValue, childKey));
      }
    } else {
      addMatches(value);
    }
  };

  const walkXML = (node) => {
    addMatches(node.nodeName);
    Array.from(node.attributes || []).forEach((attr) => {
      addMatches(attr.name);
      addMatches(attr.value);
    });
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walkXML(child);
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        addMatches(child.textContent.trim());
      }
    });
  };

  if (format === "json") {
    walkJSON(data, "root");
  } else {
    walkXML(data.documentElement);
  }

  return total;
}

/** Escapes text and wraps search matches in mark tags. */
function highlightMatches(text, term) {
  const escaped = escapeHtml(String(text));
  if (!term) {
    return escaped;
  }
  const escapedTerm = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${escapedTerm})`, "gi"), '<mark class="highlight">$1</mark>');
}

/** Escapes HTML special characters. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Copies formatted output to the clipboard. */
async function handleCopyPretty() {
  await navigator.clipboard.writeText(prettyPanel.textContent);
  flashButton(copyPrettyBtn, "Copied!");
}

/** Downloads formatted output as JSON or XML. */
function handleDownloadPretty() {
  const extension = detectedFormat === "json" ? "json" : "xml";
  downloadText(prettyPanel.textContent, `dataforge-pretty.${extension}`);
}

/** Copies converted output to the clipboard. */
async function handleCopyConverted() {
  await navigator.clipboard.writeText(convertedOutput);
  flashButton(copyConvertedBtn, "Copied!");
}

/** Downloads converted output with the correct extension. */
function handleDownloadConverted() {
  const extension = detectedFormat === "json" ? "xml" : "json";
  downloadText(convertedOutput, `dataforge-converted.${extension}`);
}

/** Imports a local text, JSON, or XML file into the editor. */
async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const text = await file.text();
  sourceInput.value = text;
  currentRawText = text;
  await handleParse();
  fileInput.value = "";
}

/** Resets all application state and visible output. */
function handleClear() {
  currentData = null;
  currentRawText = "";
  detectedFormat = null;
  convertedOutput = "";
  sourceInput.value = "";
  treeSearch.value = "";
  matchCount.textContent = "0 matches";
  prettyPanel.textContent = "Paste JSON or XML above to begin.";
  treePanel.innerHTML = '<p class="empty-state">No data loaded yet.</p>';
  convertedOutputPanel.value = "";
  statsBar.hidden = true;
  statsBar.textContent = "";
  setControlsEnabled(false);
  showStatus("", "");
}

/** Shows an inline success or error message. */
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`.trim();
}

/** Toggles parse button loading state. */
function setLoading(isLoading) {
  parseBtn.disabled = isLoading;
  parseBtn.textContent = isLoading ? "Parsing..." : "Parse";
}

/** Formats byte counts in a readable unit. */
function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/** Returns a readable data type label. */
function getValueType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}

/** Enables or disables controls that require parsed data. */
function setControlsEnabled(isEnabled) {
  copyPrettyBtn.disabled = !isEnabled;
  downloadPrettyBtn.disabled = !isEnabled;
  treeSearch.disabled = !isEnabled;
  jsonToXmlBtn.disabled = !(isEnabled && detectedFormat === "json");
  xmlToJsonBtn.disabled = !(isEnabled && detectedFormat === "xml");
  copyConvertedBtn.disabled = !convertedOutput;
  downloadConvertedBtn.disabled = !convertedOutput;
}

/** Downloads text content through a temporary object URL. */
function downloadText(text, filename) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Escapes XML text content. */
function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Converts arbitrary object keys into valid XML tag names. */
function sanitizeTagName(key) {
  const cleaned = String(key).replace(/[^a-zA-Z0-9_.-]/g, "-");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `item-${cleaned}`;
}

/** Briefly changes button text after a successful copy. */
function flashButton(button, text) {
  const original = button.textContent;
  button.textContent = text;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFormat = button.dataset.format;
    tabButtons.forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    showStatus(`Input mode set to ${currentFormat === "auto" ? "auto-detect" : currentFormat.toUpperCase()}.`, "");
  });
});

parseBtn.addEventListener("click", handleParse);
validateBtn.addEventListener("click", handleParse);
clearBtn.addEventListener("click", handleClear);
fileInput.addEventListener("change", handleFileImport);
treeSearch.addEventListener("input", handleSearch);
copyPrettyBtn.addEventListener("click", handleCopyPretty);
downloadPrettyBtn.addEventListener("click", handleDownloadPretty);
jsonToXmlBtn.addEventListener("click", () => handleConvert("json-to-xml"));
xmlToJsonBtn.addEventListener("click", () => handleConvert("xml-to-json"));
copyConvertedBtn.addEventListener("click", handleCopyConverted);
downloadConvertedBtn.addEventListener("click", handleDownloadConverted);
sampleJsonBtn.addEventListener("click", async () => {
  sourceInput.value = JSON.stringify(sampleJSON, null, 2);
  await handleParse();
});
sampleXmlBtn.addEventListener("click", async () => {
  sourceInput.value = sampleXML;
  await handleParse();
});
