import jsPDF from 'jspdf';
// Dữ liệu font Arimo (Regular) hỗ trợ tiếng Việt, được mã hóa Base64
import { arimoRegular } from './font'; // Giả sử bạn tạo file font.ts

export interface QuizResult {
  id: number;
  personalityCode: string;
  nickname?: string;
  keyTraits?: string;
  description: string;
  careerRecommendations?: string;
  universityRecommendations?: string;
  scores?: Record<string, number>;
  submittedAt: string;
  quizType: string;
}

export interface UserQuizResults {
  userId: string;
  email: string;
  fullName: string;
  results: QuizResult[];
}

class PDFService {
  
  // Đăng ký font tùy chỉnh với jsPDF
  private registerVietnameseFont(doc: jsPDF): void {
    // Thêm file font vào hệ thống file ảo (VFS) của jsPDF
    doc.addFileToVFS('Arimo-Regular.ttf', arimoRegular);
    // Thêm font vào tài liệu
    doc.addFont('Arimo-Regular.ttf', 'Arimo', 'normal');
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  private addMultilineText(
    doc: jsPDF, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number = 8
  ): number {
    const lines = doc.splitTextToSize(text, maxWidth);
    
    for (let line of lines) {
      if (y > doc.internal.pageSize.height - 40) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, x, y);
      y += lineHeight;
    }
    return y;
  }

  private addSection(
    doc: jsPDF,
    title: string,
    content: string,
    x: number,
    y: number,
    maxWidth: number,
    titleFontSize: number = 14,
    contentFontSize: number = 11,
    titleColor: [number, number, number] = [41, 128, 185],
    contentColor: [number, number, number] = [52, 73, 94]
  ): number {
    if (y > doc.internal.pageSize.height - 70) {
      doc.addPage();
      y = 30;
    }

    y += 5;

    doc.setFillColor(245, 246, 250);
    doc.rect(x - 5, y - 5, maxWidth + 10, 12, 'F');
    
    doc.setFontSize(titleFontSize);
    doc.setFont('Arimo', 'normal', 'bold'); // Sử dụng font Arimo
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    y = this.addMultilineText(doc, title, x, y + 3, maxWidth, 9);
    y += 8;

    doc.setFont('Arimo', 'normal'); // Sử dụng font Arimo
    doc.setFontSize(contentFontSize);
    doc.setTextColor(contentColor[0], contentColor[1], contentColor[2]);
    y = this.addMultilineText(doc, content, x + 3, y, maxWidth - 6, 7);
    y += 12;

    return y;
  }

  private addInfoRow(
    doc: jsPDF,
    label: string,
    value: string,
    x: number,
    y: number,
    maxWidth: number
  ): number {
    doc.setFont('Arimo', 'normal', 'bold'); // Sử dụng font Arimo
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(label, x, y);
    
    doc.setFont('Arimo', 'normal'); // Sử dụng font Arimo
    doc.setTextColor(85, 85, 85);
    y = this.addMultilineText(doc, value, x + 50, y, maxWidth - 50, 6);
    
    return y + 3;
  }

  private addHeaderWithLine(
    doc: jsPDF,
    title: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 16,
    color: [number, number, number] = [31, 81, 255]
  ): number {
    doc.setFontSize(fontSize);
    doc.setFont('Arimo', 'normal', 'bold'); // Sử dụng font Arimo
    doc.setTextColor(color[0], color[1], color[2]);
    y = this.addMultilineText(doc, title, x, y, maxWidth, 10);
    
    doc.setLineWidth(1);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(x, y + 2, x + maxWidth, y + 2);
    
    return y + 12;
  }

