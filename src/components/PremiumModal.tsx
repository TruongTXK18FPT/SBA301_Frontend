import React from "react";
import { useNavigate } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5"; // icon warning, cài react-icons nếu chưa

const modalStyles: React.CSSProperties = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(12,12,16,0.75)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const boxStyles: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  minWidth: 340,
  padding: "36px 32px 32px 32px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.16)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
};

const iconStyles: React.CSSProperties = {
  fontSize: 48,
  color: "#F59E42",
  marginBottom: 10
};

const h2Styles: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  margin: "0 0 12px 0",
  color: "#181B23",
  letterSpacing: 0.5,
};

const descStyles: React.CSSProperties = {
  color: "#282C36",
  fontSize: 16,
  lineHeight: 1.6,
  textAlign: "center",
  marginBottom: 28,
};

const btnGroup: React.CSSProperties = {
  display: "flex",
  gap: 18,
  width: "100%",
  justifyContent: "center"
};

const btnStyles: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 8,
  border: "none",
  padding: "12px 32px",
  background: "#181B23",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(24,27,35,0.10)",
  transition: "background 0.2s"
};

const btnSecondary: React.CSSProperties = {
  ...btnStyles,
  background: "#E5E7EB",
  color: "#181B23",
  border: "1px solid #D1D5DB",
};

const PremiumModal: React.FC<{
  open: boolean;
  onBuyPremium: () => void;
  onClose: () => void;
}> = ({ open, onBuyPremium, onClose }) => {
  if (!open) return null;
  return (
    <div style={modalStyles}>
      <div style={boxStyles}>
        <IoWarningOutline style={iconStyles} />
        <h2 style={h2Styles}>Bạn cần Premium</h2>
        <div style={descStyles}>
          Chỉ thành viên <b>Premium</b> mới được sử dụng <b>Chat AI</b>.<br />
          Hãy nâng cấp để trải nghiệm tính năng này ngay!
        </div>
        <div style={btnGroup}>
          <button style={btnStyles} onClick={onBuyPremium}>Mua ngay</button>
          <button style={btnSecondary} onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
