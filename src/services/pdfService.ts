import jsPDF from 'jspdf';

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
      // Check if we need a new page with more margin
      if (y > doc.internal.pageSize.height - 40) {
        doc.addPage();
        y = 30; // More generous top margin
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
    // Check if we need a new page for the section with more generous spacing
    if (y > doc.internal.pageSize.height - 70) {
      doc.addPage();
      y = 30;
    }

    // Add some spacing before section
    y += 5;

    // Add title with background box
    doc.setFillColor(245, 246, 250);
    doc.rect(x - 5, y - 5, maxWidth + 10, 12, 'F');
    
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    y = this.addMultilineText(doc, title, x, y + 3, maxWidth, 9);
    y += 8;

    // Add content with proper spacing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(contentFontSize);
    doc.setTextColor(contentColor[0], contentColor[1], contentColor[2]);
    y = this.addMultilineText(doc, content, x + 3, y, maxWidth - 6, 7);
    y += 12; // More spacing after content

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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(label, x, y);
    
    doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    y = this.addMultilineText(doc, title, x, y, maxWidth, 10);
    
    // Add decorative line
    doc.setLineWidth(1);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(x, y + 2, x + maxWidth, y + 2);
    
    return y + 12;
  }

  public async downloadQuizResultPDF(userResults: UserQuizResults, result: QuizResult) {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica');
      
      const margin = 25;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margin * 2;
      let y = 30;

      // MAIN HEADER with better styling
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 81, 255);
      doc.text('BÁO CÁO KẾT QUẢ TRẮC NGHIỆM', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      doc.text('Phân tích tính cách và khuyến nghị nghề nghiệp', pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      // Decorative header line
      doc.setLineWidth(2);
      doc.setDrawColor(31, 81, 255);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // USER INFO SECTION with better layout
      y = this.addHeaderWithLine(doc, 'THÔNG TIN NGƯỜI DÙNG', margin, y, contentWidth, 16, [46, 125, 50]);
      
      // Create info box
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, contentWidth, 50, 'F');
      
      y += 10;
      y = this.addInfoRow(doc, 'Họ và tên:', userResults.fullName, margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Email:', userResults.email, margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Ngày làm bài:', this.formatDate(result.submittedAt), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Loại trắc nghiệm:', result.quizType, margin + 10, y, contentWidth - 20);
      y += 15;

      // MAIN RESULT SECTION
      y = this.addHeaderWithLine(doc, 'KẾT QUẢ TRẮC NGHIỆM', margin, y, contentWidth, 16, [220, 53, 69]);

      // Personality code in highlighted box
      doc.setFillColor(255, 235, 59);
      doc.rect(margin, y, contentWidth, 20, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(183, 28, 28);
      doc.text(`Mã tính cách: ${result.personalityCode || "Không xác định"}`, margin + 10, y + 13);
      y += 30;

      // Nickname section
      if (result.nickname) {
        y = this.addSection(
          doc,
          '🏷️ BIỆT DANH',
          result.nickname,
          margin,
          y,
          contentWidth,
          14,
          12,
          [46, 204, 113],
          [44, 62, 80]
        );
      }

      // Key traits section
      if (result.keyTraits) {
        y = this.addSection(
          doc,
          '⭐ ĐẶC ĐIỂM NỔI BẬT',
          result.keyTraits,
          margin,
          y,
          contentWidth,
          14,
          12,
          [155, 89, 182],
          [44, 62, 80]
        );
      }

      // Description section
      if (result.description) {
        y = this.addSection(
          doc,
          '📝 MÔ TẢ CHI TIẾT',
          result.description,
          margin,
          y,
          contentWidth,
          14,
          12,
          [52, 152, 219],
          [44, 62, 80]
        );
      }

      // Career recommendations section
      if (result.careerRecommendations) {
        y = this.addSection(
          doc,
          '💼 KHUYẾN NGHỊ NGHỀ NGHIỆP',
          result.careerRecommendations,
          margin,
          y,
          contentWidth,
          14,
          12,
          [46, 204, 113],
          [44, 62, 80]
        );
      }

      // University recommendations section
      if (result.universityRecommendations) {
        y = this.addSection(
          doc,
          '🎓 KHUYẾN NGHỊ TRƯỜNG ĐẠI HỌC',
          result.universityRecommendations,
          margin,
          y,
          contentWidth,
          14,
          12,
          [155, 89, 182],
          [44, 62, 80]
        );
      }

      // Scores section with better formatting
      if (result.scores && Object.keys(result.scores).length > 0) {
        // Check if we need a new page for scores
        if (y > pageHeight - 100) {
          doc.addPage();
          y = 30;
        }

        y = this.addHeaderWithLine(doc, '📊 ĐIỂM SỐ CHI TIẾT', margin, y, contentWidth, 14, [231, 76, 60]);

        // Create scores table
        doc.setFillColor(252, 252, 252);
        const scoresHeight = Object.keys(result.scores).length * 10 + 10;
        doc.rect(margin, y, contentWidth, scoresHeight, 'F');
        
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        
        for (const [category, score] of Object.entries(result.scores)) {
          doc.setFont('helvetica', 'bold');
          doc.text(category, margin + 10, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`: ${score}`, margin + 100, y);
          y += 8;
        }
        y += 10;
      }

      // Add professional footer
      const totalPages = doc.getNumberOfPages();
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(245, 246, 250);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text(
          'Báo cáo được tạo tự động bởi hệ thống trắc nghiệm tính cách',
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );
        doc.text(
          `Ngày tạo: ${this.formatDate(new Date().toISOString())}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        doc.text(
          `Trang ${i}/${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        );
      }

      // Generate filename
      const sanitizedName = userResults.fullName
        .normalize('NFD')
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

  // Method to download all quiz results for a user with improved formatting
  public async downloadAllQuizResultsPDF(userResults: UserQuizResults) {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica');
      
      const margin = 25;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margin * 2;
      let y = 30;

      // Main header with professional styling
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 81, 255);
      doc.text('BÁO CÁO TỔNG HỢP KẾT QUẢ', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      doc.text('Trắc nghiệm tính cách và phát triển nghề nghiệp', pageWidth / 2, y, { align: 'center' });
      y += 20;

      // User info section
      y = this.addHeaderWithLine(doc, 'THÔNG TIN NGƯỜI DÙNG', margin, y, contentWidth, 16, [46, 125, 50]);
      
      // User info box
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, contentWidth, 45, 'F');
      
      y += 10;
      y = this.addInfoRow(doc, 'Họ và tên:', userResults.fullName, margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Email:', userResults.email, margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Tổng số bài:', `${userResults.results.length} bài trắc nghiệm`, margin + 10, y, contentWidth - 20);
      y += 20;

      // Summary statistics
      y = this.addHeaderWithLine(doc, 'TỔNG QUAN KẾT QUẢ', margin, y, contentWidth, 16, [220, 53, 69]);
      
      // Create summary table
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y, contentWidth, 80, 'F');
      y += 10;

      const quizTypes = [...new Set(userResults.results.map(r => r.quizType))];
      const personalityCodes = [...new Set(userResults.results.map(r => r.personalityCode))];
      
      y = this.addInfoRow(doc, 'Các loại trắc nghiệm:', quizTypes.join(', '), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Mã tính cách:', personalityCodes.join(', '), margin + 10, y, contentWidth - 20);
      y = this.addInfoRow(doc, 'Thời gian thực hiện:', 
        `${this.formatDate(userResults.results[userResults.results.length - 1].submittedAt)} - ${this.formatDate(userResults.results[0].submittedAt)}`, 
        margin + 10, y, contentWidth - 20);
      y += 25;

      // Process each quiz result
      for (let i = 0; i < userResults.results.length; i++) {
        const result = userResults.results[i];
        
        // Check if we need a new page
        if (y > pageHeight - 120) {
          doc.addPage();
          y = 30;
        }

        // Quiz result card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 220, 220);
        doc.rect(margin, y, contentWidth, 60, 'FD');
        
        y += 10;

        // Quiz number and type
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 81, 255);
        doc.text(`${i + 1}. ${result.quizType}`, margin + 10, y);
        y += 10;

        // Quiz details in two columns
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85);
        
        // Left column
        doc.text(`Ngày: ${this.formatDate(result.submittedAt)}`, margin + 10, y);
        doc.text(`Mã: ${result.personalityCode}`, margin + 10, y + 8);
        
        // Right column
        if (result.nickname) {
          doc.text(`Biệt danh: ${result.nickname}`, margin + contentWidth/2, y);
        }
        
        y += 25;

        // Add separator line
        doc.setLineWidth(0.5);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
      }

      // Professional footer for all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(245, 246, 250);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text(
          'Báo cáo tổng hợp được tạo tự động bởi hệ thống trắc nghiệm tính cách',
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );
        doc.text(
          `Ngày tạo: ${this.formatDate(new Date().toISOString())}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        doc.text(
          `Trang ${i}/${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        );
      }

      // Generate filename
      const sanitizedName = userResults.fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      const filename = `bao-cao-tong-hop-${sanitizedName}.pdf`;
      
      doc.save(filename);
      
    } catch (err) {
      console.error('PDF Generation Error:', err);
      throw new Error('Không thể tạo file PDF tổng hợp. Vui lòng thử lại.');
    }
  }
}

export default new PDFService();