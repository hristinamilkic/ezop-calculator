import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calculator, DollarSign, Download } from 'lucide-react';

const DemoContent = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Professional Contract Calculator Demo</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          This powerful calculator helps businesses create professional contract pricing with automatic VAT calculations, 
          multi-currency support, and professional PDF exports with company branding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Smart Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Automatically calculates totals, VAT, and final amounts in real-time as you input data.</p>
            <p>Supports multiple currencies: RSD, EUR, and USD for international contracts.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Professional PDFs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Generate branded PDF documents with company logo, contact information, and terms.</p>
            <p>Perfect for client presentations and official documentation.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              VAT Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Flexible VAT percentage settings for different regions and business requirements.</p>
            <p>Clearly separated subtotal, VAT amount, and final total calculations.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Export calculations as CSV files for spreadsheet analysis and record-keeping.</p>
            <p>PDF export includes complete branding and professional formatting.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Set Your Currency and VAT</h4>
              <p className="text-muted-foreground">Choose your preferred currency (RSD, EUR, or USD) and set the applicable VAT percentage for your region.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Add Items and Pricing</h4>
              <p className="text-muted-foreground">Use the "Add Row" button to include services or products. Enter descriptions, unit prices, and quantities.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Review Calculations</h4>
              <p className="text-muted-foreground">Watch as totals update automatically. Review subtotals, VAT amounts, and final calculations.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Export Your Results</h4>
              <p className="text-muted-foreground">Generate professional PDFs with company branding or export to CSV for further analysis.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Service Contracts</h4>
              <p className="text-muted-foreground">Calculate pricing for consulting, maintenance, or professional services with hourly rates and project scopes.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Product Sales</h4>
              <p className="text-muted-foreground">Price product bundles, equipment sales, or inventory items with quantity-based calculations.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Project Estimates</h4>
              <p className="text-muted-foreground">Create detailed project breakdowns with different work categories and resource allocations.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">International Quotes</h4>
              <p className="text-muted-foreground">Handle multi-currency pricing for international clients with proper VAT calculations.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Real-time Updates</h4>
              <p className="text-muted-foreground">All calculations update instantly as you type, providing immediate feedback on pricing changes.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Persistence</h4>
              <p className="text-muted-foreground">Your calculations remain active during your session, allowing for iterative adjustments and refinements.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Professional Output</h4>
              <p className="text-muted-foreground">Generated PDFs include company branding, terms and conditions, and professional formatting suitable for client delivery.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoContent;