const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app");

describe("Routes tests", () => {
  describe("/html_converter", () => {
    it("should not accept GET", (done) => {
      request(app).get("/html_converter").expect(404, done);
    });
    it('should only accept POST but with rewuired "html" field', (done) => {
      request(app).post("/html_converter").expect(400, done);
    });
    it("should return converted html into blocks", (done) => {
      request(app)
        .post("/html_converter")
        .send({ html: "<p>foo</p>" })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("data");

          const { data } = res.body;
          expect(data[0]["@type"]).to.equal("text");
          done();
        });
    });
  });
});
