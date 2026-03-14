'use client'

import { useEffect } from 'react'

interface PricingRow { planOption: string; detail: string; monthlyRate: string }

interface Quote {
  id: number
  quoteNumber: string
  quoteDate: string
  clientName: string
  clientAddress: string
  clientPhone: string | null
  clientEmail: string | null
  serviceType: string
  scopeItems: string
  pricingOptions: string
  commitment: string
  termsItems: string
  status: string
  notes: string | null
}

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function QuotePrintView({ quote }: { quote: Quote }) {
  const scope: string[] = JSON.parse(quote.scopeItems || '[]')
  const pricing: PricingRow[] = JSON.parse(quote.pricingOptions || '[]')
  const terms: string[] = JSON.parse(quote.termsItems || '[]')

  useEffect(() => {
    document.title = `${quote.quoteNumber} - ${quote.clientName}`
    // Auto-print when opened from the modal Print button
    if (typeof window !== 'undefined' && window.location.search.includes('autoprint=1')) {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
  }, [quote])

  return (
    <>

      {/* ── QUOTE DOCUMENT ─────────────────────────────────── */}
      <div className="quote-page">

        {/* WATERMARK */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          aria-hidden="true"
          className="watermark"
        />

        {/* ── HEADER: company left | client right ── */}
        <div className="doc-header">
          {/* Company block */}
          <div className="company-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Parra's General Services" className="header-logo" />
            <div className="company-details">
              <p className="company-name">PARRA&apos;S GENERAL SERVICES</p>
              <p>Apt 47 – 409 Joseph St, Port Elgin, ON N0H 2C2</p>
              <p>Phone: 519-385-5713</p>
              <p>Email: Kevin.kp715@gmail.com</p>
              <p>parrasgeneralservices.ca</p>
            </div>
          </div>

          {/* Client block */}
          <div className="client-block">
            <p className="client-label">Bill To:</p>
            <p className="client-name">{quote.clientName}</p>
            {quote.clientAddress && <p>{quote.clientAddress}</p>}
            {quote.clientPhone && <p>Phone: {quote.clientPhone}</p>}
            {quote.clientEmail && <p>Email: {quote.clientEmail}</p>}
          </div>
        </div>

        {/* ── DIVIDER + QUOTE META ── */}
        <div className="divider" />

        <div className="quote-meta">
          <div>
            <span className="meta-label">Quote #</span>
            <span className="meta-value">{quote.quoteNumber}</span>
          </div>
          <div>
            <span className="meta-label">Date</span>
            <span className="meta-value">{formatDate(quote.quoteDate)}</span>
          </div>
          <div>
            <span className="meta-label">Service</span>
            <span className="meta-value">{quote.serviceType}</span>
          </div>
        </div>

        <div className="divider" style={{ marginTop: 8 }} />

        {/* ── SCOPE OF WORK ── */}
        {scope.length > 0 && (
          <div className="section">
            <h3 className="section-title">Scope of Work</h3>
            <ul className="bullet-list">
              {scope.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* ── PRICING OPTIONS ── */}
        {pricing.length > 0 && (
          <div className="section">
            <h3 className="section-title">Pricing Options</h3>
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Plan Option</th>
                  <th>Detail / Frequency</th>
                  <th style={{ textAlign: 'right' }}>Monthly Rate (CAD)</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, i) => (
                  <tr key={i}>
                    <td>{row.planOption}</td>
                    <td>{row.detail}</td>
                    <td style={{ textAlign: 'right' }}>{row.monthlyRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PROFESSIONAL COMMITMENT ── */}
        {quote.commitment && (
          <div className="section">
            <h3 className="section-title">Professional Commitment</h3>
            {quote.commitment.split('\n\n').map((para, i) => (
              <p key={i} className="para" style={{ whiteSpace: 'pre-wrap' }}>{para}</p>
            ))}
          </div>
        )}

        {/* ── TERMS & CONDITIONS ── */}
        {terms.length > 0 && (
          <div className="section">
            <h3 className="section-title">Terms &amp; Conditions</h3>
            <ul className="bullet-list">
              {terms.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* ── SIGNATURE ── */}
        <div className="signature-block">
          <div className="sig-col">
            <div className="sig-line" />
            <p>Authorized Signature — Parra&apos;s General Services</p>
          </div>
          <div className="sig-col">
            <div className="sig-line" />
            <p>Client Signature &amp; Date</p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="doc-footer">
          <p>Parra&apos;s General Services · parrasgeneralservices.ca · 519-385-5713</p>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 0;
          background: #e8e8e8;
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #1a1a1a;
        }

        .quote-page {
          position: relative;
          background: #ffffff;
          width: 210mm;
          min-height: 297mm;
          margin: 24px auto;
          padding: 18mm 20mm 16mm;
          box-shadow: 0 6px 40px rgba(0,0,0,0.18);
          overflow: hidden;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 340px;
          height: 340px;
          object-fit: contain;
          opacity: 0.07;
          pointer-events: none;
          z-index: 0;
        }

        .doc-header,
        .divider,
        .quote-meta,
        .section,
        .signature-block,
        .doc-footer {
          position: relative;
          z-index: 1;
        }

        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 12px;
        }

        .company-block {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .header-logo {
          width: 70px;
          height: 70px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .company-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .company-name {
          font-size: 11.5pt;
          font-weight: 700;
          color: #0B4F2A;
          letter-spacing: 0.4px;
          margin: 0 0 3px 0;
        }

        .company-details p {
          margin: 0;
          font-size: 8.5pt;
          color: #444;
          line-height: 1.5;
          font-family: Arial, sans-serif;
        }

        .client-block {
          text-align: right;
          flex-shrink: 0;
          max-width: 45%;
        }

        .client-label {
          font-size: 8pt;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 4px 0;
          font-family: Arial, sans-serif;
        }

        .client-name {
          font-size: 11pt;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 3px 0;
        }

        .client-block p {
          margin: 1px 0;
          font-size: 8.5pt;
          color: #444;
          font-family: Arial, sans-serif;
        }

        .divider {
          border: none;
          border-top: 2px solid #0B4F2A;
          margin: 14px 0;
        }

        .quote-meta {
          display: flex;
          gap: 32px;
          margin-bottom: 4px;
        }

        .quote-meta div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-label {
          font-size: 7.5pt;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #888;
          font-family: Arial, sans-serif;
        }

        .meta-value {
          font-size: 10pt;
          font-weight: 700;
          color: #0F172A;
        }

        .section {
          margin-bottom: 18px;
        }

        .section-title {
          font-size: 10.5pt;
          font-weight: 700;
          color: #0B4F2A;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border-bottom: 1px solid #D1FAE5;
          padding-bottom: 4px;
        }

        .para {
          margin: 0 0 8px 0;
          font-size: 9.5pt;
          color: #222;
          line-height: 1.6;
          font-family: Arial, sans-serif;
        }

        .bullet-list {
          margin: 0;
          padding-left: 20px;
        }

        .bullet-list li {
          margin-bottom: 4px;
          font-size: 9.5pt;
          color: #222;
          line-height: 1.6;
          font-family: Arial, sans-serif;
        }

        .pricing-table {
          width: 100%;
          border-collapse: collapse;
        }

        .pricing-table th {
          font-size: 8.5pt;
          font-weight: 700;
          color: #0B4F2A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1.5px solid #0B4F2A;
          padding: 5px 6px 5px 0;
          font-family: Arial, sans-serif;
          text-align: left;
        }

        .pricing-table td {
          font-size: 9.5pt;
          color: #222;
          padding: 7px 6px 7px 0;
          border-bottom: 1px solid #E8F5EE;
          vertical-align: top;
          font-family: Arial, sans-serif;
        }

        .pricing-table tbody tr:last-child td {
          border-bottom: 1.5px solid #0B4F2A;
        }

        .signature-block {
          display: flex;
          gap: 40px;
          margin-top: 32px;
          padding-top: 16px;
        }

        .sig-col {
          flex: 1;
        }

        .sig-line {
          border-top: 1px solid #555;
          margin-bottom: 6px;
        }

        .sig-col p {
          font-size: 8pt;
          color: #666;
          margin: 0;
          font-family: Arial, sans-serif;
        }

        .doc-footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #E2E8F0;
          text-align: center;
        }

        .doc-footer p {
          font-size: 7.5pt;
          color: #999;
          margin: 0;
          font-family: Arial, sans-serif;
        }

        @media print {
          body { background: #ffffff; }
          .no-print { display: none !important; }
          .quote-page {
            margin: 0;
            box-shadow: none;
            width: 100%;
            padding: 14mm 18mm 12mm;
          }
          .watermark { opacity: 0.06; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </>
  )
}
