import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import logoEzop from "@/assets/logo-ezop.png";
import {
  Trash2,
  Plus,
  Download,
  FileText,
  Settings,
  Printer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdfGenerator";

export interface CalculatorRow {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface CalculatorData {
  currency: string;
  vatPercent: number;
  rows: CalculatorRow[];
}

const ContractCalculator = () => {
  const [currency, setCurrency] = useState("RSD");
  const [vatPercent, setVatPercent] = useState(0);
  const [rows, setRows] = useState<CalculatorRow[]>([]);
  const { toast } = useToast();

  const formatNumber = (n: number) => {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const calculateRowTotal = (unitPrice: number, quantity: number) => {
    return unitPrice * quantity;
  };

  const calculateTotals = () => {
    const subtotal = rows.reduce((sum, row) => sum + row.total, 0);
    const vatAmount = subtotal * (vatPercent / 100);
    const monthlyTotal = subtotal + vatAmount;
    return { subtotal, vatAmount, monthlyTotal };
  };

  const updateRow = (
    id: string,
    field: keyof CalculatorRow,
    value: string | number
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          if (field === "unitPrice" || field === "quantity") {
            updatedRow.total = calculateRowTotal(
              updatedRow.unitPrice,
              updatedRow.quantity
            );
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  const addRow = () => {
    const newRow: CalculatorRow = {
      id: Date.now().toString() + Math.random(),
      description: "Nova stavka",
      unitPrice: 0,
      quantity: 0,
      total: 0,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const loadExample = () => {
    const exampleRows: CalculatorRow[] = [
      {
        id: "1",
        description: "Broj WEB naloga",
        unitPrice: 1000,
        quantity: 3,
        total: 3000,
      },
      {
        id: "2",
        description: "Broj MOB naloga",
        unitPrice: 800,
        quantity: 0,
        total: 0,
      },
      {
        id: "3",
        description: "Broj objekata",
        unitPrice: 10,
        quantity: 104,
        total: 1040,
      },
      {
        id: "4",
        description: "Grupe objekata",
        unitPrice: 100,
        quantity: 10,
        total: 1000,
      },
      {
        id: "5",
        description: "PP aparati",
        unitPrice: 1.4,
        quantity: 869,
        total: 1216.6,
      },
      {
        id: "6",
        description: "Hidranti",
        unitPrice: 15,
        quantity: 80,
        total: 1200,
      },
      {
        id: "7",
        description: "Instalacije",
        unitPrice: 110,
        quantity: 104,
        total: 11440,
      },
    ];
    setRows(exampleRows);
    toast({
      title: "Primer učitan",
      description: "Primer podataka je učitan u kalkulator.",
    });
  };

  const downloadCSV = () => {
    const { subtotal, vatAmount, monthlyTotal } = calculateTotals();
    const header = ["Description", "Unit Price", "Quantity", "Total"];
    const lines = [header.join(",")];

    rows.forEach((row) => {
      const csvRow = [
        `"${row.description.replace(/"/g, '""')}"`,
        row.unitPrice,
        row.quantity,
        row.total,
      ];
      lines.push(csvRow.join(","));
    });

    lines.push(["", "", "Subtotal", subtotal].join(","));
    lines.push(["", "", `VAT ${vatPercent}%`, vatAmount].join(","));
    lines.push(["", "", "Monthly Total", monthlyTotal].join(","));

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contract_price_calculation.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV downloaded",
      description: "Your calculation has been exported to CSV.",
    });
  };

  const downloadPDF = () => {
    const data: CalculatorData = { currency, vatPercent, rows };
    generatePDF(data);
    toast({
      title: "PDF generated",
      description: "Your calculation has been exported to PDF.",
    });
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-row items-center justify-between space-x-2">
          <img className="w-24" src={logoEzop} />
          <h1 className="text-3xl font-bold text-foreground">
            Kalkulator ponude
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Podešavanje kalkulatora{" "}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSD">RSD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat">PDV (%)</Label>
                <Input
                  id="vat"
                  type="number"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(Number(e.target.value) || 0)}
                  className="w-20"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addRow} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj red
                </Button>
                <Button onClick={loadExample} variant="secondary">
                  Učitaj primer
                </Button>
                <Button
                  onClick={downloadCSV}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-table-header">
                    <th className="text-left p-4 font-medium">Entitet</th>
                    <th className="text-right p-4 font-medium">
                      Jedinična cena ({currency})
                    </th>
                    <th className="text-right p-4 font-medium">Količina</th>
                    <th className="text-right p-4 font-medium">
                      Ukupno ({currency})
                    </th>
                    <th className="w-20 p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Input
                          value={row.description}
                          onChange={(e) =>
                            updateRow(row.id, "description", e.target.value)
                          }
                          className="border-0 bg-transparent focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="any"
                          value={row.unitPrice}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "unitPrice",
                              Number(e.target.value) || 0
                            )
                          }
                          className="border-0 bg-transparent text-right focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="1"
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "quantity",
                              Number(e.target.value) || 0
                            )
                          }
                          className="border-0 bg-transparent text-right focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatNumber(row.total)}
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRow(row.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b bg-table-header">
                    <td colSpan={3} className="p-4 text-right font-semibold">
                      Ukupno
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatNumber(totals.subtotal)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="border-b bg-table-header">
                    <td colSpan={3} className="p-4 text-right font-semibold">
                      PDV {vatPercent}%
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatNumber(totals.vatAmount)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-primary/10">
                    <td colSpan={3} className="p-4 text-right font-bold">
                      Total{" "}
                    </td>
                    <td className="p-4 text-right font-bold text-primary">
                      {formatNumber(totals.monthlyTotal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Change quantities or prices to see calculations update
                instantly
              </p>
              <p>• Add or remove rows as needed for your contract</p>
              <p>
                • Export to CSV for spreadsheet analysis or PDF for professional
                documents
              </p>
              <p>• The VAT percentage applies to the entire subtotal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Multi-currency support (RSD, EUR, USD)</p>
              <p>• Automatic VAT calculation</p>
              <p>• Professional PDF export with company branding</p>
              <p>• CSV export for data analysis</p>
              <p>• Real-time calculations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractCalculator;
