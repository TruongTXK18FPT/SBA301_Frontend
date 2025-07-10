import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  private splitText(text: string, maxLength: number): string[] {
    if (!text) return [];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private addMultilineText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number {
    const lines = this.splitText(text, Math.floor(maxWidth / 2.5)); // Rough character estimation
    let currentY = y;

    for (const line of lines) {
      doc.text(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  public async downloadQuizResultPDF(userResults: UserQuizResults, result: QuizResult): Promise<void> {
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up Vietnamese font (basic Latin characters)
      doc.setFont('helvetica');
      
      // Page margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - 2 * margin;
      
      let currentY = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dark blue
      doc.text('BÁO CÁO KẾT QUẢ TRẮC NGHIỆM', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(52, 152, 219); // Blue
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Student Information
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text('THÔNG TIN HỌC SINH', margin, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80); // Dark
      doc.text(`Họ và tên: ${userResults.fullName}`, margin, currentY);
      currentY += 6;
      doc.text(`Email: ${userResults.email}`, margin, currentY);
      currentY += 6;
      doc.text(`Ngày làm bài: ${this.formatDate(result.submittedAt)}`, margin, currentY);
      currentY += 6;
      doc.text(`Loại trắc nghiệm: ${result.quizType}`, margin, currentY);
      currentY += 15;

      // Quiz Results
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text('KẾT QUẢ TRẮC NGHIỆM', margin, currentY);
      currentY += 8;

      // Personality Code
      if (result.personalityCode) {
        doc.setFontSize(12);
        doc.setTextColor(230, 126, 34); // Orange
        doc.text(`Mã tính cách: ${result.personalityCode}`, margin, currentY);
        currentY += 8;
      }

      // Nickname
      if (result.nickname) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text(`Biệt danh: ${result.nickname}`, margin, currentY);
        currentY += 6;
      }

      // Key Traits
      if (result.keyTraits) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text('Đặc điểm nổi bật:', margin, currentY);
        currentY += 6;
        currentY = this.addMultilineText(doc, result.keyTraits, margin + 5, currentY, contentWidth - 5);
        currentY += 5;
      }

      // Description
      if (result.description) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text('Mô tả chi tiết:', margin, currentY);
        currentY += 6;
        currentY = this.addMultilineText(doc, result.description, margin + 5, currentY, contentWidth - 5);
        currentY += 10;
      }

      // Career Recommendations
      if (result.careerRecommendations) {
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFontSize(12);
        doc.setTextColor(46, 204, 113); // Green
        doc.text('KHUYẾN NGHỊ NGHỀ NGHIỆP', margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        currentY = this.addMultilineText(doc, result.careerRecommendations, margin + 5, currentY, contentWidth - 5);
        currentY += 10;
      }

      // University Recommendations
      if (result.universityRecommendations) {
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFontSize(12);
        doc.setTextColor(155, 89, 182); // Purple
        doc.text('KHUYẾN NGHỊ TRƯỜNG ĐẠI HỌC', margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        currentY = this.addMultilineText(doc, result.universityRecommendations, margin + 5, currentY, contentWidth - 5);
        currentY += 10;
      }

      // Scores
      if (result.scores && Object.keys(result.scores).length > 0) {
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFontSize(12);
        doc.setTextColor(231, 76, 60); // Red
        doc.text('ĐIỂM SỐ CHI TIẾT', margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark

        Object.entries(result.scores).forEach(([category, score]) => {
          doc.text(`${category}: ${score}`, margin + 5, currentY);
          currentY += 6;
        });
        currentY += 10;
      }

      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141); // Gray
      doc.text('Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

      // Generate filename
      const filename = `ket-qua-trac-nghiem-${userResults.fullName.replace(/\s+/g, '-').toLowerCase()}-${result.id}.pdf`;
      
      // Save the PDF
      doc.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  }

  public async downloadAllQuizResultsPDF(userResults: UserQuizResults): Promise<void> {
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up Vietnamese font (basic Latin characters)
      doc.setFont('helvetica');
      
      // Page margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - 2 * margin;
      
      let currentY = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dark blue
      doc.text('BÁO CÁO TỔNG HỢP KẾT QUẢ TRẮC NGHIỆM', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(52, 152, 219); // Blue
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Student Information
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text('THÔNG TIN HỌC SINH', margin, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80); // Dark
      doc.text(`Họ và tên: ${userResults.fullName}`, margin, currentY);
      currentY += 6;
      doc.text(`Email: ${userResults.email}`, margin, currentY);
      currentY += 6;
      doc.text(`Tổng số bài làm: ${userResults.results.length}`, margin, currentY);
      currentY += 15;

      // Process each result
      userResults.results.forEach((result, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = margin;
        }

        // Result header
        doc.setFontSize(14);
        doc.setTextColor(52, 152, 219); // Blue
        doc.text(`KẾT QUẢ ${index + 1}: ${result.quizType}`, margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text(`Ngày làm bài: ${this.formatDate(result.submittedAt)}`, margin, currentY);
        currentY += 6;

        if (result.personalityCode) {
          doc.setTextColor(230, 126, 34); // Orange
          doc.text(`Mã tính cách: ${result.personalityCode}`, margin, currentY);
          currentY += 6;
        }

        if (result.nickname) {
          doc.setTextColor(44, 62, 80); // Dark
          doc.text(`Biệt danh: ${result.nickname}`, margin, currentY);
          currentY += 6;
        }

        if (result.description) {
          doc.setTextColor(44, 62, 80); // Dark
          doc.text('Mô tả:', margin, currentY);
          currentY += 6;
          currentY = this.addMultilineText(doc, result.description, margin + 5, currentY, contentWidth - 5, 5);
          currentY += 5;
        }

        currentY += 10; // Space between results
      });

      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141); // Gray
      doc.text('Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

      // Generate filename
      const filename = `tong-hop-ket-qua-${userResults.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      
      // Save the PDF
      doc.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  }
}

export default new PDFService();
