import jsPDF from "jspdf";
import type { CalculatorData } from "@/components/ContractCalculator";
import companyLogo from "@/assets/logo-bordi.png";
import "../fonts/OpenSans-Regular-normal.js";
import "../fonts/OpenSans-Bold-bold.js";
import "../fonts/OpenSans-Italic-italic.js";
import "../fonts/OpenSans-BoldItalic-bolditalic.js";

// Helper function to draw text with bold keywords
const drawTextWithBoldKeywords = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  keywords: string[],
  lineHeightFactor: number = 1.3
): number => {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let currentX = x;

    // Find all keywords in this line
    let remainingText = line;
    let foundKeyword = false;

    for (const keyword of keywords) {
      if (remainingText.includes(keyword)) {
        const parts = remainingText.split(keyword);

        // Draw text before keyword
        if (parts[0]) {
          pdf.setFont("OpenSans-Regular", "normal");
          pdf.text(parts[0], currentX, currentY, { lineHeightFactor });
          currentX += pdf.getTextWidth(parts[0]);
        }

        // Draw bold keyword
        pdf.setFont("OpenSans-Bold", "bold");
        pdf.text(keyword, currentX, currentY, { lineHeightFactor });
        currentX += pdf.getTextWidth(keyword);

        // Update remaining text
        remainingText = parts[1] || "";
        foundKeyword = true;
        break;
      }
    }

    // Draw remaining text
    if (remainingText) {
      pdf.setFont("OpenSans-Regular", "normal");
      pdf.text(remainingText, currentX, currentY, { lineHeightFactor });
    } else if (!foundKeyword) {
      // No keywords found, draw entire line normally
      pdf.setFont("OpenSans-Regular", "normal");
      pdf.text(line, currentX, currentY, { lineHeightFactor });
    }

    currentY += 5;
  }

  return currentY - y; // Return height used
};

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
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text(companyInfo.name, pageWidth - 20, 15, { align: "right" });

  pdf.setFont("OpenSans-Regular", "normal");
  pdf.setFontSize(11);
  pdf.text(companyInfo.address, pageWidth - 20, 22, { align: "right" });
  pdf.text(`PIB: ${companyInfo.pib}`, pageWidth - 20, 28, { align: "right" });
  pdf.text(`MB: ${companyInfo.mb}`, pageWidth - 20, 34, { align: "right" });

  if (data.companyName) {
    pdf.setFontSize(11);
    pdf.setFont("OpenSans-Bold", "bold");

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
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  const currentDate = new Date().toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  pdf.text(`Broj: ${data.offerNumber}`, 20, 40);
  pdf.text(`Datum: ${currentDate}`, 20, 47);
  pdf.text("REF: Ponuda", 20, 54);

  // Start content based on company type
  let yPosition = 70;

  if (data.isAccreditedCompany) {
    // Accredited company content
    yPosition = generateAccreditedCompanyContent(pdf, yPosition, pageWidth);
  } else {
    // Regular company content
    yPosition = generateRegularCompanyContent(pdf, yPosition, pageWidth);
  }

  // Add table if showTableInPDF is true
  if (data.showTableInPDF && data.rows.length > 0) {
    yPosition = addTableToPDF(pdf, data, yPosition, pageWidth);
  }

  // Add footer
  addFooter(pdf, yPosition, pageWidth);

  // Save the PDF
  const filename = `${data.companyName} - ponuda eZOP softvera.pdf`;
  pdf.save(filename);
};

const checkAndAddPage = (
  pdf: jsPDF,
  yPosition: number,
  contentHeight: number
): number => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = 20; // Bottom margin same as left/right margins

  if (yPosition + contentHeight > pageHeight - bottomMargin) {
    pdf.addPage();
    return 20; // Start new page from top with 20px margin
  }
  return yPosition;
};

