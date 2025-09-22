import jsPDF from "jspdf";
import type { CalculatorData } from "@/components/ContractCalculator";
import companyLogo from "@/assets/logo-bordi.png";

export const generatePDF = (data: CalculatorData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Company information
  const companyInfo = {
    name: "Professional Services Ltd.",
    address: "123 Business Street",
    city: "City, 11000",
    country: "Serbia",
    phone: "+381 11 123 4567",
    email: "info@professional-services.com",
    website: "www.professional-services.com",
  };

  // Header with logo and company info
  const logoWidth = 40;
  const logoHeight = 20;

  // Add logo (left side)
  try {
    pdf.addImage(companyLogo, "PNG", 20, 20, logoWidth, logoHeight);
  } catch (error) {
    console.warn("Logo could not be added to PDF");
  }

  // Company info (right side)
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(companyInfo.name, pageWidth - 20, 25, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(companyInfo.address, pageWidth - 20, 32, { align: "right" });
  pdf.text(companyInfo.city, pageWidth - 20, 37, { align: "right" });
  pdf.text(companyInfo.country, pageWidth - 20, 42, { align: "right" });
  pdf.text(`Tel: ${companyInfo.phone}`, pageWidth - 20, 49, { align: "right" });
  pdf.text(`Email: ${companyInfo.email}`, pageWidth - 20, 54, {
    align: "right",
  });
  pdf.text(companyInfo.website, pageWidth - 20, 59, { align: "right" });

  // Title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Contract Price Calculation", 20, 80);

  // Date and currency info
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString();
  pdf.text(`Date: ${currentDate}`, 20, 90);
  pdf.text(`Currency: ${data.currency}`, 20, 96);
  pdf.text(`VAT Rate: ${data.vatPercent}%`, 20, 102);

  // Table headers
  const tableTop = 120;
  const colWidths = [80, 30, 25, 30]; // Description, Unit Price, Qty, Total
  const colPositions = [20, 100, 130, 155]; // X positions

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");

  // Header background
  pdf.setFillColor(240, 242, 247);
  pdf.rect(20, tableTop - 5, pageWidth - 40, 10, "F");

  pdf.text("Description", colPositions[0], tableTop);
  pdf.text("Unit Price", colPositions[1], tableTop);
  pdf.text("Qty", colPositions[2], tableTop);
  pdf.text("Total", colPositions[3], tableTop);

  // Table lines
  pdf.line(20, tableTop + 2, pageWidth - 20, tableTop + 2);

  // Table rows
  let yPosition = tableTop + 10;
  pdf.setFont("helvetica", "normal");

  data.rows.forEach((row, index) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 30;
    }

    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 8, "F");
    }

    const description =
      row.description.length > 35
        ? row.description.substring(0, 32) + "..."
        : row.description;

    pdf.text(description, colPositions[0], yPosition);
    pdf.text(
      row.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      colPositions[1],
      yPosition
    );
    pdf.text(row.quantity.toString(), colPositions[2], yPosition);
    pdf.text(
      row.total.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      colPositions[3],
      yPosition
    );

    yPosition += 8;
  });

  // Totals
  const subtotal = data.rows.reduce((sum, row) => sum + row.total, 0);
  const vatAmount = subtotal * (data.vatPercent / 100);
  const monthlyTotal = subtotal + vatAmount;

  yPosition += 10;
  pdf.line(20, yPosition - 5, pageWidth - 20, yPosition - 5);

  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal:", 155, yPosition, { align: "right" });
  pdf.text(
    subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    185,
    yPosition,
    { align: "right" }
  );

  yPosition += 8;
  pdf.text(`VAT (${data.vatPercent}%):`, 155, yPosition, { align: "right" });
  pdf.text(
    vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    185,
    yPosition,
    { align: "right" }
  );

  yPosition += 8;
  pdf.setFontSize(12);
  pdf.text("Total:", 155, yPosition, { align: "right" });
  pdf.text(
    `${monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${
      data.currency
    }`,
    185,
    yPosition,
    { align: "right" }
  );

  // Terms and conditions section
  yPosition += 20;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Terms and Conditions", 20, yPosition);

  yPosition += 10;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  const terms = [
    "• Payment terms: Net 30 days from invoice date",
    "• All prices are exclusive of VAT unless otherwise stated",
    "• Services will be delivered according to agreed timeline",
    "• Any changes to scope may result in additional charges",
    "• This quote is valid for 30 days from the date of issue",
  ];

  terms.forEach((term) => {
    pdf.text(term, 20, yPosition);
    yPosition += 6;
  });

  // Contact information section
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Contact Information", 20, yPosition);

  yPosition += 10;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "For any questions regarding this quote, please contact us:",
    20,
    yPosition
  );
  yPosition += 8;
  pdf.text(`Phone: ${companyInfo.phone}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${companyInfo.email}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Website: ${companyInfo.website}`, 20, yPosition);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);

  // Save the PDF
  const filename = `contract_calculation_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(filename);
};
