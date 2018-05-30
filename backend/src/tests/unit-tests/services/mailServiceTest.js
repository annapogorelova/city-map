"use strict";

const chai = require("chai");
const assert = chai.assert;
const makeMailService = require("../../../http/services/mailService");

describe("mailService test", () => {
    const mail = {
        from: "tolotolo@gmail.com",
        to: "anna@gmail.com",
        subject: "Hello",
        text: "Hello!"
    };

    it("should successfully send the email", (done) => {
        (async () => {
            let sentMail = undefined;

            const mailer = {
                sendMail: (mail, callback) => {
                    sentMail = mail;
                    callback(null);
                }
            };

            const mailService = makeMailService(mailer);
            await mailService.sendMail(mail);

            assert.exists(sentMail);
            assert.equal(sentMail.from, mail.from);
            assert.equal(sentMail.to, mail.to);
            assert.equal(sentMail.subject, mail.subject);
            assert.equal(sentMail.text, mail.text);

            done();
        })();
    });

    it("should reject to send the email", (done) => {
        (async () => {
            const mailer = {
                sendMail: (mail, callback) => {
                    callback({code: "ERROR"});
                }
            };

            const mailService = makeMailService(mailer);

            try {
                await mailService.sendMail(mail);
            } catch (error) {
                assert.exists(error);
            } finally {
                done();
            }
        })();
    });
});