import { useCallback, useState } from 'react';
import type { ContactFormSubmission, ServiceResponse } from '@/types';

/**
 * Discord embed color constants
 */
const EMBED_COLORS = {
  success: 0x00b894, // green
  info: 0x0984e3,    // blue
  warning: 0xfdcb6e, // yellow
  error: 0xd63031,   // red
} as const;

/**
 * Supported Discord webhook channels.
 * Each maps to a Cloudflare secret: VITE_DISCORD_WEBHOOK_{CHANNEL}
 */
export type DiscordChannel = 'inquiry' | 'invoice' | 'sos';

/**
 * Cloudflare Pages Function endpoint that proxies to Discord.
 * Channel is passed as a query param: /api/discord-webhook?channel=inquiry
 */
const DISCORD_PROXY_ENDPOINT = '/api/discord-webhook';

/**
 * Build a Discord embed payload from a contact form submission
 */
const buildSubmissionEmbed = (
  submission: ContactFormSubmission,
  channel: DiscordChannel
) => {
  const submittedAt = new Date(submission.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const titleMap: Record<DiscordChannel, string> = {
    inquiry: '\ud83d\udcec New Project Inquiry',
    invoice: '\ud83d\udcb0 New Invoice Submission',
    sos: '\ud83d\udea8 SOS Request',
  };

  const colorMap: Record<DiscordChannel, number> = {
    inquiry: EMBED_COLORS.info,
    invoice: EMBED_COLORS.success,
    sos: EMBED_COLORS.error,
  };

  return {
    embeds: [
      {
        title: titleMap[channel],
        color: colorMap[channel],
        fields: [
          { name: 'Name', value: submission.name, inline: true },
          { name: 'Email', value: submission.email, inline: true },
          { name: 'Company', value: submission.company || 'Not specified', inline: true },
          { name: 'Project Type', value: submission.projectType || 'Not specified', inline: true },
          { name: 'Budget', value: submission.budget || 'Not specified', inline: true },
          { name: 'Timeline', value: submission.timeline || 'Not specified', inline: true },
          { name: 'Message', value: submission.message.length > 1024
              ? submission.message.slice(0, 1021) + '...'
              : submission.message,
          },
        ],
        footer: {
          text: `Submission ID: ${submission.id || 'N/A'} \u2022 ${submittedAt}`,
        },
        timestamp: new Date(submission.timestamp).toISOString(),
      },
    ],
  };
};

/**
 * Custom hook for sending Discord webhook notifications.
 * Calls a Cloudflare Pages Function proxy so webhook URLs
 * are never exposed in the client-side bundle.
 *
 * Supports three channels:
 *   - inquiry  → project inquiry contact form
 *   - invoice  → invoice submissions
 *   - sos      → SOS / urgent requests
 */
export const useDiscord = () => {
  const [sending, setSending] = useState(false);

  /**
   * Send a notification to a specific Discord channel
   * via the server-side proxy at /api/discord-webhook?channel=<channel>
   */
  const sendDiscordNotification = useCallback(
    async (
      submission: ContactFormSubmission,
      channel: DiscordChannel = 'inquiry'
    ): Promise<ServiceResponse<null>> => {
      try {
        setSending(true);
        const payload = buildSubmissionEmbed(submission, channel);

        const response = await fetch(
          `${DISCORD_PROXY_ENDPOINT}?channel=${channel}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          return {
            success: true,
            message: `Discord notification sent to ${channel} channel`,
          };
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ||
          `Discord proxy returned ${response.status}`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send Discord notification';

        console.error(`Discord webhook error (${channel}):`, errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setSending(false);
      }
    },
    []
  );

  return { sendDiscordNotification, sending };
};
