interface EmailConfig {
  from: string;
  fromName: string;
  to: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
}

export const emailConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@culturalcompass.ai',
  fromName: process.env.EMAIL_FROM_NAME || 'CulturalCompass AI',
  to: process.env.EMAIL_TO || 'support@culturalcompass.ai',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'user@example.com',
    password: process.env.SMTP_PASSWORD || 'yourpassword',
  },
};

export const emailTemplates = {
  contact: {
    subject: 'New Contact Form Submission',
    text: (data: { name: string; email: string; message: string }) =>
      `New contact form submission\n\n` +
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n\n` +
      `Message:\n${data.message}`,
    html: (data: { name: string; email: string; message: string }) =>
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="white-space: pre-line;">${data.message}</p>
        </div>
      </div>
    `,
  },
  // Add more email templates as needed
};
