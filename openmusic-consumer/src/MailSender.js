const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const { playlistId } = JSON.parse(content);
    const message = {
      from: 'OpenMusic',
      to: targetEmail,
      subject: 'Playlist Export',
      text: `Attached is the export of playlist id ${playlistId}`,
      attachments: [
        {
          filename: `${playlistId}.json`,
          content,
        },
      ],
    };

    return this.transporter.sendMail(message);
  }
}

module.exports = MailSender;
