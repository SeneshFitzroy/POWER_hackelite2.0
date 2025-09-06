const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send notification email
const sendNotificationEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured, skipping email notification');
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Pharmacy HR System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send license expiry notification
const sendLicenseExpiryNotification = async (employeeEmail, employeeName, licenseType, expiryDate) => {
  const subject = `License Expiry Reminder - ${licenseType}`;
  const text = `Dear ${employeeName},

This is a reminder that your ${licenseType} is set to expire on ${new Date(expiryDate).toLocaleDateString()}.

Please ensure you renew your license before the expiry date to avoid any compliance issues.

If you have already renewed your license, please update your information in the HR system.

Best regards,
HR Department
Pharmacy Management System`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">License Expiry Reminder</h2>
      <p>Dear ${employeeName},</p>
      <p>This is a reminder that your <strong>${licenseType}</strong> is set to expire on <strong>${new Date(expiryDate).toLocaleDateString()}</strong>.</p>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Action Required:</strong> Please ensure you renew your license before the expiry date to avoid any compliance issues.</p>
      </div>
      <p>If you have already renewed your license, please update your information in the HR system.</p>
      <p>Best regards,<br>HR Department<br>Pharmacy Management System</p>
    </div>
  `;

  return await sendNotificationEmail(employeeEmail, subject, text, html);
};

// Send probation completion notification
const sendProbationCompletionNotification = async (managerEmail, employeeName, startDate) => {
  const subject = `Probation Period Completed - ${employeeName}`;
  const text = `Dear Manager,

${employeeName} has completed their 3-month probation period as of ${new Date(startDate).toLocaleDateString()}.

Please review their performance and confirm their employment status in the HR system.

Action required:
- Review employee performance
- Update employment status (Active/Inactive)
- Schedule confirmation meeting if needed

Best regards,
HR System`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Probation Period Completed</h2>
      <p>Dear Manager,</p>
      <p><strong>${employeeName}</strong> has completed their 3-month probation period as of <strong>${new Date(startDate).toLocaleDateString()}</strong>.</p>
      <p>Please review their performance and confirm their employment status in the HR system.</p>
      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
        <h4 style="margin-top: 0;">Action Required:</h4>
        <ul style="margin-bottom: 0;">
          <li>Review employee performance</li>
          <li>Update employment status (Active/Inactive)</li>
          <li>Schedule confirmation meeting if needed</li>
        </ul>
      </div>
      <p>Best regards,<br>HR System</p>
    </div>
  `;

  return await sendNotificationEmail(managerEmail, subject, text, html);
};

// Send payslip email
const sendPayslipEmail = async (employeeEmail, employeeName, payslipData) => {
  const subject = `Payslip for ${payslipData.period}`;
  const text = `Dear ${employeeName},

Your payslip for ${payslipData.period} is ready.

Gross Salary: LKR ${payslipData.grossSalary.toLocaleString()}
Deductions: LKR ${payslipData.totalDeductions.toLocaleString()}
Net Salary: LKR ${payslipData.netSalary.toLocaleString()}

Please log into the HR system to view the detailed payslip.

Best regards,
HR Department`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payslip - ${payslipData.period}</h2>
      <p>Dear ${employeeName},</p>
      <p>Your payslip for <strong>${payslipData.period}</strong> is ready.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold;">Gross Salary</td>
          <td style="padding: 12px; border: 1px solid #d1d5db;">LKR ${payslipData.grossSalary.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold;">Deductions</td>
          <td style="padding: 12px; border: 1px solid #d1d5db;">LKR ${payslipData.totalDeductions.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold;">Net Salary</td>
          <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold;">LKR ${payslipData.netSalary.toLocaleString()}</td>
        </tr>
      </table>
      <p>Please log into the HR system to view the detailed payslip.</p>
      <p>Best regards,<br>HR Department</p>
    </div>
  `;

  return await sendNotificationEmail(employeeEmail, subject, text, html);
};

module.exports = {
  sendNotificationEmail,
  sendLicenseExpiryNotification,
  sendProbationCompletionNotification,
  sendPayslipEmail
};