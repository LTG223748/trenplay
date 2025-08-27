// /pages/api/contact.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Zoho SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'support@trenplay.net',
      pass: 'CvmsaZG9aTpi',
    },
  });

  try {
    await transporter.sendMail({
      from: '"TrenPlay Support" <support@trenplay.net>',
      to: 'support@trenplay.net',
      subject: `Contact Form Submission from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    return res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'There was an error sending your message.' });
  }
}

