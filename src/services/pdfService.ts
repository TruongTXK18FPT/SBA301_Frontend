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

  private splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
    if (!text) return [];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = doc.getTextWidth(testLine);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // If single word is too long, force break it
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
    const lines = this.splitText(doc, text, maxWidth);
    let currentY = y;

    for (const line of lines) {
      doc.text(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  // Convert Vietnamese text to compatible format
  private sanitizeVietnameseText(text: string): string {
    // Replace common Vietnamese characters that might cause issues
    const replacements: { [key: string]: string } = {
      'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
      'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
      'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
      'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
      'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
      'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
      'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
      'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
      'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
      'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
      'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
      'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
      'đ': 'd', 'Đ': 'D'
    };

    let result = text;
    Object.entries(replacements).forEach(([vietnamese, latin]) => {
      result = result.replace(new RegExp(vietnamese, 'g'), latin);
    });

    return result;
  }

  public async downloadQuizResultPDF(userResults: UserQuizResults, result: QuizResult): Promise<void> {
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Try to use a font that supports Vietnamese, fallback to helvetica
      doc.setFont('helvetica', 'normal');
      
      // Page margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - 2 * margin;
      
      let currentY = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dark blue
      const headerText = this.sanitizeVietnameseText('BÁO CÁO KẾT QUẢ TRẮC NGHIỆM');
      doc.text(headerText, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(52, 152, 219); // Blue
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Student Information
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text(this.sanitizeVietnameseText('THÔNG TIN HỌC SINH'), margin, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80); // Dark
      doc.text(`Ho va ten: ${this.sanitizeVietnameseText(userResults.fullName)}`, margin, currentY);
      currentY += 6;
      doc.text(`Email: ${userResults.email}`, margin, currentY);
      currentY += 6;
      doc.text(`Ngay lam bai: ${this.sanitizeVietnameseText(this.formatDate(result.submittedAt))}`, margin, currentY);
      currentY += 6;
      doc.text(`Loai trac nghiem: ${this.sanitizeVietnameseText(result.quizType)}`, margin, currentY);
      currentY += 15;

      // Quiz Results
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text(this.sanitizeVietnameseText('KẾT QUẢ TRẮC NGHIỆM'), margin, currentY);
      currentY += 8;

      // Personality Code
      if (result.personalityCode) {
        doc.setFontSize(12);
        doc.setTextColor(230, 126, 34); // Orange
        doc.text(`Ma tinh cach: ${result.personalityCode}`, margin, currentY);
        currentY += 8;
      }

      // Nickname
      if (result.nickname) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text(`Biet danh: ${this.sanitizeVietnameseText(result.nickname)}`, margin, currentY);
        currentY += 6;
      }

      // Key Traits
      if (result.keyTraits) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text('Dac diem noi bat:', margin, currentY);
        currentY += 6;
        currentY = this.addMultilineText(doc, this.sanitizeVietnameseText(result.keyTraits), margin + 5, currentY, contentWidth - 5);
        currentY += 5;
      }

      // Description
      if (result.description) {
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text('Mo ta chi tiet:', margin, currentY);
        currentY += 6;
        currentY = this.addMultilineText(doc, this.sanitizeVietnameseText(result.description), margin + 5, currentY, contentWidth - 5);
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
        doc.text(this.sanitizeVietnameseText('KHUYẾN NGHỊ NGHỀ NGHIỆP'), margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        currentY = this.addMultilineText(doc, this.sanitizeVietnameseText(result.careerRecommendations), margin + 5, currentY, contentWidth - 5);
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
        doc.text(this.sanitizeVietnameseText('KHUYẾN NGHỊ TRƯỜNG ĐẠI HỌC'), margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        currentY = this.addMultilineText(doc, this.sanitizeVietnameseText(result.universityRecommendations), margin + 5, currentY, contentWidth - 5);
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
        doc.text(this.sanitizeVietnameseText('ĐIỂM SỐ CHI TIẾT'), margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark

        Object.entries(result.scores).forEach(([category, score]) => {
          doc.text(`${this.sanitizeVietnameseText(category)}: ${score}`, margin + 5, currentY);
          currentY += 6;
        });
        currentY += 10;
      }

      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141); // Gray
      doc.text(this.sanitizeVietnameseText('Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách'), pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Ngay tao: ${this.sanitizeVietnameseText(new Date().toLocaleDateString('vi-VN'))}`, pageWidth / 2, footerY + 5, { align: 'center' });

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

      // Set font
      doc.setFont('helvetica', 'normal');
      
      // Page margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - 2 * margin;
      
      let currentY = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dark blue
      doc.text(this.sanitizeVietnameseText('BÁO CÁO TỔNG HỢP KẾT QUẢ TRẮC NGHIỆM'), pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(52, 152, 219); // Blue
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Student Information
      doc.setFontSize(14);
      doc.setTextColor(52, 152, 219); // Blue
      doc.text(this.sanitizeVietnameseText('THÔNG TIN HỌC SINH'), margin, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80); // Dark
      doc.text(`Ho va ten: ${this.sanitizeVietnameseText(userResults.fullName)}`, margin, currentY);
      currentY += 6;
      doc.text(`Email: ${userResults.email}`, margin, currentY);
      currentY += 6;
      doc.text(`Tong so bai lam: ${userResults.results.length}`, margin, currentY);
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
        doc.text(`KET QUA ${index + 1}: ${this.sanitizeVietnameseText(result.quizType)}`, margin, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80); // Dark
        doc.text(`Ngay lam bai: ${this.sanitizeVietnameseText(this.formatDate(result.submittedAt))}`, margin, currentY);
        currentY += 6;

        if (result.personalityCode) {
          doc.setTextColor(230, 126, 34); // Orange
          doc.text(`Ma tinh cach: ${result.personalityCode}`, margin, currentY);
          currentY += 6;
        }

        if (result.nickname) {
          doc.setTextColor(44, 62, 80); // Dark
          doc.text(`Biet danh: ${this.sanitizeVietnameseText(result.nickname)}`, margin, currentY);
          currentY += 6;
        }

        if (result.description) {
          doc.setTextColor(44, 62, 80); // Dark
          doc.text('Mo ta:', margin, currentY);
          currentY += 6;
          currentY = this.addMultilineText(doc, this.sanitizeVietnameseText(result.description), margin + 5, currentY, contentWidth - 5, 5);
          currentY += 5;
        }

        currentY += 10; // Space between results
      });

      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141); // Gray
      doc.text(this.sanitizeVietnameseText('Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách'), pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Ngay tao: ${this.sanitizeVietnameseText(new Date().toLocaleDateString('vi-VN'))}`, pageWidth / 2, footerY + 5, { align: 'center' });

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
