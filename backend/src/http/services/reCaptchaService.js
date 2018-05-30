"use strict";

const request = require("request");

function makeReCaptchaService() {
    return Object.freeze({
        verify
    });

    async function verify({token, secret, clientAddress} = {}) {
        return new Promise((resolve) => {
            request.post({
                url: `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}&remoteip=${clientAddress}`,
            }, async function (error, response, body) {
                const responseBody = JSON.parse(body);
                if (!error) {
                    resolve(responseBody);
                } else {
                    throw new Error("Failed to verify captcha.");
                }
            });
        });
    }
}

module.exports = makeReCaptchaService;