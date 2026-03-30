import React from 'react';

const STATUS_CONFIG = {
  New:       { color: '#0288d1', bg: '#e1f5fe', label: 'ใหม่' },
  Contacted: { color: '#f57c00', bg: '#fff3e0', label: 'ติดต่อแล้ว' },
  Quotation: { color: '#7b1fa2', bg: '#f3e5f5', label: 'เสนอราคา' },
  Won:       { color: '#2e7d32', bg: '#e8f5e9', label: 'สำเร็จ' },
  Lost:      { color: '#c62828', bg: '#fdecea', label: 'เสียลูกค้า' },
};

const PRODUCT_CONFIG = {
  Solar:   { color: '#f57c00', bg: '#fff3e0', icon: '☀️' },
  EV:      { color: '#0288d1', bg: '#e1f5fe', icon: '🚗' },
  Battery: { color: '#7b1fa2', bg: '#f3e5f5', icon: '🔋' },
  Other:   { color: '#546e7a', bg: '#eceff1', icon: '📦' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: '#555', bg: '#eee', label: status };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

export function ProductBadge({ product }) {
  const cfg = PRODUCT_CONFIG[product] || PRODUCT_CONFIG.Other;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      {cfg.icon} {product}
    </span>
  );
}

export const STATUS_LIST = ['New', 'Contacted', 'Quotation', 'Won', 'Lost'];
export const PRODUCT_LIST = ['Solar', 'EV', 'Battery', 'Other'];
export { STATUS_CONFIG };
