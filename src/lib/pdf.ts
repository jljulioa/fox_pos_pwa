import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

export async function generateInvoicePDF(sale: any, cart: any[], subtotal: number, tax: number, total: number) {
  try {
    // Fetch invoice settings
    const { data: settingsData } = await supabase
      .from("invoice_settings")
      .select("*")
      .limit(1)
      .single();

    const companyName = settingsData?.company_name || "Company Name";
    const nit = settingsData?.nit || "NIT: 000000000-0";
    const address = settingsData?.address || "Address completely not configured";
    const footerMessage = settingsData?.footer_message || "Thank you for your purchase!";

    // Create new jsPDF instance (Letter size, portrait)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header: Company Info
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, margin, margin);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NIT: ${nit}`, margin, margin + 6);
    doc.text(address, margin, margin + 12);

    // Header: Invoice Info (Right aligned)
    const invoiceLabel = "INVOICE";
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceLabel, pageWidth - margin, margin, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${sale?.sale_ref || sale?.id?.slice(0, 8)}`, pageWidth - margin, margin + 8, { align: "right" });
    doc.text(`Date: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, pageWidth - margin, margin + 14, { align: "right" });

    // Customer Info
    const customerName = sale?.customers?.name || "Guest Customer";
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, margin + 28);
    doc.setFont("helvetica", "normal");
    doc.text(customerName, margin, margin + 34);

    // Line items table
    const tableStartY = margin + 45;

    const tableColumns = ["Qty", "Description", "Unit Price", "Total"];
    const tableRows = cart.map((item) => [
      item.quantity.toString(),
      item.name,
      `$${item.price.toLocaleString()}`,
      `$${(item.price * item.quantity).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [tableColumns],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }, // Primary color
      margin: { left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
      },
      didDrawPage: function (data) {
        // Footer (page number, footer msg)
        const currentY = doc.internal.pageSize.getHeight() - 15;
        doc.setFontSize(9);
        doc.text(footerMessage, pageWidth / 2, currentY, { align: "center", maxWidth: pageWidth - 40 });
      },
    });

    // Totals section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page for totals
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
    }
    
    const totalsLeftX = pageWidth - margin - 60;
    const totalsRightX = pageWidth - margin;

    doc.setFontSize(10);
    doc.text("Subtotal:", totalsLeftX, finalY);
    doc.text(`$${subtotal.toLocaleString()}`, totalsRightX, finalY, { align: "right" });

    doc.text("Tax:", totalsLeftX, finalY + 6);
    doc.text(`$${tax.toLocaleString()}`, totalsRightX, finalY + 6, { align: "right" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsLeftX, finalY + 16);
    doc.text(`$${total.toLocaleString()}`, totalsRightX, finalY + 16, { align: "right" });

    // Try to open in new window or download directly
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("There was an error generating the invoice PDF.");
  }
}
