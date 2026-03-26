import Campaign from '../models/Campaign';
import CampaignRecipient from '../models/CampaignRecipient';
import Recipient from '../models/Recipient';

/**
 * Email Service - Simulates email sending with async processing
 * In production, this would integrate with services like SendGrid, Mailgun, etc.
 */
export class EmailService {
  /**
   * Simulate sending a single email with random delay and success/failure
   * @returns Promise that resolves to true (sent) or false (failed)
   */
  private async sendSingleEmail(
    recipientEmail: string,
    subject: string,
    _body: string
  ): Promise<boolean> {
    // Simulate network delay (100-500ms)
    const delay = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      console.log(`✉️  Email sent to ${recipientEmail}: ${subject}`);
    } else {
      console.error(`❌ Failed to send email to ${recipientEmail}`);
    }

    return success;
  }

  /**
   * Process campaign sending asynchronously
   * Updates campaign and recipient statuses as emails are sent
   */
  async processCampaignSending(campaignId: number): Promise<void> {
    try {
      console.log(`📧 Starting to process campaign ${campaignId}`);

      // Get campaign details
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) {
        console.error(`Campaign ${campaignId} not found`);
        return;
      }

      // Get all pending recipients for this campaign
      const campaignRecipients = await CampaignRecipient.findAll({
        where: {
          campaign_id: campaignId,
          status: 'pending',
        },
        include: [
          {
            model: Recipient,
            as: 'recipient',
          },
        ],
      });

      if (campaignRecipients.length === 0) {
        console.log(`No pending recipients for campaign ${campaignId}`);
        // Update campaign status to sent
        await campaign.update({ status: 'sent' });
        return;
      }

      console.log(
        `📬 Sending to ${campaignRecipients.length} recipients for campaign ${campaignId}`
      );

      // Process each recipient
      for (const campaignRecipient of campaignRecipients) {
        const recipient = campaignRecipient.recipient;
        if (!recipient) continue;

        try {
          // Simulate sending email
          const success = await this.sendSingleEmail(
            recipient.email,
            campaign.subject,
            campaign.body
          );

          if (success) {
            await campaignRecipient.update({
              status: 'sent',
              sent_at: new Date(),
            });

            // Simulate 40% open rate for sent emails
            if (Math.random() < 0.4) {
              // Simulate delayed open (1-10 seconds after sending)
              const openDelay = Math.floor(Math.random() * 9000) + 1000;
              setTimeout(async () => {
                try {
                  await campaignRecipient.update({
                    opened_at: new Date(),
                  });
                  console.log(`👀 Email opened by ${recipient.email}`);
                } catch (error) {
                  console.error('Error updating opened_at:', error);
                }
              }, openDelay);
            }
          } else {
            await campaignRecipient.update({
              status: 'failed',
            });
          }
        } catch (error) {
          console.error(
            `Error sending to ${recipient.email}:`,
            error
          );
          await campaignRecipient.update({
            status: 'failed',
          });
        }
      }

      // Update campaign status to sent
      await campaign.update({ status: 'sent' });
      console.log(`✅ Campaign ${campaignId} processing completed`);
    } catch (error) {
      console.error(`Error processing campaign ${campaignId}:`, error);
      
      // Update campaign status to failed if something went wrong
      try {
        const campaign = await Campaign.findByPk(campaignId);
        if (campaign && campaign.status === 'sending') {
          await campaign.update({ status: 'draft' });
        }
      } catch (updateError) {
        console.error('Error updating campaign status:', updateError);
      }
    }
  }

  /**
   * Start campaign sending process asynchronously
   * Returns immediately while processing happens in background
   */
  async startCampaignSending(campaignId: number): Promise<void> {
    // Process in background without waiting
    setImmediate(() => {
      this.processCampaignSending(campaignId);
    });

    console.log(`🚀 Campaign ${campaignId} sending initiated (async)`);
  }
}

export const emailService = new EmailService();
