
/**
 * Generates a professional, push.house-style invoice HTML page.
 * Includes @media print CSS so users can Ctrl+P → Save as PDF directly.
 *
 * @param {object} invoice  - Invoice DB record (includes items, invoiceNo, etc.)
 * @param {object} user     - User DB record (includes advertiser profile)
 * @param {string} type     - 'ADVERTISER' | 'PUBLISHER'
 * @param {object} settings - Platform invoice settings from SystemSetting
 */
export const generateInvoiceHTML = (invoice, user, type, settings = {}) => {
    const date = new Date(invoice.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });

    // Determine "Bill To" name
    const billToName = type === 'PUBLISHER'
        ? (user.publisher?.companyName || user.name || user.email)
        : (user.advertiser?.companyName || user.name || user.email);

    // Platform / "From" info from admin settings
    const companyName    = settings.invoice_company_name    || 'PopReklam Ltd.';
    const companyEmail   = settings.invoice_company_email   || '';
    const companyRegNo   = settings.invoice_company_reg_no  || '';
    const addressLine1   = settings.invoice_address_line1   || '';
    const addressLine2   = settings.invoice_address_line2   || '';
    const country        = settings.invoice_country         || '';
    const bankName       = settings.invoice_bank_name       || '';
    const bankIban       = settings.invoice_bank_iban       || '';
    const bankSwift      = settings.invoice_bank_swift      || '';
    const footerNote     = settings.invoice_footer_note     || 'Thank you for your business!';
    const logoUrl        = settings.invoice_logo_url        || '';
    const taxRate        = parseFloat(settings.invoice_tax_rate || '0');
    const taxLabel       = settings.invoice_tax_label       || 'TAX';

    // Line items
    const items = Array.isArray(invoice.items) ? invoice.items : [{
        description: invoice.payment?.type === 'DEPOSIT' ? 'Ad Balance Deposit' : 'Payment',
        quantity: 1,
        price: Number(invoice.amount),
        amount: Number(invoice.amount)
    }];

    const subtotal = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const formatMoney = (n) => `$${Number(n).toFixed(2)}`;

    // Logo HTML (image or text fallback)
    const logoHTML = logoUrl
        ? `<img src="${logoUrl}" alt="${companyName}" style="height:50px;object-fit:contain;" />`
        : `<div class="logo-text">${companyName}</div>`;

    // Company address block (right column)
    const companyLines = [
        companyName,
        companyRegNo    ? `Business No. ${companyRegNo}` : null,
        addressLine1    || null,
        addressLine2    || null,
        country         || null,
    ].filter(Boolean);

    // Bank info rows
    const bankRows = bankName ? `
        <p><strong>${bankName}</strong></p>
        ${bankIban  ? `<p>${bankIban}</p>` : ''}
        ${bankSwift ? `<p>${bankSwift}</p>` : ''}
    ` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${invoice.invoiceNo}</title>
    <style>
        /* ── Google Font ── */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            color: #333;
            background: #f5f5f5;
            padding: 40px 20px;
        }

        .invoice-wrap {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        /* ── Header ── */
        .inv-header {
            padding: 40px 48px 32px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 2px solid #f0f0f0;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: #111;
            letter-spacing: -0.5px;
        }
        .inv-meta { text-align: right; }
        .inv-meta .inv-label {
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
        }
        .inv-meta .inv-number {
            font-size: 28px;
            font-weight: 700;
            color: #111;
            letter-spacing: -0.5px;
        }

        /* ── Bill To / From ── */
        .inv-parties {
            padding: 32px 48px;
            display: flex;
            justify-content: space-between;
            gap: 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        .inv-party-block .party-label {
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 10px;
        }
        .inv-party-block p {
            font-size: 14px;
            color: #444;
            line-height: 1.6;
        }
        .inv-party-block .party-name {
            font-weight: 700;
            font-size: 15px;
            color: #111;
        }

        /* ── Items Table ── */
        .inv-items {
            padding: 32px 48px;
            border-bottom: 1px solid #f0f0f0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        thead tr {
            border-bottom: 2px solid #eee;
        }
        thead th {
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding-bottom: 12px;
            text-align: left;
        }
        thead th.right, tbody td.right { text-align: right; }
        thead th.center, tbody td.center { text-align: center; }
        tbody tr {
            border-bottom: 1px solid #f5f5f5;
        }
        tbody td {
            padding: 14px 0;
            font-size: 14px;
            color: #333;
        }
        .item-desc { font-weight: 600; color: #111; }
        .item-date { font-size: 12px; color: #999; margin-top: 3px; }

        /* ── Totals ── */
        .inv-totals {
            padding: 24px 48px 32px;
            display: flex;
            justify-content: flex-end;
            border-bottom: 1px solid #f0f0f0;
        }
        .totals-grid {
            width: 280px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            font-size: 14px;
            color: #555;
        }
        .total-row.grand {
            margin-top: 10px;
            padding-top: 14px;
            border-top: 2px solid #eee;
            font-size: 16px;
            font-weight: 700;
            color: #111;
        }
        .total-row.grand .total-value { color: #e53535; }

        /* ── Bank Info ── */
        .inv-bank {
            padding: 24px 48px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
        }
        .bank-label, .due-label {
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
        }
        .inv-bank p { font-size: 13px; color: #444; line-height: 1.7; }
        .inv-bank p strong { color: #111; }

        /* ── Footer / Due ── */
        .inv-footer {
            padding: 24px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .inv-due { display: flex; flex-direction: column; }
        .due-date { font-size: 18px; font-weight: 700; color: #111; }
        .inv-balance-due {
            text-align: right;
        }
        .balance-label {
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
        }
        .balance-amount {
            font-size: 24px;
            font-weight: 800;
            color: #e53535;
        }

        /* ── Thank You ── */
        .inv-thankyou {
            padding: 20px 48px;
            border-top: 2px solid #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }
        .thankyou-text {
            font-size: 14px;
            font-weight: 600;
            color: #555;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .thankyou-email {
            font-size: 13px;
            color: #888;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* ── Print Button (hidden when printing) ── */
        .print-btn {
            display: block;
            width: max-content;
            margin: 24px auto 0;
            padding: 12px 28px;
            background: #111;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s;
        }
        .print-btn:hover { background: #333; }

        /* ── Print Media ── */
        @media print {
            body { background: #fff !important; padding: 0 !important; }
            .invoice-wrap { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
            .print-btn { display: none !important; }
            @page {
                size: A4;
                margin: 12mm 14mm;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-wrap">

        <!-- Header -->
        <div class="inv-header">
            <div class="inv-logo">${logoHTML}</div>
            <div class="inv-meta">
                <div class="inv-label">Invoice</div>
                <div class="inv-number">${invoice.invoiceNo}</div>
            </div>
        </div>

        <!-- Bill To / From -->
        <div class="inv-parties">
            <div class="inv-party-block">
                <div class="party-label">Bill To</div>
                <p class="party-name">${billToName}</p>
                <p>${user.email}</p>
            </div>
            <div class="inv-party-block" style="text-align:right;">
                ${companyLines.map((l, i) => i === 0
                    ? `<p class="party-name">${l}</p>`
                    : `<p>${l}</p>`
                ).join('')}
            </div>
        </div>

        <!-- Line Items -->
        <div class="inv-items">
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="right">Rate</th>
                        <th class="center">Qty</th>
                        <th class="right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                    <tr>
                        <td>
                            <div class="item-desc">${item.description || 'Service'}</div>
                            <div class="item-date">${date}</div>
                        </td>
                        <td class="right">${formatMoney(item.price || item.amount)}</td>
                        <td class="center">${item.quantity || 1}</td>
                        <td class="right"><strong>${formatMoney(item.amount)}</strong></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div class="inv-totals">
            <div class="totals-grid">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>${formatMoney(subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>${taxLabel} (${taxRate}%)</span>
                    <span>${formatMoney(taxAmount)}</span>
                </div>
                <div class="total-row grand">
                    <span>Total</span>
                    <span class="total-value">${formatMoney(total)}</span>
                </div>
            </div>
        </div>

        <!-- Bank Info -->
        ${bankRows ? `
        <div class="inv-bank">
            <div>
                <div class="bank-label">Bank Info</div>
                ${bankRows}
            </div>
            <div style="text-align:right;">
                <div class="due-label">Due</div>
                <div style="font-size:14px;font-weight:600;color:#111;">On Receipt</div>
            </div>
        </div>
        ` : ''}

        <!-- Footer / Balance Due -->
        <div class="inv-footer">
            <div class="inv-due">
                <div class="due-label">Date</div>
                <div class="due-date">${date}</div>
            </div>
            <div class="inv-balance-due">
                <div class="balance-label">Balance Due</div>
                <div class="balance-amount">${formatMoney(total)}</div>
            </div>
        </div>

        <!-- Thank You -->
        <div class="inv-thankyou">
            <div class="thankyou-text">
                <span>❤️</span>
                <span>${footerNote}</span>
            </div>
            ${companyEmail ? `<div class="thankyou-email"><span>✉️</span><span>${companyEmail}</span></div>` : ''}
        </div>
    </div>

    <button class="print-btn" onclick="window.print()">⬇ Save as PDF</button>

    <script>
        // Auto-trigger print dialog on load
        window.addEventListener('load', () => {
            // Small delay so fonts render before print dialog
            setTimeout(() => window.print(), 400);
        });
    </script>
</body>
</html>`;
};
