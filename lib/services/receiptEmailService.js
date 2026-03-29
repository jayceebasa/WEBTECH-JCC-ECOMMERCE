const nodemailer = require('nodemailer');

function formatCurrency(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function createTransporter() {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('Missing SMTP credentials. Set SMTP_USER and SMTP_PASS.');
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  if (!host) {
    throw new Error('Missing SMTP configuration. Set SMTP_SERVICE or SMTP_HOST.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

function buildReceiptHtml({ orderNumber, userName, items, subtotal, shipping, total, purchasedAt }) {
  const itemRows = items.map((item) => {
    return `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0eaf8; color: #2e2545;">${item.name}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0eaf8; text-align: center; color: #2e2545;">${item.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0eaf8; text-align: right; color: #2e2545;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0eaf8; text-align: right; color: #2e2545;">${formatCurrency(item.lineTotal)}</td>
      </tr>
    `;
  }).join('');

  return `
  <div style="margin: 0; padding: 24px; background: #f8f6fc; font-family: 'Segoe UI', Arial, sans-serif; color: #1a093e;">
    <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8e0f4; overflow: hidden;">
      <div style="padding: 26px 28px; background: linear-gradient(135deg, #a88ec3 0%, #2e2545 100%); color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.4px;">Thank you for your purchase</h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">Your order has been received and is now being processed.</p>
      </div>

      <div style="padding: 24px 28px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #5d4b79;">Hi ${userName},</p>
        <p style="margin: 0 0 18px; font-size: 14px; color: #5d4b79;">Here is your receipt from WST JCC E-Commerce.</p>

        <div style="background: #faf8fd; border: 1px solid #ece3f8; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #6b5a86;"><strong style="color: #2e2545;">Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 0; font-size: 13px; color: #6b5a86;"><strong style="color: #2e2545;">Purchase Date:</strong> ${new Date(purchasedAt).toLocaleString('en-US')}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee6f6; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #f4effb;">
              <th style="padding: 10px 8px; text-align: left; font-size: 13px; color: #2e2545;">Product</th>
              <th style="padding: 10px 8px; text-align: center; font-size: 13px; color: #2e2545;">Qty</th>
              <th style="padding: 10px 8px; text-align: right; font-size: 13px; color: #2e2545;">Unit Price</th>
              <th style="padding: 10px 8px; text-align: right; font-size: 13px; color: #2e2545;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="margin-top: 16px; margin-left: auto; max-width: 280px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #5d4b79;">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #5d4b79; border-bottom: 1px solid #ece3f8;">
            <span>Shipping</span>
            <span>${formatCurrency(shipping)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0 2px; font-size: 16px; font-weight: 700; color: #2e2545;">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div style="padding: 16px 28px; background: #faf8fd; border-top: 1px solid #ece3f8;">
        <p style="margin: 0; font-size: 12px; color: #7a6a93;">If you have questions, reply to this email and our team will assist you.</p>
      </div>
    </div>
  </div>`;
}

function buildReceiptText({ orderNumber, userName, items, subtotal, shipping, total, purchasedAt }) {
  const lines = items.map((item) => {
    return `${item.name} x${item.quantity} - ${formatCurrency(item.lineTotal)}`;
  });

  return [
    `Hello ${userName},`,
    '',
    'Thank you for your purchase from WST JCC E-Commerce.',
    `Order Number: ${orderNumber}`,
    `Purchase Date: ${new Date(purchasedAt).toLocaleString('en-US')}`,
    '',
    'Items:',
    ...lines,
    '',
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Shipping: ${formatCurrency(shipping)}`,
    `Total: ${formatCurrency(total)}`,
    '',
    'If you have questions, reply to this email.'
  ].join('\n');
}

async function sendReceiptEmail({ to, orderNumber, userName, items, subtotal, shipping, total, purchasedAt }) {
  const transporter = createTransporter();
  const fromName = process.env.SMTP_FROM_NAME || 'WST JCC E-Commerce';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromEmail) {
    throw new Error('Missing sender email. Set SMTP_FROM_EMAIL or SMTP_USER.');
  }

  const html = buildReceiptHtml({ orderNumber, userName, items, subtotal, shipping, total, purchasedAt });
  const text = buildReceiptText({ orderNumber, userName, items, subtotal, shipping, total, purchasedAt });

  return transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: `Your receipt from WST JCC E-Commerce (${orderNumber})`,
    html,
    text
  });
}

module.exports = {
  sendReceiptEmail
};
