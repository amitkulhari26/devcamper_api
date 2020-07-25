const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD, FROM_NAME, FROM_EMAIL } = process.env;

const sendEmail = async (option) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${FROM_NAME} <${FROM_EMAIL}>`, // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.text, // plain text body
        //  html: "<b>Hello world?</b>", // html body
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

};

module.exports = sendEmail;



