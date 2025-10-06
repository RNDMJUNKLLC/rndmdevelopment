// Discord Webhook Service
// Handles sending form data to Discord via webhooks

const WEBHOOKS = {
  inquiry: import.meta.env.VITE_DISCORD_WEBHOOK_INQUIRY,
  sos: import.meta.env.VITE_DISCORD_WEBHOOK_SOS,
  invoice: import.meta.env.VITE_DISCORD_WEBHOOK_INVOICE
};

/**
 * Send a new project inquiry to Discord
 * @param {Object} data - Form data
 * @param {string} data.name - User's name
 * @param {string} data.businessName - Business name
 * @param {string} data.email - Email address
 * @param {string} data.phone - Phone number (optional)
 * @param {string} data.projectType - Type of project
 * @param {string} data.budget - Budget range
 * @param {string} data.timeline - Timeline preference
 * @param {string} data.priority - Priority level
 * @param {string} data.message - Project details
 */
export async function sendInquiryToDiscord(data) {
  const webhookUrl = WEBHOOKS.inquiry;
  
  if (!webhookUrl) {
    console.error('Inquiry webhook URL not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  // Map values to display-friendly text
  const projectTypeMap = {
    'website': '🌐 Website',
    'mobile-app': '📱 Mobile App (Android)',
    'web-app': '💻 Web Application',
    'ecommerce': '🛒 E-commerce Site',
    'software': '⚙️ Custom Software',
    'redesign': '🎨 Redesign/Upgrade',
    'maintenance': '🔧 Maintenance/Support',
    'other': '💡 Other'
  };

  const priorityMap = {
    'urgent': '🔴 Urgent',
    'high': '🟠 High',
    'normal': '🟢 Normal',
    'low': '🔵 Low Priority'
  };

  const timelineMap = {
    'asap': '⚡ ASAP (Rush)',
    '1-2-weeks': '📅 1-2 Weeks',
    '2-4-weeks': '📆 2-4 Weeks',
    '1-2-months': '🗓️ 1-2 Months',
    'flexible': '🕐 Flexible'
  };

  const embed = {
    title: '🆕 New Project Inquiry',
    color: 0x00ff88, // Green color
    fields: [
      { name: '👤 Name', value: data.name, inline: true },
      { name: '🏢 Business', value: data.businessName || 'Not provided', inline: true },
      { name: '📧 Email', value: data.email, inline: true },
      { name: '📱 Phone', value: data.phone || 'Not provided', inline: true },
      { name: '� Project Type', value: projectTypeMap[data.projectType] || data.projectType, inline: true },
      { name: '💰 Budget', value: `$${data.budget}`, inline: true },
      { name: '⏱️ Timeline', value: timelineMap[data.timeline] || data.timeline, inline: true },
      { name: '🎯 Priority', value: priorityMap[data.priority] || data.priority, inline: true },
      { name: '� Project Details', value: data.message || 'No description provided', inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'RNDM Development - New Inquiry' }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RNDM Development',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
        embeds: [embed]
      })
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    } else {
      throw new Error(`Discord API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending inquiry to Discord:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send an SOS request for an existing project to Discord
 * @param {Object} data - SOS form data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.businessName - Business name
 * @param {string} data.phone - Phone number
 * @param {string} data.projectId - Firebase project ID
 * @param {string} data.projectName - Project name/title
 * @param {string} data.requestType - Type of request
 * @param {string} data.timeline - Timeline preference
 * @param {string} data.priority - Priority level
 * @param {string} data.message - Request details
 */
export async function sendSOSToDiscord(data) {
  const webhookUrl = WEBHOOKS.sos;
  
  if (!webhookUrl) {
    console.error('SOS webhook URL not configured');
    console.error('Available webhooks:', Object.keys(WEBHOOKS).map(k => `${k}: ${WEBHOOKS[k] ? 'configured' : 'missing'}`));
    return { success: false, error: 'Webhook not configured' };
  }

  // Map request types to display-friendly text
  const requestTypeMap = {
    'bug-fix': '🐛 Bug Fix / Issue',
    'feature-request': '✨ Feature Request',
    'redesign': '🎨 Redesign / Upgrade',
    'maintenance': '🔧 Maintenance / Update',
    'content-change': '📝 Content Change',
    'performance': '⚡ Performance Issue',
    'security': '🔒 Security Concern',
    'other': '💡 Other'
  };

  const priorityMap = {
    'urgent': '🔴 Urgent',
    'high': '🟠 High',
    'normal': '🟢 Normal',
    'low': '🔵 Low Priority'
  };

  const timelineMap = {
    'asap': '⚡ ASAP (Rush)',
    '1-2-weeks': '📅 1-2 Weeks',
    '2-4-weeks': '📆 2-4 Weeks',
    '1-2-months': '🗓️ 1-2 Months',
    'flexible': '🕐 Flexible'
  };

  // Color based on request type
  const requestTypeColors = {
    'bug-fix': 0xff0000,        // Red
    'security': 0xff0000,       // Red
    'performance': 0xff6600,    // Orange
    'feature-request': 0x00ff88,// Green
    'redesign': 0x9b59b6,       // Purple
    'maintenance': 0xffa500,    // Orange
    'content-change': 0x3498db, // Blue
    'other': 0x95a5a6           // Gray
  };

  const color = requestTypeColors[data.requestType] || 0xffa500;

  const embed = {
    title: '🆘 SOS - Project Support Request',
    color: color,
    fields: [
      { name: '👤 Name', value: data.name, inline: true },
      { name: '🏢 Business', value: data.businessName || 'Not provided', inline: true },
      { name: '📧 Email', value: data.email, inline: true },
      { name: '📱 Phone', value: data.phone || 'Not provided', inline: true },
      { name: '📂 Project', value: data.projectName, inline: true },
      { name: '🔖 Project ID', value: data.projectId, inline: true },
      { name: '📋 Request Type', value: requestTypeMap[data.requestType] || data.requestType, inline: true },
      { name: '⏱️ Timeline', value: timelineMap[data.timeline] || data.timeline, inline: true },
      { name: '🎯 Priority', value: priorityMap[data.priority] || data.priority, inline: true },
      { name: '📝 Details', value: data.message || 'No description provided', inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'RNDM Development - SOS Request' }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RNDM Development - SOS',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
        embeds: [embed]
      })
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`Discord API error (${response.status}):`, errorText);
      throw new Error(`Discord API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending SOS to Discord:', error);
    console.error('SOS Data being sent:', JSON.stringify(data, null, 2));
    return { success: false, error: error.message };
  }
}

/**
 * Send an invoice request to Discord
 * @param {Object} data - Invoice request data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.businessName - Business name
 * @param {string} data.phone - Phone number (optional)
 * @param {Array} data.projects - Array of project objects {id, name}
 */
export async function sendInvoiceRequestToDiscord(data) {
  const webhookUrl = WEBHOOKS.invoice;
  
  if (!webhookUrl) {
    console.error('Invoice webhook URL not configured');
    console.error('Available webhooks:', Object.keys(WEBHOOKS).map(k => `${k}: ${WEBHOOKS[k] ? 'configured' : 'missing'}`));
    return { success: false, error: 'Webhook not configured' };
  }

  // Format project list
  const projectList = data.projects && data.projects.length > 0
    ? data.projects.map(p => `• ${p.name} (ID: ${p.id})`).join('\n')
    : 'No projects selected';

  const embed = {
    title: '💰 Invoice Request',
    color: 0x0099ff, // Blue color
    fields: [
      { name: '👤 Name', value: data.name || 'Not provided', inline: true },
      { name: '🏢 Business', value: data.businessName || 'Not provided', inline: true },
      { name: '📧 Email', value: data.email, inline: true },
      { name: '📱 Phone', value: data.phone || 'Not provided', inline: true },
      { name: '📋 Requested Invoices For', value: projectList, inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'RNDM Development - Invoice Request' }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RNDM Development - Invoices',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
        embeds: [embed]
      })
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`Discord API error (${response.status}):`, errorText);
      throw new Error(`Discord API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending invoice request to Discord:', error);
    console.error('Invoice Data being sent:', JSON.stringify(data, null, 2));
    return { success: false, error: error.message };
  }
}

export const discordWebhookService = {
  sendInquiry: sendInquiryToDiscord,
  sendSOS: sendSOSToDiscord,
  sendInvoiceRequest: sendInvoiceRequestToDiscord
};
