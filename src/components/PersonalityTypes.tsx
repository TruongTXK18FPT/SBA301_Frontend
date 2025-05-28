import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUserAlt, FaHeart, FaBrain, FaLightbulb, FaHandshake,
  FaChartLine, FaUsers, FaStar, FaCompass, FaShieldAlt
} from 'react-icons/fa';
import '../styles/PersonalityTypes.css';

interface PersonalityType {
  id: number;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}

const personalityTypes: PersonalityType[] = [
  {
    id: 1,
    title: "Nhà Phân Tích",
    description: "Tư duy chiến lược, logic và đổi mới",
    icon: <FaBrain />,
    color: "#2e86de"
  },
  {
    id: 2,
    title: "Người Ngoại Giao",
    description: "Thấu cảm, hợp tác và yêu thích làm việc nhóm",
    icon: <FaHandshake />,
    color: "#20bf6b"
  },
  {
    id: 3,
    title: "Người Gác Cổng",
    description: "Tỉ mỉ, thực tế và tổ chức tốt",
    icon: <FaShieldAlt />,
    color: "#ff9f43"
  },
  {
    id: 4,
    title: "Nhà Thám Hiểm",
    description: "Linh hoạt, phiêu lưu và đầy bất ngờ",
    icon: <FaCompass />,
    color: "#8854d0"
  },
  {
    id: 5,
    title: "Nhà Lãnh Đạo",
    description: "Tự tin, quyết đoán và truyền cảm hứng",
    icon: <FaChartLine />,
    color: "#eb3b5a"
  },
  {
    id: 6,
    title: "Người Hòa Giải",
    description: "Sáng tạo và tràn đầy cảm xúc",
    icon: <FaHeart />,
    color: "#fa8231"
  },
  {
    id: 7,
    title: "Người Biện Hộ",
    description: "Có lý tưởng và định hướng rõ ràng",
    icon: <FaStar />,
    color: "#4b7bec"
  },
  {
    id: 8,
    title: "Nhà Tư Duy",
    description: "Đam mê khám phá và giải quyết vấn đề",
    icon: <FaLightbulb />,
    color: "#45aaf2"
  },
  {
    id: 9,
    title: "Chỉ Huy",
    description: "Mạnh mẽ, táo bạo và kiên định",
    icon: <FaUserAlt />,
    color: "#2d98da"
  },
  {
    id: 10,
    title: "Nhà Vận Động",
    description: "Nhiệt huyết, sáng tạo và truyền cảm hứng",
    icon: <FaUsers />,
    color: "#26de81"
  }
];

const PersonalityTypes: React.FC = () => {
  return (
    <div className="personality-types">
      <h2>10 Kiểu Tính Cách</h2>
      <div className="types-grid">
        {personalityTypes.map((type) => (
          <motion.div
            key={type.id}
            className="type-card"
            whileHover={{ scale: 1.08, boxShadow: `0 10px 20px ${type.color}66` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          >
            <div className="type-icon" style={{ color: type.color }}>
              {type.icon}
            </div>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PersonalityTypes;
