const { stateFromHTML } = require("draft-js-import-html");
const { convertToRaw, EditorState } = require("draft-js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const FromHTMLCustomBlockFn = (element) => {
  if (element.className === "callout") {
    return {
      type: "callout",
    };
  }
  return null;
};

const getId = () => Math.floor(Math.random() * Math.pow(2, 24)).toString(32);

const createCell = (type, value) => ({
  key: getId(),
  type: type,
  value: valueToDraft(value),
});

const valueToDraft = (value) => ({
  blocks: [
    {
      data: {},
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      key: getId(),
      text: value,
      type: "unstyled",
    },
  ],
  entityMap: {},
});

const createTable = (rows) => ({
  basic: false,
  celled: true,
  compact: false,
  fixed: true,
  inverted: false,
  rows: rows,
  striped: false,
});

global.document = new JSDOM(`...`).window.document;
const debug = process.env.NODE_ENV === "development";

const getYTVideoId = (url) => {
  let id = "";
  url = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    id = url[2].split(/[^0-9a-z_\-]/i);
    id = id[0];
  }
  return id;
};

const generateImageBlock = (elem) => {
  let block = {};
  let src = elem.src;
  let scales = null;

  if (src.indexOf("@@images") !== -1) {
    scales = src.match(/@@images\/image\/(.*)/);
    src = src.replace(/\/@@images.*$/, "");
  } else if (src.indexOf("/image_") !== -1) {
    scales = src.match(/image_(.*)/);
    src = src.replace(/\/image_.*$/, "");
  }

  block["@type"] = "image";
  block.url = src;
  if (elem.dataset.href != null) {
    block.href = elem.dataset.href;
  }
  if (elem.className.indexOf("image-left") !== -1) {
    block.align = "left";
  } else if (elem.className.indexOf("image-right") !== -1) {
    block.align = "right";
  } else if (elem.className.indexOf("image-inline") !== -1) {
    block.align = "center";
  }

  if (scales !== null) {
    switch (scales[1]) {
      case "large":
      case "image_large":
        block.size = "l";
        break;
      case "thumb":
      case "image_thumb":
      case "tile":
      case "image_tile":
        block.size = "s";
        break;
      default:
        block.size = "m";
        break;
    }
  }

  return block;
};

const generateIframeBlock = (elem) => {
  let youtubeId = getYTVideoId(elem.src);
  let block = {};
  if (youtubeId.length == 0) {
    block["@type"] = "html";
    block.html = elem.outerHTML;
  } else {
    block["@type"] = "video";
    block.url = "https://youtu.be/" + youtubeId;
  }
  return block;
};

const generateTableBlock = (elem) => {
  let block = {};
  block["@type"] = "table";
  const children = elem.children;
  let rows = [];
  // recursive search for reconstructing table
  for (const table of children) {
    for (const tchild of table.children) {
      if (tchild.tagName === "TR") {
        let cells = [];
        for (const cell of tchild.children) {
          cells.push(createCell("data", cell.textContent));
        }
        rows.push({ cells });
      }
    }
  }
  block.table = createTable(rows);
  return block;
};

const generateStandardBlock = (elem) => {
  let block = {};
  const contentState = stateFromHTML(elem.outerHTML, {
    customBlockFn: FromHTMLCustomBlockFn,
  });
  const editorState = EditorState.createWithContent(contentState);
  block["@type"] = "text";
  block.text = convertToRaw(editorState.getCurrentContent());
  return block;
};

const processInputData = (input) => {
  const dom = new JSDOM(input);
  const paragraphs = dom.window.document.body.children;
  const result = [];
  for (const paragraph of paragraphs) {
    let raw = {};
    const child = paragraph.firstElementChild;
    if (paragraph.tagName === "P") {
      if (child != null) {
        switch (child.tagName) {
          case "IMG":
            raw = generateImageBlock(child);
            break;
          case "TABLE":
            raw = generateTableBlock(child);
            break;
          case "IFRAME":
            raw = generateIframeBlock(child);
            break;
          default:
            raw = generateStandardBlock(paragraph);
            break;
        }
      } else {
        raw = generateStandardBlock(paragraph);
      }
    } else {
      switch (paragraph.tagName) {
        case "TABLE":
          raw = generateTableBlock(paragraph);
          break;
        case "IFRAME":
          raw = generateIframeBlock(paragraph);
          break;
        default:
          raw = generateStandardBlock(paragraph);
          break;
      }
    }
    result.push(raw);
  }
  return result;
};

module.exports = processInputData;
