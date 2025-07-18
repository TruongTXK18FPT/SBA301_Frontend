// src/components/PremiumGuard.tsx
import React from "react";
import { useAtomValue } from "jotai";
import { subscriptionAtom } from "../atom/atom";
import { useNavigate } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5"; // Nếu chưa có: npm i react-icons

// Modal Premium đẹp
const PremiumModal: React.FC<{
  open: boolean;
  onBuyPremium: () => void;
  onClose: () => void;
}> = ({ open, onBuyPremium, onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(13,17,23,0.86)",
      zIndex: 10001,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        minWidth: 360,
        maxWidth: 420,
        padding: "38px 28px 32px 28px",
        boxShadow: "0 8px 32px rgba(24,27,35,0.16)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        textAlign: "center",
      }}>
        <IoWarningOutline style={{
          fontSize: 48,
          color: "#EAB308",
          marginBottom: 10,
        }} />
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 10px 0",
          color: "#181B23",
          letterSpacing: 0.5,
        }}>Bạn cần Premium</h2>
        <div style={{
          color: "#23272f",
          fontSize: 15.5,
          lineHeight: 1.65,
          marginBottom: 30,
        }}>
          Chỉ thành viên <b>Premium</b> mới được sử dụng <b>Chat AI</b>.<br />
          Hãy nâng cấp để trải nghiệm tính năng này!
        </div>
        <div style={{
          display: "flex",
          gap: 14,
          width: "100%",
          justifyContent: "center"
        }}>
          <button style={{
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 10,
            border: "none",
            padding: "11px 32px",
            background: "#181B23",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(24,27,35,0.10)",
            transition: "background 0.2s",
            outline: "none"
          }} onClick={onBuyPremium}>
            Mua ngay
          </button>
          <button style={{
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 10,
            border: "none",
            padding: "11px 32px",
            background: "#F3F4F6",
            color: "#22272c",
            cursor: "pointer",
            outline: "none"
          }} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

interface PremiumGuardProps {
  children: React.ReactNode;
}

const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  const subscriptions = useAtomValue(subscriptionAtom);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const isActive = subscriptions && subscriptions.length > 0;
    if (!isActive) {
      setModalOpen(true);
    }
  }, [subscriptions]);

  // Khi chưa active thì chỉ render modal, không render children
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <PremiumModal
        open={modalOpen}
        onBuyPremium={() => {
          setModalOpen(false);
          navigate("/premium");
        }}
        onClose={() => {
          setModalOpen(false);
          navigate(-1); // Quay lại trang trước, hoặc navigate("/")
        }}
      />
    );
  }
  return <>{children}</>;
};

export default PremiumGuard;
