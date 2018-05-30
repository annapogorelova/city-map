"use strict";
const chai = require("chai");
const assert = chai.assert;
const testUtils = require("../../testUtils");
const constants = require("../../../app/constants/httpConstants");

describe("contact controller test", () => {
    const testMessage = {
        name: "Oleksandr",
        email: "tolotolo@gmail.com",
        message: "Hello, yes, this is the third room. Please listen, as my menu options have changed. If you'd like to say hello, press 1.",
        reCaptchaToken: "jkj2kje239289377823ru23rg2"
    };

    function makeMockResponse(statusCode, body) {
        return {
            status: function() {
                this.statusCode = statusCode;
                return this;
            },
            send: function() {
                this.body = body;
                return this;
            }
        };
    }

    function makeNextFunction(res, status, body) {
        return () => res.status(status).send(body);
    }

    it("should return OK after sending the mail", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            const res = makeMockResponse(constants.statusCodes.OK);
            const next = makeNextFunction(res, constants.statusCodes.OK, {});

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const contactController = testUtils.dc.get("ContactController");
            await contactController.sendMessage({body: testMessage}, res, next);

            assert.equal(constants.statusCodes.OK, res.statusCode);

            done();
        })();
    });

    it("should return 400, not valid name", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            const res = makeMockResponse(constants.statusCodes.BAD_REQUEST);
            const next = makeNextFunction(res, constants.statusCodes.BAD_REQUEST, {});

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const contactController = testUtils.dc.get("ContactController");

            const notValidName = ["", "a"];

            for(let name of notValidName) {
                await contactController.sendMessage({body: {...testMessage, name: name}}, res, next);
                assert.equal(constants.statusCodes.BAD_REQUEST, res.statusCode);
            }

            done();
        })();
    });

    it("should return 400, not valid email", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            const res = makeMockResponse(constants.statusCodes.BAD_REQUEST);
            const next = makeNextFunction(res, constants.statusCodes.BAD_REQUEST, {});

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const contactController = testUtils.dc.get("ContactController");

            const notValidEmails = ["", "aaaa", "aaaa@", "aaaa@gmail", "aaaa@gmail."];

            for(let email of notValidEmails) {
                await contactController.sendMessage({body: {...testMessage, email: email}}, res, next);
                assert.equal(constants.statusCodes.BAD_REQUEST, res.statusCode);
            }

            done();
        })();
    });

    it("should return 400, not valid message", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            const res = makeMockResponse(constants.statusCodes.BAD_REQUEST);
            const next = makeNextFunction(res, constants.statusCodes.BAD_REQUEST, {});

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const contactController = testUtils.dc.get("ContactController");

            const notValidMessages = ["", "short"];

            for(let message of notValidMessages) {
                await contactController.sendMessage({body: {...testMessage, message: message}}, res, next);
                assert.equal(constants.statusCodes.BAD_REQUEST, res.statusCode);
            }

            done();
        })();
    });

    it("should return 400, no reCaptcha token", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            const res = makeMockResponse(constants.statusCodes.BAD_REQUEST);
            const next = makeNextFunction(res, constants.statusCodes.BAD_REQUEST, {});

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const contactController = testUtils.dc.get("ContactController");

            await contactController.sendMessage({body: {...testMessage, reCaptchaToken: ""}}, res, next);
            assert.equal(constants.statusCodes.BAD_REQUEST, res.statusCode);

            done();
        })();
    });

    it("should return 500 after sending the mail (mail service rejects)", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    throw new Error("Fail");
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    return Promise.resolve();
                }
            };

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const res = makeMockResponse(constants.statusCodes.INTERNAL_SERVER_ERROR);
            const next = makeNextFunction(res, constants.statusCodes.INTERNAL_SERVER_ERROR, {});

            const contactController = testUtils.dc.get("ContactController");
            await contactController.sendMessage({body: testMessage}, res, next);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);

            done();
        })();
    });

    it("should return 500 after sending the mail (reCaptcha service rejects)", (done) => {
        (async () => {
            const mailServiceMock = {
                sendMail: () => {
                    return Promise.resolve();
                }
            };

            const reCaptchaServiceMock = {
                verify: () => {
                    throw new Error("Fail");
                }
            };

            testUtils.dc.registerInstance("MailService", mailServiceMock);
            testUtils.dc.registerInstance("ReCaptchaService", reCaptchaServiceMock);

            const res = makeMockResponse(constants.statusCodes.INTERNAL_SERVER_ERROR);
            const next = makeNextFunction(res, constants.statusCodes.INTERNAL_SERVER_ERROR, {});

            const contactController = testUtils.dc.get("ContactController");
            await contactController.sendMessage({body: testMessage}, res, next);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);

            done();
        })();
    });
});