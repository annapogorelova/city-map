"use strict";

function makeMailService(mailClient) {
    return Object.freeze({
        sendMail
    });

    function sendMail({from, to, subject, text} = {}) {
        return new Promise((resolve) => {
            mailClient.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: text
            }, function (error) {
                if (error) {
                    throw new Error(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = makeMailService;