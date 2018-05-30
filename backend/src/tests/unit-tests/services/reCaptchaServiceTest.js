"use strict";

const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;
const makeReCaptchaService = require("../../../http/services/reCaptchaService");
const request = require("request");

describe("reCaptchaService test", () => {
    let requestStub;

    afterEach((done) => {
        requestStub.restore();
        done();
    });

    it("should return success = true from the verify method", (done) => {
        (async () => {
            requestStub = sinon.stub(request, "post").yields(null, {}, `{"success":true}`);

            const reCaptchaService = makeReCaptchaService();
            const result = await reCaptchaService.verify({token: "token", secret: "secret"});

            assert.exists(result);
            assert.equal(result.success, true);

            assert(request.post.calledOnce);

            done();
        })();
    });

    it("should return success = false the verify method", (done) => {
        (async () => {
            requestStub = sinon.stub(request, "post").yields(null, {}, `{"success":false}`);

            const reCaptchaService = makeReCaptchaService();

            const result = await reCaptchaService.verify({token: "token", secret: "secret"});
            assert.exists(result);
            assert.equal(result.success, false);

            assert(request.post.calledOnce);

            done();
        })();
    });
});