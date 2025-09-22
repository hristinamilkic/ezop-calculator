import jsPDF from "jspdf";
import type { CalculatorData } from "@/components/ContractCalculator";
import companyLogo from "@/assets/logo-bordi.png";

export const generatePDF = (data: CalculatorData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Company information
  const companyInfo = {
    name: "BORDI d.o.o.",
    address: "Ševina 45, 11080 Zemun, Srbija",
    pib: "114702479",
    mb: "22058142",
  };

  // Header with logo and company info
  const logoWidth = 50;
  const logoHeight = 17;

  // Add logo (left side)
  try {
    pdf.addImage(companyLogo, "PNG", 20, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn("Logo could not be added to PDF");
  }

  // Company info (right side)
  pdf.setFontSize(12);
  pdf.setFont("Helvetica", "bold");
  pdf.text(companyInfo.name, pageWidth - 20, 15, { align: "right" });

  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(companyInfo.address, pageWidth - 20, 20, { align: "right" });
  pdf.text(`PIB: ${companyInfo.pib}`, pageWidth - 20, 25, { align: "right" });
  pdf.text(`MB: ${companyInfo.mb}`, pageWidth - 20, 30, { align: "right" });

  if (data.companyName) {
    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "bold");

    // Calculate text width and add padding
    const text = `ZA: ${data.companyName}`;
    const textWidth = pdf.getTextWidth(text);
    const padding = 8; // 4px padding on each side
    const boxWidth = textWidth + padding;
    const boxHeight = 12; // Height with padding

    // Position box on the right side
    const boxX = pageWidth - boxWidth - 20; // 20px margin from right edge
    const boxY = 40;

    pdf.rect(boxX, boxY, boxWidth, boxHeight);
    pdf.text(text, boxX + padding / 2, boxY + 8, { align: "left" });
  }
  // Broj ponude i datum (leva strana ispod logoa)
  pdf.setFontSize(10);
  pdf.setFont("Helvetica", "normal");
  const currentDate = new Date().toLocaleDateString();
  pdf.text(`Broj: ${data.offerNumber}`, 20, 35);
  pdf.text(`Datum: ${currentDate}`, 20, 40);
  pdf.text("REF: Ponuda", 20, 45);

  // Title
  pdf.setFontSize(18);
  pdf.setFont("Helvetica", "bold");
  pdf.text("Contract Price Calculation", 20, 75);

  pdf.text(`VAT Rate: ${data.vatPercent}%`, 20, 102);

  // Table (only if showTableInPDF is true)
  let tableTop = 120;
  let yPosition = tableTop + 20; // Default position for totals

  if (data.showTableInPDF) {
    // Table headers
    const colWidths = [80, 30, 25, 30]; // Description, Unit Price, Qty, Total
    const colPositions = [20, 100, 130, 155]; // X positions

    pdf.setFontSize(10);
    pdf.setFont("Helvetica", "bold");

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
    yPosition = tableTop + 10;
    pdf.setFont("Helvetica", "normal");

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

    // Add totals after table
    const subtotal = data.rows.reduce((sum, row) => sum + row.total, 0);
    const vatAmount = subtotal * (data.vatPercent / 100);
    const monthlyTotal = subtotal + vatAmount;

    yPosition += 10;
    pdf.line(20, yPosition - 5, pageWidth - 20, yPosition - 5);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Subtotal:", 150, yPosition, { align: "right" });
    pdf.text(
      subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      185,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;
    pdf.text(`VAT (${data.vatPercent}%):`, 150, yPosition, { align: "right" });
    pdf.text(
      vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      185,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;
    pdf.setFontSize(12);
    pdf.text("Total:", 150, yPosition, { align: "right" });
    pdf.text(
      `${monthlyTotal.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} ${data.currency}`,
      185,
      yPosition,
      { align: "right" }
    );
  } else {
    // If table is not shown, don't show anything
    // Just keep the current yPosition for terms section
  }

  // Terms and conditions section
  yPosition += 20;
  pdf.setFontSize(12);
  pdf.setFont("Helvetica", "bold");
  pdf.text("Terms and Conditions", 20, yPosition);

  yPosition += 10;
  pdf.setFontSize(9);
  pdf.setFont("Helvetica", "normal");

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
  pdf.setFont("Helvetica", "bold");
  pdf.text("Contact Information", 20, yPosition);

  yPosition += 10;
  pdf.setFontSize(9);
  pdf.setFont("Helvetica", "normal");
  pdf.text(
    "For any questions regarding this quote, please contact us:",
    20,
    yPosition
  );
  yPosition += 8;

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);

  // Save the PDF
  const filename = `contract_calculation_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(filename);
};
