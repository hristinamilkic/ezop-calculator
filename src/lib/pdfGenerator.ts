import jsPDF from "jspdf";
import type { CalculatorData } from "@/components/ContractCalculator";
import companyLogo from "@/assets/logo-bordi.png";
import "../fonts/OpenSans-Regular-normal.js";
import "../fonts/OpenSans-Bold-bold.js";
import "../fonts/OpenSans-Italic-italic.js";
import "../fonts/OpenSans-BoldItalic-bolditalic.js";

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
  const currentDate = new Date().toLocaleDateString();
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
    return 10; // Start new page from top with minimal margin
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
  const prefixWidth = pdf.getStringUnitWidth(subjectPrefix) * 11;

  // Part 2: Rest of the first line in bold font
  const subjectPart1 =
    "Ponuda za implermentaciju digitalnog servisa iz oblasti zaštite";
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text(subjectPart1, 0 + prefixWidth, yPosition);

  yPosition += 5;

  // Part 3: Second line in bold font
  const subjectPart2 = "od požara - eZOP na ugovornu obavezu od godinu dana.";
  pdf.text(subjectPart2, 20, yPosition);
  yPosition += 12;

  pdf.text("Predmet: INFORMATIVNA PONUDA", 20, yPosition);
  yPosition += 13;

  // Greeting
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("Poštovani,", 20, yPosition);
  yPosition += 12;

  const introText =
    "Na osnovu prezentacije sofverskog rešenja za, servisa za elektronsku evidenciju zaštite od požara, eZOP, dostavljamo Vam informativnu ponudu sa uslovima za korišćenja usluga eZOP servisa, pod sledećim uslovima :";
  const introLines = pdf.splitTextToSize(introText, pageWidth - 40);
  pdf.text(introLines, 20, yPosition);
  yPosition += introLines.length * 7 + 10;

  // Section 1
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("1. Uvod u korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 10;

  const section1a =
    "a. Za korišćenje mobilne i administratorske WEB platforme. Obuka podrazumeva teoretska pojašnjenja svih funkcionalnosti eZOP servisa na WEB i mobilnoj platformi. Obuka će se održati u prostorijama naručioca ili u prostorijama Bordi D.O.O u vremenskom trajanju od 4 časa.";
  const section1aLines = pdf.splitTextToSize(section1a, pageWidth - 60);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1aLines, 35, yPosition);
  yPosition += section1aLines.length * 7 + 1;

  const section1b =
    "b. Inicijalno kreiranje baze podataka uređaja, opreme i instalacija. Obilazak svih poslovnica i unos podataka za svaki pojedinačni uređaj, hidrant, opremu i instalaciju. Ponudom je obuhvaćena bar-kod identifikacijona nalepnica za sve uređaje korisnika.";
  const section1bLines = pdf.splitTextToSize(section1b, pageWidth - 60);
  pdf.text(section1bLines, 35, yPosition);
  yPosition += section1bLines.length * 7 + 3;

  const section1c =
    "c. Kreiranje korisničkih naloga podrzumeva pomoć kod unos i profilisanje korisničkih naloga.";
  const section1cLines = pdf.splitTextToSize(section1c, pageWidth - 60);
  pdf.text(section1cLines, 35, yPosition);
  yPosition += section1cLines.length * 7 + 3;

  const section1d =
    "d. Podešavanje funkcionalnosti i preferenci profila podrazumeva podešavanje i predefinisanje nivoa pristupa korisnika, kao i profilisanje eZOP servisa u odnosu na profil organizacije.";
  const section1dLines = pdf.splitTextToSize(section1d, pageWidth - 60);
  pdf.text(section1dLines, 35, yPosition);
  yPosition += section1dLines.length * 7 + 5;

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
  pdf.text("2. Korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 10;

  const section2a = "a. Licenca za korišćenje administratorskih WEB naloga.";
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section2a, 35, yPosition);
  yPosition += 6;

  const section2b =
    "b. Licenca za korišćenje naloga za pristup mobilnoj aplikaciji.";
  pdf.text(section2b, 35, yPosition);
  yPosition += 6;

  const section2c =
    "c. Tehnička podrška – otvorena linija angažovanja 24/7 sa brzinom odziva u roku od 48 sati.";
  pdf.text(section2c, 35, yPosition);
  yPosition += 12;

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
  const subjectPrefix = "PREDMET : ";
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(subjectPrefix, 20, yPosition);

  // Calculate width of the prefix
  const prefixWidth = pdf.getStringUnitWidth(subjectPrefix) * 11;

  // Part 2: Rest of the first line in bold font
  const subjectPart1 =
    "Ponuda za implermentaciju digitalnog servisa iz oblasti zaštite";
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text(subjectPart1, 20 + prefixWidth, yPosition);

  yPosition += 10;

  // Part 3: Second line in bold font
  const subjectPart2 = "od požara - eZOP";
  pdf.text(subjectPart2, 20, yPosition);
  yPosition += 18;

  // Greeting
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text("Poštovani,", 20, yPosition);
  yPosition += 10;

  const introText =
    'Na osnovu dostavljenih podataka i prethodne prezentacije usluga "eZOP", servisa za elektronsku evidenciju protivpožarne opreme, instalacija i uređaja , dostavljamo Vam informativnu ponudu sa uslovima za korišćenja usluga eZOP servisa, pod sledećim uslovima :';
  const introLines = pdf.splitTextToSize(introText, pageWidth - 40);
  pdf.text(introLines, 20, yPosition);
  yPosition += introLines.length * 7 + 10;

  // Section 1
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("1. Uvod u korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 10;

  const section1a =
    "a. Obuka zaposlenih za korišćenje mobilne i administratorske WEB platforme. Obuka podrazumeva teoretska pojašnjenja svih finkcionalnosti eZOP servisa na WEB i mobilnoj platformi na lokaciji korisnika.";
  const section1aLines = pdf.splitTextToSize(section1a, pageWidth - 60);
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section1aLines, 35, yPosition);
  yPosition += section1aLines.length * 7 + 1;

  const section1b =
    "b. Kreiranje korisničkih naloga podrzumeva pomoć kod unos i profilisanje korisničkih naloga.";
  const section1bLines = pdf.splitTextToSize(section1b, pageWidth - 60);
  pdf.text(section1bLines, 35, yPosition);
  yPosition += section1bLines.length * 7 + 3;

  const section1c =
    "c. Podešavanje funkcionalnosti i preferenci profila podrazumeva podešavanje i predefinisanje nivoa pristupa korisnika, kao i profilisanje eZOP servisa u odnosu na profil organizacije";
  const section1cLines = pdf.splitTextToSize(section1c, pageWidth - 60);
  pdf.text(section1cLines, 35, yPosition);
  yPosition += section1cLines.length * 7 + 3;

  const section1d =
    "d. Isporuka bar kod identifikacionih nalepnica (jedna rolna nalepnica) – 4000 komada silver pet visoko adhezivnih nalepnica u rolni, sa trajnim otiskom termalne štampe bar kod identifikacije.";
  const section1dLines = pdf.splitTextToSize(section1d, pageWidth - 60);
  pdf.text(section1dLines, 35, yPosition);
  yPosition += section1dLines.length * 7 + 5;

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
  pdf.text("2. Korišćenje eZOP servisa :", 30, yPosition);
  yPosition += 10;

  const section2a = "a. Licenca - za korišćenje administratorskih WEB naloga.";
  pdf.setFont("OpenSans-Regular", "normal");
  pdf.text(section2a, 35, yPosition);
  yPosition += 6;

  const section2b =
    "b. Licenca - za korišćenje naloga za pristup mobilnoj aplikaciji.";
  pdf.text(section2b, 35, yPosition);
  yPosition += 6;

  const section2c =
    "c. Tehnička podrška - otvorena linija angažovanja 24/7 sa brzinom odziva u roku od 48 sati.";
  pdf.text(section2c, 35, yPosition);
  yPosition += 6;

  const section2d =
    "d. Baza podataka – Do 5.000 uređaja (PP aparata, hidranata I instalacija) u sistemu po ceni navedenoj 7.000 RSD + PDV. Nakon prekoračenja 5.000 uređaja, cena se računa kumolativno.";
  const section2dLines = pdf.splitTextToSize(section2d, pageWidth - 60);
  pdf.text(section2dLines, 35, yPosition);
  yPosition += section2dLines.length * 7 + 1;

  const section2e =
    "e. Kumolativna računica - 1.40 RSD + PDV po PP aparatu, 15 RSD + PDV po Hidrantu i 110 RSD + PDV po instalaciji.";
  pdf.text(section2e, 35, yPosition);
  yPosition += 10;

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
  const vatAmount = subtotal * (data.vatPercent / 100);
  const monthlyTotal = subtotal + vatAmount;

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
  pdf.text("Komercijalni uslovi :", 20 + padding, yPosition + 1);
  yPosition += 1;
  pdf.setFont("OpenSans-Italic", "italic");
  pdf.setFontSize(11);
  pdf.text(textLines, 20 + padding, yPosition + 4);

  return yPosition + boxHeight + 3;
};

