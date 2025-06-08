// PrintPOSBill.js
import React from "react";
import { useReactToPrint } from "react-to-print";

const PrintPOSBill = React.forwardRef(({ tableOrders, tableNo }, ref) => {
  const calculateTotal = () => {
    return tableOrders.reduce(
      (total, order) => total + order.price * order.quantity,
      0
    );
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div ref={ref} style={{ 
      width: '80mm', // Standard width for 2-inch POS printer
      padding: '5px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <h3 style={{ margin: '3px 0', fontWeight: 'bold' }}>Baba Neeb Karori</h3>
        <p style={{ margin: '2px 0', fontSize: '10px' }}>Mehra Gaon, Bhimtal, Uttarakhand</p>
      </div>
      
      <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
      
      <div style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Time:</span>
          <span>{timeStr}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Table:</span>
          <span>{tableNo}</span>
        </div>
      </div>
      
      <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
      
      <div style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span style={{ width: '40%' }}>Item</span>
          <span style={{ width: '20%', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '40%', textAlign: 'right' }}>Amount</span>
        </div>
        
        {tableOrders.map((order, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            margin: '3px 0'
          }}>
            <span style={{ width: '40%' }}>{order.itemName.substring(0, 15)}{order.itemName.length > 15 ? '...' : ''}</span>
            <span style={{ width: '20%', textAlign: 'center' }}>{order.quantity}</span>
            <span style={{ width: '40%', textAlign: 'right' }}>₹{(order.price * order.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
      
      <div style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sub Total:</span>
          <span>₹{calculateTotal().toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Grand Total:</span>
          <span>₹{calculateTotal().toFixed(2)}</span>
        </div>
      </div>
      
      <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
      
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
        <p>Thank you for dining with us!</p>
        <p>Contact: +91 9411336893</p>
      </div>
    </div>
  );
});

export default PrintPOSBill;