import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send a welcome email to the newly registered user
   */
  async sendWelcomeEmail(
    to: string,
    username: string,
    fullname: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.FROM_EMAIL ||
          '"Freelancer Marketplace" <noreply@freelancermarketplace.com>',
        to,
        subject: 'Welcome to Freelancer Marketplace!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Welcome to Freelancer Marketplace, ${fullname}!</h2>
            <p>Hi ${username},</p>
            <p>Thank you for registering with us. We are excited to have you on board.</p>
            <p>With your new account, you can start exploring opportunities, connect with others, and grow your career or business.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Freelancer Marketplace Team</strong></p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send email when a proposal is accepted
   */
  async sendProposalAcceptedEmail(
    to: string,
    freelancerName: string,
    jobTitle: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.FROM_EMAIL ||
          '"Freelancer Marketplace" <noreply@freelancermarketplace.com>',
        to,
        subject: 'Your proposal was accepted!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Congratulations, ${freelancerName}!</h2>
            <p>Your proposal for the job "<strong>${jobTitle}</strong>" has been accepted by the client.</p>
            <p>Please log in to your dashboard to view the details and start the contract process.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Freelancer Marketplace Team</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending proposal accepted email:', error);
      return false;
    }
  }

  /**
   * Send email when a new proposal is received
   */
  async sendNewProposalEmail(
    to: string,
    clientName: string,
    jobTitle: string,
    freelancerName: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.FROM_EMAIL ||
          '"Freelancer Marketplace" <noreply@freelancermarketplace.com>',
        to,
        subject: 'New Proposal Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Hi ${clientName},</h2>
            <p>You have received a new proposal from <strong>${freelancerName}</strong> for your job "<strong>${jobTitle}</strong>".</p>
            <p>Please log in to your dashboard to review the proposal.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Freelancer Marketplace Team</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending new proposal email:', error);
      return false;
    }
  }

  /**
   * Send email when a contract is created
   */
  async sendContractCreatedEmail(
    to: string,
    receiverName: string,
    otherPartyName: string,
    jobTitle: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.FROM_EMAIL ||
          '"Freelancer Marketplace" <noreply@freelancermarketplace.com>',
        to,
        subject: 'New Contract Started',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Hi ${receiverName},</h2>
            <p>A new contract has been created for the job "<strong>${jobTitle}</strong>" with <strong>${otherPartyName}</strong>.</p>
            <p>You can now manage the contract and communicate through the dashboard.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Freelancer Marketplace Team</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Contract creation email sent to: ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending contract creation email:', error);
      return false;
    }
  }

  /**
   * Send email when a contract is completed
   */
  async sendContractCompletedEmail(
    to: string,
    receiverName: string,
    otherPartyName: string,
    jobTitle: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.FROM_EMAIL ||
          '"Freelancer Marketplace" <noreply@freelancermarketplace.com>',
        to,
        subject: 'Contract Completed!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Great news, ${receiverName}!</h2>
            <p>The contract for the job "<strong>${jobTitle}</strong>" with <strong>${otherPartyName}</strong> has been marked as completed.</p>
            <p>Please don't forget to leave a review for your experience.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Freelancer Marketplace Team</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Contract completion email sent to: ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending contract completion email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
