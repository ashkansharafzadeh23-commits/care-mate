import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillingTransaction, PaymentMethod, Booking } from '../types';

/**
 * Booking & Payments Service
 * Encapsulates booking requests, visits, billing records, payment methods, and PDF generation.
 */

export const INITIAL_TRANSACTIONS: BillingTransaction[] = [
  {
    id: 1,
    date: 'Sep 05, 2026',
    amount: 150,
    status: 'paid',
    provider: 'Sarah Jenkins',
    recipientId: 'p1',
    serviceDescription: '4 hrs - Mobility assistance & medication reminders'
  },
  {
    id: 2,
    date: 'Aug 28, 2026',
    amount: 120,
    status: 'paid',
    provider: 'Michael Chen',
    recipientId: 'p1',
    serviceDescription: '3 hrs - Physical therapy and mobility support'
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true
  }
];

class BookingService {
  private transactions: BillingTransaction[] = [...INITIAL_TRANSACTIONS];
  private paymentMethods: PaymentMethod[] = [...INITIAL_PAYMENT_METHODS];

  public async getBillingHistory(recipientId?: string): Promise<BillingTransaction[]> {
    if (recipientId) {
      return this.transactions.filter(t => !t.recipientId || t.recipientId === recipientId);
    }
    return [...this.transactions];
  }

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [...this.paymentMethods];
  }

  public async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const created: Booking = {
      ...booking,
      id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    // Append simulated transaction
    this.transactions.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: booking.totalAmount,
      status: 'pending',
      provider: booking.providerName,
      recipientId: booking.recipientId,
      serviceDescription: `${booking.hours} hrs session (${booking.timeSlot})`
    });
    return created;
  }

  /**
   * Generates a cleanly styled PDF billing summary for personal records
   */
  public generateBillingSummaryPDF(transactions: BillingTransaction[], recipientName: string = 'Care Recipient'): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // text-900
    doc.text('CareMate - Care & Billing Summary', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // text-500
    doc.text(`Care Recipient: ${recipientName}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Table data
    const tableBody = transactions.map(t => [
      t.date,
      t.provider,
      `$${t.amount}`,
      t.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['Date', 'Provider / Caregiver', 'Amount', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [13, 148, 136], // primary-600
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      }
    });

    doc.save(`caremate-billing-${recipientName.toLowerCase()}-${Date.now()}.pdf`);
  }
}

export const bookingService = new BookingService();