const addFooter = (pdf: jsPDF, yPosition: number, pageWidth: number) => {
  // Check if notes section fits on current page
  const notesHeight = 150; // Increased for better readability
  yPosition = checkAndAddPage(pdf, yPosition, notesHeight);

  // Add notes section
  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Bold", "bold");
  pdf.text("NAPOMENE :", 20, yPosition);
  yPosition += 12;

  const notes = [
    "1. Rok važenja ponude je 15 dana.",
    "2. Ponuda može biti naknadno korigovana, shodno budućim pregovorima oko uslova korišćenja.",
    "3. Nakon prihvatanja ponude, Naručioc je dužan da potpiše Ugovor o poslovno tehničkoj saradnji za korišćenje usluga eZOP servisa sa Pružaocem usluge (Bordi d.o.o.)",
    "4.  Usluga će se sprovesti u 2 faze sa predloženom dinamikom :",
    "    a. Uvod u korišćenje eZOP servisa (7 dana od datuma potpisivanja Ugovora)",
    "    b. Aktiviranje licenci i zvaničan početak rada (10 dana od datuma potpisivanja Ugovora). Troškovi mesečne licence će se naplaćivati počev od datuma potpisivanja zapisnika o isporci licenci.",
    "5.  Pružaoc usluge zadržava parvo da unapređuje, poboljšava i unapređuje funkcionalnosti eZOP servisa u skladu sa intencijama i potrebama struke. O svim eventualnim modifikacijama servisa, Poručioc je dužan da obavesti Naručioca i primeni sve neophodne tehničke mere za neometano korišćenje servisa od strane Naručioca.",
    '6. Na osnovu člana 25. stav 2. Zakona o zaštiti od požara („Službeni glasnik RS", br. 111/09, 20/15, 87/18 i 87/18 – dr. zakon),usvojen je PRAVILNIK o bližim uslovima koje moraju ispunjavati pravna lica za obavljanje poslova organizovanja zaštite od požara u subjektima prve, druge i treće kategorije ugroženosti od požara. Shodno ovom pravilniku, Naručioc je saglasan da će svi podaci, dostupni u eZOP bazi podataka biti dostupni i na raspolaganju, prema zahtevu i potrebi nadležnih državnih organa Republike Srbije.',
    "7. Način izjašnjavanja o uslovima ove ponude i proceduru nabavke, određuje Naručioc u daljim dogovorima sa Pružaocem usluge. Konačna ponuda će biti sastavni deo Ugovora.",
    "8. Komercijalni uslovi ponude nisu konačni i mogu biti predmet daljih dogovora u odnosu na predočene zahteve Naručioca.",
  ];

  pdf.setFontSize(11);
  pdf.setFont("OpenSans-Regular", "normal");

  for (const note of notes) {
    const noteLines = pdf.splitTextToSize(note, pageWidth - 40);
    pdf.text(noteLines, 25, yPosition);
    yPosition += noteLines.length * 5 + 2;
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
