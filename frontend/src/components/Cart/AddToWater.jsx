import React from 'react'

const AddToWater = () => {
  return (
    <div>    
                        <div className="cart-overlay">
                            <div className="modern-cart-modal" >
                                <div className="modern-cart-header">
                                    <h2 className="cart-title">add some notes</h2>
                                    <div>
                                       
                                        <div> <div className="modern-cart-items">
                                                
                                                        <div className="cart-item-details">
                                                            <div className="item-meta">
                                                                <h4 className="item-name">water bottel</h4>
                                                                <span className="item-option">2</span>
                                                                <div className="item-pricing">
                                                                    <span className="item-price">₹50</span>
                                                                    <span className="item-multiply">×</span>
                                                                    <span className="item-quantity">2</span>
                                                                    <span className="item-subtotal">₹-25</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="item-actions">
                                                                <div className="quantity-controls">
                                                                    <button
                                                                        className="quantity-btn minus"
                                                                        aria-label="Decrease quantity"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <button
                                                                        className="quantity-btn plus"
                                                                        aria-label="Increase quantity"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                
                                                                <button
                                                                    className="delete-btn"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                              
                                            </div>
                                            
                                            <div className="modern-cart-summary">
                                                <div className="summary-row">
                                                    <span>Subtotal</span>
                                                </div>
                                                
                                                <div className="summary-row total">
                                                    <span>Total</span>
                                                </div>
                                            </div>
                                            
                                            <div className="modern-cart-footer">
                                                <button 
                                                    className="modern-btn primary"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    Confirm Order 
                                                </button>
                                            </div></div>
                                        
 
                              
                                   

                                    
                                    {/* <button 
                                        className="modern-close-btn"
                                        onClick={() => setShowCart(false)}
                                        aria-label="Close cart"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="modern-cart-body">
                                    {cart.length === 0 ? (
                                        <div className="empty-cart-state">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h3>Your cart feels lonely</h3>
                                            <p>Add some delicious items to get started</p>
                                            <button 
                                                className="modern-btn outline"
                                                onClick={() => setShowCart(false)}
                                            >
                                                Browse Menu
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="modern-cart-items">
                                                {cart.map((item, index) => (
                                                    <div key={`${item._id}-${item.option}-${index}`} className="modern-cart-item">
                                                        <div className="cart-item-details">
                                                            <div className="item-meta">
                                                                <h4 className="item-name">{item.name}</h4>
                                                                <span className="item-option">{item.option}</span>
                                                                <div className="item-pricing">
                                                                    <span className="item-price">₹{item.price}</span>
                                                                    <span className="item-multiply">×</span>
                                                                    <span className="item-quantity">{item.quantity}</span>
                                                                    <span className="item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="item-actions">
                                                                <div className="quantity-controls">
                                                                    <button
                                                                        onClick={() => updateQuantity(item._id, item.option, item.quantity - 1)}
                                                                        className="quantity-btn minus"
                                                                        disabled={item.quantity <= 1}
                                                                        aria-label="Decrease quantity"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="quantity-display">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item._id, item.option, item.quantity + 1)}
                                                                        className="quantity-btn plus"
                                                                        aria-label="Increase quantity"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={() => removeFromCart(item._id, item.option)}
                                                                    className="delete-btn"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="modern-cart-summary">
                                                <div className="summary-row">
                                                    <span>Subtotal</span>
                                                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                                                </div>
                                                
                                                <div className="summary-row total">
                                                    <span>Total</span>
                                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="modern-cart-footer">
                                                <button 
                                                    className="modern-btn primary"
                                                    onClick={handleCheckout}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    Confirm Order (₹{calculateTotal().toFixed(2)})
                                                </button>
                                            </div>
                                        </>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
  
)}

export default AddToWater