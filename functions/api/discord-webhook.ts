/**
 * Cloudflare Pages Function — Discord webhook proxy
 * Keeps webhook URLs server-side so they're never exposed in the client bundle.
 *
 * Supports multiple channels via ?channel= query parameter:
 *   ?channel=inquiry  → VITE_DISCORD_WEBHOOK_INQUIRY
 *   ?channel=invoice  → VITE_DISCORD_WEBHOOK_INVOICE
 *   ?channel=sos      → VITE_DISCORD_WEBHOOK_SOS
 *
 * Environment variables required in Cloudflare dashboard (Settings → Environment Variables):
 *   VITE_DISCORD_WEBHOOK_INQUIRY = https://discord.com/api/webhooks/...
 *   VITE_DISCORD_WEBHOOK_INVOICE = https://discord.com/api/webhooks/...
 *   VITE_DISCORD_WEBHOOK_SOS     = https://discord.com/api/webhooks/...
 */

interface Env {
  VITE_DISCORD_WEBHOOK_INQUIRY: string;
  VITE_DISCORD_WEBHOOK_INVOICE: string;
  VITE_DISCORD_WEBHOOK_SOS: string;
}

/** Map of allowed channel names to their env var keys */
const CHANNEL_MAP: Record<string, keyof Env> = {
  inquiry: 'VITE_DISCORD_WEBHOOK_INQUIRY',
  invoice: 'VITE_DISCORD_WEBHOOK_INVOICE',
  sos: 'VITE_DISCORD_WEBHOOK_SOS',
};

interface DiscordPayload {
  embeds: Array<{
    title: string;
    color: number;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string };
    timestamp?: string;
  }>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // --- CORS pre-flight is handled by onRequestOptions below ---

  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Resolve channel from query param
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel') || 'inquiry';
    const envKey = CHANNEL_MAP[channel];

    if (!envKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid channel "${channel}". Allowed: ${Object.keys(CHANNEL_MAP).join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate webhook URL is configured
    const webhookUrl = env[envKey];
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ success: false, error: `Discord webhook not configured for channel "${channel}"` }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse and validate request body
    const body: DiscordPayload = await request.json();
    if (!body.embeds || !Array.isArray(body.embeds) || body.embeds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payload: embeds array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Forward to Discord
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Handle Discord rate limiting
    if (discordResponse.status === 429) {
      const retryData = await discordResponse.json() as { retry_after?: number };
      const retryAfter = retryData.retry_after || 1;

      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

      const retryResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (retryResponse.ok) {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Discord rate limited' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord API error:', discordResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Discord returned ${discordResponse.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Webhook proxy error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

/**
 * Handle CORS preflight
 */
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