const generateRegularCompanyContent = (
  pdf: jsPDF,
  startY: number,
  pageWidth: number
): number => {
  let yPosition = startY;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = 40;

  // Subject
  pdf.setFontSize(11);

  // Part 1: "PREDMET: " in regular font
  const subjectPrefix = "PREDMET: ";
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(subjectPrefix, 20, yPosition);

  // Calculate width of the prefix
  const prefixWidth = pdf.getTextWidth(subjectPrefix);

  // Part 2: Rest of the first line in bold font
  const subjectPart1 =
    "Ponuda za implermentaciju digitalnog servisa iz oblasti zaštite";
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text(subjectPart1, 20 + prefixWidth, yPosition);

  yPosition += 6;

  // Part 3: Second line in bold font
  const subjectPart2 = "od požara - eZOP na ugovornu obavezu od godinu dana.";
  pdf.text(subjectPart2, 20, yPosition);
  yPosition += 13;

  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("Predmet:", 20, yPosition);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("INFORMATIVNA PONUDA", 20 + pdf.getTextWidth("Predmet:"), yPosition);
  yPosition += 13;

  // Greeting
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("Poštovani,", 20, yPosition);
  yPosition += 8;

  const introText =
    "Na osnovu prezentacije sofverskog rešenja za, servisa za elektronsku evidenciju zaštite od požara, eZOP, dostavljamo Vam informativnu ponudu sa uslovima za korišćenja usluga eZOP servisa, pod sledećim uslovima :";
  const introLines = pdf.splitTextToSize(introText, pageWidth - 40);
  pdf.text(introLines, 20, yPosition, { lineHeightFactor: 1.3 });
  yPosition += introLines.length * 7 + 4;

  // Check if Section 1 fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 50);

  // Section 1
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("1. Uvod u korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 10;

  // Section 1a - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("a.", 35, yPosition);
  const section1aText =
    "Za korišćenje mobilne i administratorske WEB platforme. Obuka podrazumeva teoretska pojašnjenja svih funkcionalnosti eZOP servisa na WEB i mobilnoj platformi. Obuka će se održati u prostorijama naručioca ili u prostorijama Bordi D.O.O u vremenskom trajanju od 4 časa.";
  const section1aWidth = pdf.getTextWidth("a. ");
  const section1aLines = pdf.splitTextToSize(
    section1aText,
    pageWidth - 60 - section1aWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1aLines, 35 + section1aWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section1aLines.length * 5 + 1;

  // Check if Section 1b fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1b - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("b.", 35, yPosition);
  const section1bText =
    "Inicijalno kreiranje baze podataka uređaja, opreme i instalacija. Obilazak svih poslovnica i unos podataka za svaki pojedinačni uređaj, hidrant, opremu i instalaciju. Ponudom je obuhvaćena bar-kod identifikacijona nalepnica za sve uređaje korisnika.";
  const section1bWidth = pdf.getTextWidth("b. ");
  const section1bLines = pdf.splitTextToSize(
    section1bText,
    pageWidth - 60 - section1bWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1bLines, 35 + section1bWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section1bLines.length * 5 + 1;

  // Check if Section 1c fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1c - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("c.", 35, yPosition);
  const section1cText =
    "Kreiranje korisničkih naloga podrzumeva pomoć kod unos i profilisanje korisničkih naloga.";
  const section1cWidth = pdf.getTextWidth("c. ");
  const section1cLines = pdf.splitTextToSize(
    section1cText,
    pageWidth - 60 - section1cWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1cLines, 35 + section1cWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section1cLines.length * 5 + 1;

  // Check if Section 1d fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1d - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("d.", 35, yPosition);
  const section1dText =
    "Podešavanje funkcionalnosti i preferenci profila podrazumeva podešavanje i predefinisanje nivoa pristupa korisnika, kao i profilisanje eZOP servisa u odnosu na profil organizacije.";
  const section1dWidth = pdf.getTextWidth("d. ");
  const section1dLines = pdf.splitTextToSize(
    section1dText,
    pageWidth - 60 - section1dWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1dLines, 35 + section1dWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section1dLines.length * 5 + 1;

  // Check if commercial conditions box fits on current page
  const commercialBoxHeight = 35; // Balanced for readability and fit
  yPosition = checkAndAddPage(pdf, yPosition, commercialBoxHeight);

  // Commercial conditions box
  yPosition = addCommercialConditionsBox(
    pdf,
    yPosition,
    pageWidth,
    "Na ime troškova za sve navedeno pod tačkom 1, Naručioc je dužan da plati paušalni iznos od 36.000,00 RSD + PDV, jednokratno, avansnom uplatom po zaključenju Ugovora o korišćenju servisa. Dodatni izlasci na teren radi obuke ili instalacije se naplaćuje zasebno. 50Km od-do Beograda je besplatno, više od 50km se naplaćuju troškovi puta."
  );

  // Section 2
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("2. Korišćenje eZOP servisa:", 30, yPosition);
  yPosition += 10;

  // Section 2a - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("a.", 35, yPosition);
  const section2aText = "Licenca za korišćenje administratorskih WEB naloga.";
  const section2aWidth = pdf.getTextWidth("a. ");
  const section2aLines = pdf.splitTextToSize(
    section2aText,
    pageWidth - 60 - section2aWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section2aLines, 35 + section2aWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section2aLines.length * 5 + 1;

  // Check if Section 2b fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2b - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("b.", 35, yPosition);
  const section2bText =
    "Licenca za korišćenje naloga za pristup mobilnoj aplikaciji.";
  const section2bWidth = pdf.getTextWidth("b. ");
  const section2bLines = pdf.splitTextToSize(
    section2bText,
    pageWidth - 60 - section2bWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section2bLines, 35 + section2bWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section2bLines.length * 5 + 1;

  // Check if Section 2c fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2c - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("c.", 35, yPosition);
  const section2cText =
    "Tehnička podrška – otvorena linija angažovanja 24/7 sa brzinom odziva u roku od 48 sati.";
  const section2cWidth = pdf.getTextWidth("c. ");
  const section2cLines = pdf.splitTextToSize(
    section2cText,
    pageWidth - 60 - section2cWidth
  );
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section2cLines, 35 + section2cWidth, yPosition, {
    lineHeightFactor: 1.3,
  });
  yPosition += section2cLines.length * 5 + 1;

  // Check if second commercial conditions box fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, commercialBoxHeight);

  // Commercial conditions box 2
  yPosition = addCommercialConditionsBox(
    pdf,
    yPosition,
    pageWidth,
    "Na ime troškova za sve navedeno, Naručioc je dužan da plati paušalni iznos od 4.000,00 RSD + PDV, mesečno , na osnovu broja lokacija. Obračunski period za prethodni mesec, će se vršiti jednom mesečno ( od 01 do 05 ), uz ispostavljenu fakturu za plaćenje iznosa iz prethodniog obračunskog perioda."
  );

  return yPosition;
};

const generateAccreditedCompanyContent = (
  pdf: jsPDF,
  startY: number,
  pageWidth: number
): number => {
  let yPosition = startY;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = 40;

  // Subject
  pdf.setFontSize(11);

  // Part 1: "PREDMET : " in regular font
  const subjectPrefix = "PREDMET: ";
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(subjectPrefix, 20, yPosition);

  // Calculate width of the prefix
  const prefixWidth = pdf.getTextWidth(subjectPrefix);

  // Part 2: Rest of the first line in bold font
  const subjectPart1 =
    "Ponuda za implementaciju digitalnog servisa iz oblasti zaštite";
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text(subjectPart1, 20 + prefixWidth, yPosition);

  yPosition += 6;

  // Part 3: Second line in bold font
  const subjectPart2 = "od požara - eZOP";
  pdf.text(subjectPart2, 20, yPosition);
  yPosition += 13;

  // Greeting
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("Poštovani,", 20, yPosition);
  yPosition += 6;

  const introText =
    'Na osnovu dostavljenih podataka i prethodne prezentacije usluga "eZOP", servisa za elektronsku evidenciju protivpožarne opreme, instalacija i uređaja , dostavljamo Vam informativnu ponudu sa uslovima za korišćenja usluga eZOP servisa, pod sledećim uslovima :';
  const introLines = pdf.splitTextToSize(introText, pageWidth - 40);
  pdf.text(introLines, 20, yPosition, { lineHeightFactor: 1.3 });
  yPosition += introLines.length * 7 + 6;

  // Check if Section 1 fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 50);

  // Section 1
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("1. Uvod u korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 7;

  // Section 1a - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("a.", 35, yPosition);
  const section1aText =
    "Obuka zaposlenih za korišćenje mobilne i administratorske WEB platforme. Obuka podrazumeva teoretska pojašnjenja svih finkcionalnosti eZOP servisa na WEB i mobilnoj platformi na lokaciji korisnika.";
  const section1aWidth = pdf.getTextWidth("a. ");
  const heightUsed1aAcc = drawTextWithBoldKeywords(
    pdf,
    section1aText,
    35 + section1aWidth,
    yPosition,
    pageWidth - 60 - section1aWidth,
    ["Obuka zaposlenih"],
    1.0
  );
  yPosition += heightUsed1aAcc + 0.5;

  // Check if Section 1b fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1b - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("b.", 35, yPosition);
  const section1bText =
    "Kreiranje korisničkih naloga podrzumeva pomoć kod unos i profilisanje korisničkih naloga.";
  const section1bWidth = pdf.getTextWidth("b. ");
  const heightUsed1bAcc = drawTextWithBoldKeywords(
    pdf,
    section1bText,
    35 + section1bWidth,
    yPosition,
    pageWidth - 60 - section1bWidth,
    ["Kreiranje korisničkih naloga"],
    1.0
  );
  yPosition += heightUsed1bAcc + 0.5;

  // Check if Section 1c fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1c - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("c.", 35, yPosition);
  const section1cText =
    "Podešavanje funkcionalnosti i preferenci profila podrazumeva podešavanje i predefinisanje nivoa pristupa korisnika, kao i profilisanje eZOP servisa u odnosu na profil organizacije";
  const section1cWidth = pdf.getTextWidth("c. ");
  const heightUsed1cAcc = drawTextWithBoldKeywords(
    pdf,
    section1cText,
    35 + section1cWidth,
    yPosition,
    pageWidth - 60 - section1cWidth,
    ["Podešavanje funkcionalnosti"],
    1.0
  );
  yPosition += heightUsed1cAcc + 0.5;

  // Check if Section 1d fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 1d - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("d.", 35, yPosition);
  const section1dText =
    "Isporuka bar kod identifikacionih nalepnica (jedna rolna nalepnica) – 4000 komada silver pet visoko adhezivnih nalepnica u rolni, sa trajnim otiskom termalne štampe bar kod identifikacije.";
  const section1dWidth = pdf.getTextWidth("d. ");
  const heightUsed1dAcc = drawTextWithBoldKeywords(
    pdf,
    section1dText,
    35 + section1dWidth,
    yPosition,
    pageWidth - 60 - section1dWidth,
    ["Isporuka bar kod identifikacionih nalepnica"],
    1.0
  );
  yPosition += heightUsed1dAcc + 0.5;

  // Check if commercial conditions box fits on current page
  const commercialBoxHeight = 35; // Balanced for readability and fit
  yPosition = checkAndAddPage(pdf, yPosition, commercialBoxHeight);

  // Commercial conditions box
  yPosition = addCommercialConditionsBox(
    pdf,
    yPosition,
    pageWidth,
    "Na ime troškova za sve navedeno pod tačkom 1, Naručioc je dužan da plati paušalni iznos od 20.000,00 RSD + PDV, jednokratno, avansnom uplatom po zaključenju Ugovora o korišćenju servisa."
  );

  // Section 2
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("2. Korišćenje eZOP servisa:", 30, yPosition);
  yPosition += 10;

  // Section 2a - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("a.", 35, yPosition);
  const section2aText = "Licenca - za korišćenje administratorskih WEB naloga.";
  const section2aWidth = pdf.getTextWidth("a. ");
  const heightUsed2aAcc = drawTextWithBoldKeywords(
    pdf,
    section2aText,
    35 + section2aWidth,
    yPosition,
    pageWidth - 60 - section2aWidth,
    ["Licenca"],
    1.0
  );
  yPosition += heightUsed2aAcc + 0.5;

  // Check if Section 2b fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2b - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("b.", 35, yPosition);
  const section2bText =
    "Licenca - za korišćenje naloga za pristup mobilnoj aplikaciji.";
  const section2bWidth = pdf.getTextWidth("b. ");
  const heightUsed2bAcc = drawTextWithBoldKeywords(
    pdf,
    section2bText,
    35 + section2bWidth,
    yPosition,
    pageWidth - 60 - section2bWidth,
    ["Licenca"],
    1.0
  );
  yPosition += heightUsed2bAcc + 0.5;

  // Check if Section 2c fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2c - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("c.", 35, yPosition);
  const section2cText =
    "Tehnička podrška - otvorena linija angažovanja 24/7 sa brzinom odziva u roku od 48 sati.";
  const section2cWidth = pdf.getTextWidth("c. ");
  const heightUsed2cAcc = drawTextWithBoldKeywords(
    pdf,
    section2cText,
    35 + section2cWidth,
    yPosition,
    pageWidth - 60 - section2cWidth,
    ["Tehnička podrška"],
    1.0
  );
  yPosition += heightUsed2cAcc + 0.5;

  // Check if Section 2d fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2d - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("d.", 35, yPosition);
  const section2dText =
    "Baza podataka – Do 5.000 uređaja (PP aparata, hidranata I instalacija) u sistemu po ceni navedenoj 7.000 RSD + PDV. Nakon prekoračenja 5.000 uređaja, cena se računa kumolativno.";
  const section2dWidth = pdf.getTextWidth("d. ");
  const heightUsed2dAcc = drawTextWithBoldKeywords(
    pdf,
    section2dText,
    35 + section2dWidth,
    yPosition,
    pageWidth - 60 - section2dWidth,
    ["Baza podataka"],
    1.0
  );
  yPosition += heightUsed2dAcc + 0.5;

  // Check if Section 2e fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, 20);

  // Section 2e - Bold letter with indented text
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("e.", 35, yPosition);
  const section2eText =
    "Kumolativna računica - 1.40 RSD + PDV po PP aparatu, 15 RSD + PDV po Hidrantu i 110 RSD + PDV po instalaciji.";
  const section2eWidth = pdf.getTextWidth("e. ");
  const heightUsed2eAcc = drawTextWithBoldKeywords(
    pdf,
    section2eText,
    35 + section2eWidth,
    yPosition,
    pageWidth - 60 - section2eWidth,
    ["Kumolativna računica"],
    1.0
  );
  yPosition += heightUsed2eAcc + 0.5;

  // Check if second commercial conditions box fits on current page
  yPosition = checkAndAddPage(pdf, yPosition, commercialBoxHeight);

  // Commercial conditions box 2
  yPosition = addCommercialConditionsBox(
    pdf,
    yPosition,
    pageWidth,
    "Na ime troškova za sve navedeno pod tačkom 2, Naručioc je dužan da plati paušalni iznos od 7.000,00 RSD + PDV, mesečno do 5.000 uređaja u sistemu , po zaključenju Ugovora o korišćenju servisa, za obračunski period korišćenja."
  );

  return yPosition;
};

const addTableToPDF = (
  pdf: jsPDF,
  data: CalculatorData,
  startY: number,
  pageWidth: number
): number => {
  let yPosition = startY;

  // Check if table fits on current page
  const tableHeight = 50 + data.rows.length * 9 + 40; // Header + rows + totals
  yPosition = checkAndAddPage(pdf, yPosition, tableHeight);

  // Table title
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);

  yPosition += 12;

  // Table headers
  const colPositions = [20, 100, 130, 155]; // X positions

  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");

  // Header background
  pdf.setFillColor(240, 242, 247);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 11, "F");

  pdf.text("Opis", colPositions[0], yPosition);
  pdf.text("Jedinična cena", colPositions[1], yPosition);
  pdf.text("Količina", colPositions[2], yPosition);
  pdf.text("Ukupno", colPositions[3], yPosition);

  // Table lines
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);

  // Table rows
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");

  data.rows.forEach((row, index) => {
    // Check if we need a new page for this row
    yPosition = checkAndAddPage(pdf, yPosition, 15);

    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 9, "F");
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

    yPosition += 10;
  });

  // Add totals
  const subtotal = data.rows.reduce((sum, row) => sum + row.total, 0);
  const discountAmount = subtotal * (data.discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const vatAmount = subtotalAfterDiscount * (data.vatPercent / 100);
  const monthlyTotal = subtotalAfterDiscount + vatAmount;

  yPosition += 8;
  pdf.line(20, yPosition - 5, pageWidth - 20, yPosition - 5);

  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("Cena (zbir stavki):", 120, yPosition, { align: "right" });
  pdf.text(
    subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    168,
    yPosition,
    { align: "right" }
  );

  yPosition += 8;

  // Add discount row if discount is applied
  if (data.discountPercent > 0) {
    pdf.text(`Popust (${data.discountPercent}%):`, 120, yPosition, {
      align: "right",
    });
    pdf.text(
      `-${discountAmount.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      168,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;
    pdf.text("Ukupno nakon popusta:", 120, yPosition, { align: "right" });
    pdf.text(
      subtotalAfterDiscount.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
      168,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;
  }

  pdf.text(`PDV (${data.vatPercent}%):`, 120, yPosition, { align: "right" });
  pdf.text(
    vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    168,
    yPosition,
    { align: "right" }
  );

  yPosition += 8;
  pdf.text("Ukupna cena:", 120, yPosition, { align: "right" });
  pdf.text(
    `${monthlyTotal.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${data.currency}`,
    168,
    yPosition,
    { align: "right" }
  );

  return yPosition + 20;
};

const addCommercialConditionsBox = (
  pdf: jsPDF,
  yPosition: number,
  pageWidth: number,
  text: string
): number => {
  const boxWidth = pageWidth - 40;
  const padding = 3; // Minimal padding
  const textWidth = boxWidth - padding * 2;
  const textLines = pdf.splitTextToSize(text, textWidth);
  const boxHeight = textLines.length * 7 + 4; // Minimal bottom padding

  // Draw border
  pdf.rect(20, yPosition - 2, boxWidth, boxHeight);

  // Add text with italic font
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-BoldItalic", "bolditalic");
  pdf.text("Komercijalni uslovi:", 20 + padding, yPosition + 4);
  yPosition += 5;
  pdf.setFont("OpenSans-Italic", "italic");
  pdf.setFontSize(11);
  pdf.text(textLines, 20 + padding, yPosition + 4, { lineHeightFactor: 1.3 });

  return yPosition + boxHeight + 3;
};

const addFooter = (pdf: jsPDF, yPosition: number, pageWidth: number) => {
  // Check if notes section fits on current page
  const notesHeight = 150; // Increased for better readability
  yPosition = checkAndAddPage(pdf, yPosition, notesHeight);

  // Add notes section
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("NAPOMENE:", 20, yPosition);
  yPosition += 12;

  const notes = [
    "1.  Rok važenja ponude je 15 dana.",
    "2.  Ponuda može biti naknadno korigovana, shodno budućim pregovorima oko uslova korišćenja.",
    "3.  Nakon prihvatanja ponude, Naručioc je dužan da potpiše Ugovor o poslovno tehničkoj saradnji za korišćenje usluga eZOP servisa sa Pružaocem usluge (Bordi d.o.o.)",
    "4.  Usluga će se sprovesti u 2 faze sa predloženom dinamikom :",
    "    a. Uvod u korišćenje eZOP servisa (7 dana od datuma potpisivanja Ugovora)",
    "    b. Aktiviranje licenci i zvaničan početak rada (10 dana od datuma potpisivanja Ugovora). Troškovi mesečne licence će se naplaćivati počev od datuma potpisivanja zapisnika o isporci licenci.",
    "5.  Pružaoc usluge zadržava parvo da unapređuje, poboljšava i unapređuje funkcionalnosti eZOP servisa u skladu sa intencijama i potrebama struke. O svim eventualnim modifikacijama servisa, Poručioc je dužan da obavesti Naručioca i primeni sve neophodne tehničke mere za neometano korišćenje servisa od strane Naručioca.",
    '6.  Na osnovu člana 25. stav 2. Zakona o zaštiti od požara („Službeni glasnik RS", br. 111/09, 20/15, 87/18 i 87/18 – dr. zakon),usvojen je PRAVILNIK o bližim uslovima koje moraju ispunjavati pravna lica za obavljanje poslova organizovanja zaštite od požara u subjektima prve, druge i treće kategorije ugroženosti od požara. Shodno ovom pravilniku, Naručioc je saglasan da će svi podaci, dostupni u eZOP bazi podataka biti dostupni i na raspolaganju, prema zahtevu i potrebi nadležnih državnih organa Republike Srbije.',
    "7.  Način izjašnjavanja o uslovima ove ponude i proceduru nabavke, određuje Naručioc u daljim dogovorima sa Pružaocem usluge. Konačna ponuda će biti sastavni deo Ugovora.",
    "8.  Komercijalni uslovi ponude nisu konačni i mogu biti predmet daljih dogovora u odnosu na predočene zahteve Naručioca.",
  ];

  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");

  for (const note of notes) {
    // Extract number and text
    const match = note.match(/^(\d+\.\s*)(.*)$/);
    if (match) {
      const [, number, text] = match;

      // Draw bold number
      pdf.setFont("OpenSans-Bold", "bold");
      pdf.text(number, 25, yPosition);

      // Draw regular text with proper indentation
      const numberWidth = pdf.getTextWidth(number);
      const textLines = pdf.splitTextToSize(text, pageWidth - 40 - numberWidth);
      pdf.setFont("OpenSans-Regular", "normal");
      pdf.text(textLines, 25 + numberWidth, yPosition, {
        lineHeightFactor: 1.4,
      });
      yPosition += textLines.length * 5 + 3;
    } else {
      // For sub-items (a., b., etc.)
      const subMatch = note.match(/^(\s*)([a-z]\.\s*)(.*)$/);
      if (subMatch) {
        const [, indent, letter, text] = subMatch;
        const indentWidth = pdf.getTextWidth(indent);

        // Draw bold letter
        pdf.setFont("OpenSans-Bold", "bold");
        pdf.text(letter, 25 + indentWidth, yPosition);

        // Draw regular text
        const letterWidth = pdf.getTextWidth(letter);
        const textLines = pdf.splitTextToSize(
          text,
          pageWidth - 40 - indentWidth - letterWidth
        );
        pdf.setFont("OpenSans-Regular", "normal");
        pdf.text(textLines, 25 + indentWidth + letterWidth, yPosition, {
          lineHeightFactor: 1.3,
        });
        yPosition += textLines.length * 5 + 2;
      } else {
        // Fallback for other text
        const noteLines = pdf.splitTextToSize(note, pageWidth - 40);
        pdf.setFont("OpenSans-Regular", "normal");
        pdf.text(noteLines, 25, yPosition, { lineHeightFactor: 1.3 });
        yPosition += noteLines.length * 5 + 2;
      }
    }
  }

  // Signature
  yPosition += 12;
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("S poštovanjem,", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;
  pdf.text("Marko Malbaša,", pageWidth - 20, yPosition, { align: "right" });
  yPosition += 7;
  pdf.text("Direktor Bordi d.o.o.", pageWidth - 20, yPosition, {
    align: "right",
  });

  // Add bottom margin
  yPosition += 20;
};
