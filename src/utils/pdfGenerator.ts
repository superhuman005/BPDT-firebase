
import { BusinessPlanData } from "@/pages/Index";

export const generatePDF = (data: BusinessPlanData) => {
  // Create a formatted HTML content for the business plan
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.companyName} - Business Plan</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3B82F6;
        }
        .company-name {
          font-size: 36px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 18px;
          color: #6B7280;
          margin-bottom: 10px;
        }
        .date {
          font-size: 14px;
          color: #9CA3AF;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #E5E7EB;
        }
        .section-number {
          display: inline-block;
          background-color: #3B82F6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          margin-right: 10px;
        }
        .content {
          font-size: 14px;
          line-height: 1.7;
          text-align: justify;
          white-space: pre-wrap;
        }
        .toc {
          margin: 30px 0;
          padding: 20px;
          background-color: #F9FAFB;
          border-radius: 8px;
        }
        .toc-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .toc-item {
          margin: 8px 0;
          font-size: 14px;
        }
        .page-break {
          page-break-before: always;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${data.companyName}</div>
        <div class="subtitle">Business Plan</div>
        <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="toc">
        <div class="toc-title">Table of Contents</div>
        <div class="toc-item">1. Executive Summary</div>
        <div class="toc-item">2. Company Overview</div>
        <div class="toc-item">3. Problem Statement</div>
        <div class="toc-item">4. Solution</div>
        <div class="toc-item">5. Market Analysis</div>
        <div class="toc-item">6. Market Size & Opportunity</div>
        <div class="toc-item">7. Business Model</div>
        <div class="toc-item">8. Revenue Streams</div>
        <div class="toc-item">9. Marketing Strategy</div>
        <div class="toc-item">10. Operations Plan</div>
        <div class="toc-item">11. Management Team</div>
        <div class="toc-item">12. Financial Projections</div>
        <div class="toc-item">13. Funding Request</div>
        <div class="toc-item">14. Competitive Advantage</div>
        <div class="toc-item">15. Risk Analysis</div>
      </div>

      <div class="page-break"></div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">1</span>Executive Summary
        </div>
        <div class="content">${data.businessDescription || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">2</span>Company Overview
        </div>
        <div class="content">${data.companyName} operates in the ${data.sector || ''} industry.</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">3</span>Problem Statement
        </div>
        <div class="content">${data.productsServices || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">4</span>Solution
        </div>
        <div class="content">${data.purposeValue || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">5</span>Market Analysis
        </div>
        <div class="content">${data.marketAnalysis || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">6</span>Market Size & Opportunity
        </div>
        <div class="content">${data.marketDemographics || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">7</span>Business Model
        </div>
        <div class="content">${data.generalMarketingStrategies || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">8</span>Revenue Streams
        </div>
        <div class="content">${data.salesProcesses || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">9</span>Marketing Strategy
        </div>
        <div class="content">${data.promotionStrategies || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">10</span>Operations Plan
        </div>
        <div class="content">${data.systemsInternalControl || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">11</span>Management Team
        </div>
        <div class="content">${data.managementTeam || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">12</span>Financial Projections
        </div>
        <div class="content">${data.salesForecast || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">13</span>Funding Request
        </div>
        <div class="content">${data.funding || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">14</span>Competitive Advantage
        </div>
        <div class="content">${data.uniqueSellingPoint || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-number">15</span>Risk Analysis
        </div>
        <div class="content">${data.risks || ''}</div>
      </div>
    </body>
    </html>
  `;

  // Create a new window with the content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
};
