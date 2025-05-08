const SibApiV3Sdk = require('@getbrevo/brevo');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification OTP email using Brevo
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP to be sent
 */
const sendVerificationEmail = async (to, otp) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.sender = { 
            name: process.env.APP_NAME || 'Node js test App',
            email: process.env.EMAIL_FROM || 'artada038@gmail.com'
        };
        sendSmtpEmail.subject = 'Your Verification Code';
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding: 20px 0;
                        background-color: #4CAF50;
                        color: white;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                    }
                    .otp-container {
                        text-align: center;
                        margin: 30px 0;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #4CAF50;
                        padding: 10px;
                        background-color: #ffffff;
                        border: 2px dashed #4CAF50;
                        border-radius: 4px;
                        display: inline-block;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #666666;
                        font-size: 12px;
                        border-top: 1px solid #eeeeee;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
                        
                        <div class="otp-container">
                            <div class="otp-code">${otp}</div>
                        </div>

                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This verification code will expire in 10 minutes</li>
                            <li>Do not share this code with anyone</li>
                            <li>If you didn't request this code, please ignore this email</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Node js test App'}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Verification OTP sent successfully to:', to);
        return data;
    } catch (error) {
        console.error('Error sending verification OTP:', error);
        throw new Error('Failed to send verification OTP');
    }
};

module.exports = {
    sendVerificationEmail,
    generateOTP
};
