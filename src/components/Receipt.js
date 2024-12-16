import React from 'react';
import '../assets/receipt-print.css';  // Import the print-specific CSS

const Receipt = ({ receiptData }) => {
  const { items, client, grandTotal, payment } = receiptData;  // Assuming 'payment' is part of the receiptData
  const tax = (grandTotal * 0.05).toFixed(2);
  const total = (parseFloat(grandTotal) + parseFloat(tax)).toFixed(2);
  const change = (parseFloat(payment) - parseFloat(total)).toFixed(2);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="receipt-print.css">'); // Link the CSS file
    printWindow.document.write('</head><body>');
    printWindow.document.write(document.querySelector('.receipt').innerHTML); // Only the receipt content
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print(); // Trigger the print dialog
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="receipt">
          <div className="receipt-header">
            <p><strong>Store Name:</strong> SouthPaws</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Client:</strong> {client}</p>
          </div>
          <div className="receipt-body">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₱{item.price}</td>
                    <td>₱{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="receipt-footer">
            <p><strong>Subtotal:</strong> ₱{grandTotal}</p>
            <p><strong>Tax (5%):</strong> ₱{tax}</p>
            <p><strong>Total:</strong> ₱{total}</p>
            <p><strong>Payment:</strong> ₱{payment}</p>
            <p><strong>Change:</strong> ₱{change}</p>
          </div>
          <div className="receipt-print-button">
            <button onClick={handlePrint}>Print</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
