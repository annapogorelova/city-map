"use strict";

const config = require("config");
const {errors, httpConstants, commonConstants} = require("../../app/constants/index");
const {optional} = require("tooleks");

function makeContactController(reCaptchaService, mailService) {
    return Object.freeze({
        sendMessage
    });

    /**
     * Send "contact me" message
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async function sendMessage(req, res, next) {
        try {
            const formData = req.body;

            validateFormData(formData);

            const clientAddress = optional(() => req.headers["x-forwarded-for"] || req.connection.remoteAddress);

            const rcResponse = await reCaptchaService.verify({
                token: formData.reCaptchaToken,
                secret: config.reCaptcha.key,
                clientAddress: clientAddress
            });

            if(!rcResponse.success) {
                return res.status(httpConstants.statusCodes.BAD_REQUEST).send({message: "Failed to verify reCaptcha"});
            }

            await mailService.sendMail({
                from: formData.email,
                to: config.smtp.receiverEmail,
                subject: formData.name,
                text: formData.message
            });

            return res.status(httpConstants.statusCodes.OK)
                .send({message: "Message wa successfuly sent."});
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate contact form data
     * @param formData
     */
    function validateFormData(formData) {
        if(!isNameValid(formData.name) || !isEmailValid(formData.email)
            || !isMessageValid(formData.message) || !formData.reCaptchaToken) {
            throw new Error(errors.BAD_REQUEST.key);
        }
    }

    /**
     * Validates sender name
     * @param name
     * @returns {*|boolean}
     */
    function isNameValid(name) {
        return name && name.length >= config.defaults.minEmailSenderNameLength;
    }

    /**
     * Validates sender email
     * @param email
     * @returns {*|boolean}
     */
    function isEmailValid(email) {
        return email && commonConstants.emailRegex.test(String(email).toLowerCase());
    }

    /**
     * Validates message
     * @param message
     * @returns {*|boolean}
     */
    function isMessageValid(message) {
        return message && message.length >= config.defaults.minEmailTextLength;
    }
}

module.exports = makeContactController;