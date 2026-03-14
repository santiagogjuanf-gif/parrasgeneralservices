'use client'

import { useEffect } from 'react'
import Image from 'next/image'

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
  }, [quote])

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="no-print fixed right-4 top-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg"
          style={{ backgroundColor: '#0B7A3B' }}>
          ⬇ Download PDF
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-xl border bg-white px-5 py-2.5 text-sm font-medium shadow"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
          ✕ Close
        </button>
      </div>

      {/* Quote Document */}
      <div className="quote-page">

        {/* ── COMPANY HEADER ──────────────────────────────── */}
        <div className="company-header">
          <div className="company-logo-block">
            <Image
              src="/images/logo.png"
              alt="Parra's General Services"
              width={160}
              height={60}
              style={{ objectFit: 'contain', maxHeight: 60 }}
              unoptimized
            />
          </div>
          <div className="company-info">
            <p className="company-name">PARRA&apos;S GENERAL SERVICES</p>
            <p>Email: Kevin.kp715@gmail.com</p>
            <p>Phone: 519-385-5713</p>
          </div>
        </div>

        <div className="divider" />

        {/* ── QUOTE HEADER ──────────────────────────────── */}
        <div className="section">
          <h2 className="section-title">QUOTE / SERVICE ESTIMATE</h2>
          <p><strong>Quote #:</strong> {quote.quoteNumber}</p>
          <p><strong>Client:</strong> {quote.clientName}{quote.clientAddress ? `, ${quote.clientAddress}` : ''}</p>
          {quote.clientPhone && <p><strong>Phone:</strong> {quote.clientPhone}</p>}
          {quote.clientEmail && <p><strong>Email:</strong> {quote.clientEmail}</p>}
          <p><strong>Date:</strong> {formatDate(quote.quoteDate)}</p>
        </div>

        {/* ── SCOPE OF WORK ──────────────────────────────── */}
        {scope.length > 0 && (
          <div className="section">
            <h3 className="section-title">Scope of Work ({quote.serviceType}):</h3>
            <ul className="bullet-list">
              {scope.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* ── PRICING OPTIONS ──────────────────────────────── */}
        {pricing.length > 0 && (
          <div className="section">
            <h3 className="section-title">Pricing Options:</h3>
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Plan Option</th>
                  <th>Detail / Frequency</th>
                  <th>Monthly Rate (CAD)</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, i) => (
                  <tr key={i}>
                    <td>{row.planOption}</td>
                    <td>{row.detail}</td>
                    <td>{row.monthlyRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PROFESSIONAL COMMITMENT ──────────────────────────────── */}
        {quote.commitment && (
          <div className="section">
            <h3 className="section-title">Professional Commitment:</h3>
            {quote.commitment.split('\n\n').map((para, i) => (
              <p key={i} className="para">{para}</p>
            ))}
          </div>
        )}

        {/* ── TERMS & CONDITIONS ──────────────────────────────── */}
        {terms.length > 0 && (
          <div className="section">
            <h3 className="section-title">Terms &amp; Conditions:</h3>
            <ul className="bullet-list">
              {terms.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* ── SIGNATURE ──────────────────────────────── */}
        <div className="signature-block">
          <p className="signature-line">Authorized Signature: ___________________________</p>
        </div>

      </div>

      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 0;
          background: #f0f0f0;
          font-family: 'Times New Roman', Georgia, serif;
        }

        .quote-page {
          background: #ffffff;
          width: 210mm;
          min-height: 297mm;
          margin: 24px auto;
          padding: 20mm 22mm;
          box-shadow: 0 4px 32px rgba(0,0,0,0.15);
        }

        /* ── Company header ── */
        .company-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 16px;
        }
        .company-logo-block {
          flex-shrink: 0;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 15pt;
          font-weight: 700;
          color: #1a4fa0;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }
        .company-info p {
          margin: 2px 0;
          font-size: 10pt;
          color: #333;
        }

        .divider {
          border-top: 2px solid #1a4fa0;
          margin: 16px 0;
        }

        /* ── Sections ── */
        .section {
          margin-bottom: 24px;
        }
        .section p {
          margin: 3px 0;
          font-size: 10.5pt;
          color: #222;
          line-height: 1.5;
        }

        .section-title {
          font-size: 12pt;
          font-weight: 700;
          color: #1a4fa0;
          margin: 0 0 10px 0;
        }

        .para {
          margin: 0 0 10px 0 !important;
          font-size: 10.5pt;
          color: #222;
          line-height: 1.6;
        }

        /* ── Bullet list ── */
        .bullet-list {
          margin: 0;
          padding-left: 24px;
        }
        .bullet-list li {
          font-size: 10.5pt;
          color: #222;
          margin-bottom: 6px;
          line-height: 1.5;
        }

        /* ── Pricing table ── */
        .pricing-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        .pricing-table th {
          text-align: left;
          font-size: 10.5pt;
          font-weight: 600;
          color: #1a4fa0;
          border-bottom: 1px solid #ccc;
          padding: 6px 8px 6px 0;
        }
        .pricing-table td {
          font-size: 10.5pt;
          color: #222;
          padding: 8px 8px 8px 0;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }

        /* ── Signature ── */
        .signature-block {
          margin-top: 40px;
          padding-top: 20px;
        }
        .signature-line {
          font-size: 10.5pt;
          color: #333;
        }

        /* ── Print tweaks ── */
        @media print {
          body { background: #ffffff; }
          .no-print { display: none !important; }
          .quote-page {
            margin: 0;
            box-shadow: none;
            width: 100%;
            padding: 15mm 20mm;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </>
  )
}
