const expect = require("chai").expect;
const converter = require("../converter");

describe("converter.js tests", () => {
  describe("converter method", () => {
    it("should convert simple text", () => {
      const html = "<p>foo</p>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("foo");
      expect(p.entityRanges).to.be.empty;
      expect(entityMap).to.be.empty;
    });
    it("should convert text with inline styles", () => {
      const html = "<p><em>foo</em> bar <strong>baz</strong></p>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("foo bar baz");
      expect(p.entityRanges).to.be.empty;
      expect(p.inlineStyleRanges).to.deep.equal([
        { offset: 0, length: 3, style: "ITALIC" },
        { offset: 8, length: 3, style: "BOLD" },
      ]);
      expect(entityMap).to.be.empty;
    });
    it("should convert empty text", () => {
      const html = "<p></p>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.be.empty;
      expect(p.entityRanges).to.be.empty;
      expect(p.inlineStyleRanges).to.be.empty;
      expect(entityMap).to.be.empty;
    });
    it("should convert text with links", () => {
      const html =
        '<p><a href="http://www.plone.com" data-linktype="external" data-val="http://www.plone.com">this is a link</a></p>';
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("this is a link");
      expect(p.entityRanges).to.deep.equal([{ key: 0, length: 14, offset: 0 }]);
      expect(entityMap).to.deep.equal({
        "0": {
          data: {
            "data-linktype": "external",
            "data-val": "http://www.plone.com",
            url: "http://www.plone.com",
          },
          mutability: "MUTABLE",
          type: "LINK",
        },
      });
      expect(p.inlineStyleRanges).to.be.empty;
    });
    it("should convert text with callout", () => {
      const html = '<p class="callout"><span>callout!</span></p>';
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("callout!");
      expect(p.type).to.equal("callout");
      expect(p.entityRanges).to.be.empty;
      expect(entityMap).to.be.empty;
      expect(p.inlineStyleRanges).to.be.empty;
    });
    it("should convert text with strong", () => {
      const html = "<p><strong>foo</strong></p>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("foo");
      expect(p.entityRanges).to.be.empty;
      expect(entityMap).to.be.empty;
      expect(p.inlineStyleRanges).to.deep.equal([
        { offset: 0, length: 3, style: "BOLD" },
      ]);
    });
    it("should convert text with code", () => {
      const html = "<p><code>foo</code></p>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("foo");
      expect(p.entityRanges).to.be.empty;
      expect(entityMap).to.be.empty;
      expect(p.inlineStyleRanges).to.deep.equal([
        { offset: 0, length: 3, style: "CODE" },
      ]);
    });
    it("should convert text with blockquote", () => {
      const html = "<blockquote><p>foo</p></blockquote>";
      const result = converter(html);

      const block = result[0];
      const p = block.text.blocks[0];
      const entityMap = block.text.entityMap;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("text");
      expect(p.text).to.equal("foo");
      expect(p.type).to.equal("blockquote");
      expect(p.entityRanges).to.be.empty;
      expect(entityMap).to.be.empty;
      expect(p.inlineStyleRanges).to.be.empty;
    });
    it("should convert text with image", () => {
      const html =
        '<p><img alt="" src="https://www.plone.org/logo.png" class="image-right" data-linktype="image"/></p>';
      const result = converter(html);

      const block = result[0];

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("image");
      expect(block.align).to.equal("right");
      expect(block.url).to.equal("https://www.plone.org/logo.png");
    });
    it("should convert text with image with different align", () => {
      const html =
        '<p><img alt="" src="https://www.plone.org/logo.png" class="image-inline" data-linktype="image"/></p>';
      const result = converter(html);

      const block = result[0];

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("image");
      expect(block.align).to.equal("center");
      expect(block.url).to.equal("https://www.plone.org/logo.png");
    });
    it("do not add image size if scale not present", () => {
      const result1 = converter(
        '<p><img src="http://www.foo.com/img.png"/></p>'
      );
      const result2 = converter('<p><img src="resolveuid/qwertyuiop"/></p>');

      expect(result1[0]).to.not.have.key("size");
      expect(result2[0]).to.not.have.key("size");
    });
    it("add image size if scale is present", () => {
      const result = converter(
        '<p><img src="resolveuid/qwertyuiop/image_mini"/></p>'
      );
      expect(result[0]).to.have.all.keys("@type", "size", "url");
      expect(result[0].size).to.equal("m");
    });
    it('add image size if scale is present in both "@@images/image/*" and "/image_*" form', () => {
      const result1 = converter(
        '<p><img src="resolveuid/qwertyuiop/image_mini"/></p>'
      );
      const result2 = converter(
        '<p><img src="resolveuid/qwertyuiop/@@images/image/mini"/></p>'
      );

      expect(result1[0]).to.have.all.keys("@type", "size", "url");
      expect(result1[0].size).to.equal("m");
      expect(result2[0]).to.have.all.keys("@type", "size", "url");
      expect(result2[0].size).to.equal("m");
    });
    it('add image size "l" if scale is "large"', () => {
      const result = converter(
        '<p><img src="resolveuid/qwertyuiop/image_large"/></p>'
      );
      expect(result[0]).to.have.all.keys("@type", "size", "url");
      expect(result[0].size).to.equal("l");
    });
    it('add image size "s" if scale is "thumb" or "tile"', () => {
      const result1 = converter(
        '<p><img src="resolveuid/qwertyuiop/image_thumb"/></p>'
      );
      const result2 = converter(
        '<p><img src="resolveuid/qwertyuiop/image_tile"/></p>'
      );

      expect(result1[0]).to.have.all.keys("@type", "size", "url");
      expect(result1[0].size).to.equal("s");
      expect(result2[0]).to.have.all.keys("@type", "size", "url");
      expect(result2[0].size).to.equal("s");
    });

    it('add image size "m" as default', () => {
      expect(
        converter('<p><img src="resolveuid/qwertyuiop/image_original"/></p>')[0]
          .size
      ).to.equal("m");
      expect(
        converter('<p><img src="resolveuid/qwertyuiop/image_preview"/></p>')[0]
          .size
      ).to.equal("m");
      expect(
        converter('<p><img src="resolveuid/qwertyuiop/image_minil"/></p>')[0]
          .size
      ).to.equal("m");
      expect(
        converter('<p><img src="resolveuid/qwertyuiop/image_foo"/></p>')[0].size
      ).to.equal("m");
      expect(
        converter(
          '<p><img src="resolveuid/qwertyuiop/@@images/image/original"/></p>'
        )[0].size
      ).to.equal("m");
      expect(
        converter(
          '<p><img src="resolveuid/qwertyuiop/@@images/image/preview"/></p>'
        )[0].size
      ).to.equal("m");
      expect(
        converter(
          '<p><img src="resolveuid/qwertyuiop/@@images/image/minil"/></p>'
        )[0].size
      ).to.equal("m");
      expect(
        converter(
          '<p><img src="resolveuid/qwertyuiop/@@images/image/foo"/></p>'
        )[0].size
      ).to.equal("m");
    });
    it("should convert text with table", () => {
      const html = `
      <table border="1">
            <tbody>
                <tr>
                    <td><strong>foo</strong></td>
                    <td><strong>bar</strong></td>
                    <td>baz</td>
                </tr>
            </tbody>
        </table>
      `;
      const result = converter(html);
      const block = result[0];
      const rows = block.table.rows;

      expect(result).to.have.lengthOf(1);
      expect(block["@type"]).to.equal("table");
      expect(rows).to.have.lengthOf(1);
      expect(rows[0].cells).to.have.lengthOf(3);
      expect(rows[0].cells[0].type).to.equal("data");
      expect(rows[0].cells[0].value.blocks[0].text).to.equal("foo");
      expect(rows[0].cells[1].value.blocks[0].text).to.equal("bar");
      expect(rows[0].cells[2].value.blocks[0].text).to.equal("baz");
    });
  });
  it("should convert youtube iframe to video block", () => {
    const html =
      '<iframe src="https://www.youtube.com/embed/VASywEuqFd8"></iframe>';
    const result = converter(html);
    const block = result[0];

    expect(result).to.have.lengthOf(1);
    expect(block["@type"]).to.equal("video");
    expect(block.url).to.equal("https://youtu.be/VASywEuqFd8");
  });
  it("should convert generic iframe to html block", () => {
    const html = '<iframe src="https://foo/bar" width="200"></iframe>';
    const result = converter(html);
    const block = result[0];

    expect(result).to.have.lengthOf(1);
    expect(block["@type"]).to.equal("html");
    expect(block.html).to.equal(html);
  });
});