  public async downloadQuizResultPDF(userResults: UserQuizResults, result: QuizResult) {
    try {
      const doc = new jsPDF();
      this.registerVietnameseFont(doc); // Đăng ký font
      doc.setFont('Arimo'); // Đặt font mặc định
      
      const margin = 25;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margin * 2;
      let y = 30;

      doc.setFontSize(24);
      doc.setFont('Arimo', 'normal', 'bold'); // Sử dụng font Arimo
      doc.setTextColor(31, 81, 255);
      doc.text('Report Personality Quiz Result', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      doc.setFontSize(12);
      doc.setFont('Arimo', 'normal'); // Sử dụng font Arimo
      doc.setTextColor(127, 140, 141);
      doc.text('Phân tích tính cách và khuyến nghị nghề nghiệp', pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      doc.setLineWidth(2);
      doc.setDrawColor(31, 81, 255);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      y = this.addHeaderWithLine(doc, 'Thông tin', margin, y, contentWidth, 16, [46, 125, 50]);
      
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, contentWidth, 50, 'F');
      
      y += 10;
      y = this.addInfoRow(doc, 'Ngày làm bài:', this.formatDate(result.submittedAt), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'QuizType:', result.quizType, margin + 10, y, contentWidth - 20);
      y += 15;

      y = this.addHeaderWithLine(doc, 'Result', margin, y, contentWidth, 16, [220, 53, 69]);

      doc.setFillColor(255, 235, 59);
      doc.rect(margin, y, contentWidth, 20, 'F');
      doc.setFontSize(18);
      doc.setFont('Arimo', 'normal', 'bold'); // Sử dụng font Arimo
      doc.setTextColor(183, 28, 28);
      doc.text(`Mã tính cách: ${result.personalityCode || "Không xác định"}`, margin + 10, y + 13);
      y += 30;


      if (result.nickname) {
        y = this.addSection(doc, 'Nick name', result.nickname, margin, y, contentWidth, 14, 12, [46, 204, 113], [44, 62, 80]);
      }
      if (result.keyTraits) {
        y = this.addSection(doc, 'Key traits ', result.keyTraits, margin, y, contentWidth, 14, 12, [155, 89, 182], [44, 62, 80]);
      }
      if (result.description) {
        y = this.addSection(doc, 'Description', result.description, margin, y, contentWidth, 14, 12, [52, 152, 219], [44, 62, 80]);
      }
      if (result.careerRecommendations) {
        y = this.addSection(doc, 'Career Recommendations', result.careerRecommendations, margin, y, contentWidth, 14, 12, [46, 204, 113], [44, 62, 80]);
      }
      if (result.universityRecommendations) {
        y = this.addSection(doc, 'University Recommendations', result.universityRecommendations, margin, y, contentWidth, 14, 12, [155, 89, 182], [44, 62, 80]);
      }

      if (result.scores && Object.keys(result.scores).length > 0) {
        if (y > pageHeight - 100) {
          doc.addPage();
          y = 30;
        }

        y = this.addHeaderWithLine(doc, 'Score', margin, y, contentWidth, 14, [231, 76, 60]);

        doc.setFillColor(252, 252, 252);
        const scoresHeight = Object.keys(result.scores).length * 10 + 10;
        doc.rect(margin, y, contentWidth, scoresHeight, 'F');
        
        y += 8;
        doc.setFont('Arimo', 'normal','bold'); // <-- Thay đổi
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        
        for (const [category, score] of Object.entries(result.scores)) {
          doc.setFont('Arimo', 'bold'); // <-- Thay đổi
          doc.text(category, margin + 10, y);
          doc.setFont('Arimo', 'normal'); // <-- Thay đổi
          doc.text(`: ${score}`, margin + 100, y);
          y += 8;
        }
        y += 10;
      }

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setFillColor(245, 246, 250);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text('Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách', pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text(`Ngày tạo: ${this.formatDate(new Date().toISOString())}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(`Trang ${i}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

const fullNameSafe = (userResults.fullName || userResults.email || "nguoi-dung").toString();
const sanitizedName = fullNameSafe.normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9\s]/g, '')
  .replace(/\s+/g, '-')
  .toLowerCase();
const filename = `ket-qua-trac-nghiem-${sanitizedName}-${result.id}.pdf`;
      
      doc.save(filename);
      
    } catch (err) {
      console.error('PDF Generation Error:', err);
      throw new Error('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  }

  public async downloadAllQuizResultsPDF(userResults: UserQuizResults) {
    try {
      const doc = new jsPDF();
      // Không cần đăng ký font tùy chỉnh nữa
      doc.setFont('Arimo','normal','bold'); // <-- Đặt font mặc định
      
      const margin = 25;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margin * 2;
      let y = 30;

      doc.setFontSize(24);
      doc.setFont('Arimo','normal','bold'); // <-- Thay đổi
      doc.setTextColor(31, 81, 255);
      doc.text('Summary Report', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      doc.setFontSize(16);
      doc.setFont('Arimo', 'normal','bold'); // <-- Thay đổi
      doc.setTextColor(127, 140, 141);
      doc.text('Trắc nghiệm tính cách và phát triển nghề nghiệp', pageWidth / 2, y, { align: 'center' });
      y += 20;

      y = this.addHeaderWithLine(doc, 'Thông tin', margin, y, contentWidth, 16, [46, 125, 50]);
      
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, contentWidth, 45, 'F');
      
      y += 10;
      y = this.addInfoRow(doc, 'Email:', userResults.email, margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Number of quiz:', `${userResults.results.length} bài trắc nghiệm`, margin + 10, y, contentWidth - 20);
      y += 20;

      y = this.addHeaderWithLine(doc, 'Result', margin, y, contentWidth, 16, [220, 53, 69]);
      
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y, contentWidth, 80, 'F');
      y += 10;

      const quizTypes = [...new Set(userResults.results.map(r => r.quizType))];
      const personalityCodes = [...new Set(userResults.results.map(r => r.personalityCode))];
      
      y = this.addInfoRow(doc, 'Quiz types:', quizTypes.join(', '), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Mã tính cách:', personalityCodes.join(', '), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Date-Time:', `${this.formatDate(userResults.results[userResults.results.length - 1].submittedAt)} - ${this.formatDate(userResults.results[0].submittedAt)}`, margin + 10, y, contentWidth - 20);
      y += 25;

      for (let i = 0; i < userResults.results.length; i++) {
        const result = userResults.results[i];
        
        if (y > pageHeight - 120) {
          doc.addPage();
          y = 30;
        }

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 220, 220);
        doc.rect(margin, y, contentWidth, 60, 'FD');
        
        y += 10;

        doc.setFontSize(14);
        doc.setFont('Arimo','normal','bold'); // <-- Thay đổi
        doc.setTextColor(31, 81, 255);
        doc.text(`${i + 1}. ${result.quizType}`, margin + 10, y);
        y += 10;

        doc.setFont('Arimo','normal','bold'); // <-- Thay đổi
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85);
        
        doc.text(`Ngày: ${this.formatDate(result.submittedAt)}`, margin + 10, y);
        doc.text(`Mã: ${result.personalityCode}`, margin + 10, y + 8);
        
        if (result.nickname) {
          doc.text(`Nickname: ${result.nickname}`, margin + contentWidth/2, y);
        }
        
        y += 25;

        doc.setLineWidth(0.5);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
      }

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setFillColor(245, 246, 250);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text('Báo cáo tổng hợp được tạo tự động bởi hệ thống trắc nghiệm tính cách', pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text(`Ngày tạo: ${this.formatDate(new Date().toISOString())}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(`Trang ${i}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

      const sanitizedName = userResults.fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      const filename = `bao-cao-tong-hop-${sanitizedName}.pdf`;
      
      doc.save(filename);
      
    } catch (err) {
      console.error('PDF Generation Error:', err);
      throw new Error('Không thể tạo file PDF tổng hợp. Vui lòng thử lại.');
    }
  }
}

export default new PDFService();