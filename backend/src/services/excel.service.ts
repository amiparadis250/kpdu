import XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { ExcelImportResult } from '../types';

class ExcelService {
  async importVoters(filePath: string): Promise<ExcelImportResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results: ExcelImportResult = {
        success: 0,
        errors: [],
        total: data.length
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        try {
          await this.processVoterRow(row, i + 2);
          results.success++;
        } catch (error: any) {
          results.errors.push({
            row: i + 2,
            data: row,
            error: error.message
          });
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  async processVoterRow(row: any, rowNumber: number): Promise<void> {
    const requiredFields = ['members-id', 'Member Name', 'National ID', 'Mobile Number', 'Branch'];
    for (const field of requiredFields) {
      if (!row[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const validBranches = ['Western(Member)', 'Nyanza(Member)', 'WESTERN', 'UPPER EASTERN'];
    if (!validBranches.includes(row['Branch'])) {
      throw new Error(`Invalid branch: ${row['Branch']}. Must be one of: ${validBranches.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { memberId: row['members-id'].toString() },
          { nationalId: row['National ID'].toString() }
        ]
      }
    });
    
    if (existingUser) {
      throw new Error('User with this Member ID or National ID already exists');
    }

    // Find or create branch
    const branch = await prisma.branchModel.upsert({
      where: { name: row['Branch'] },
      update: {},
      create: {
        name: row['Branch'],
        code: this.generateBranchCode(row['Branch']),
        isActive: true
      }
    });

    // Map branch name to enum
    const branchEnum = this.mapBranchToEnum(row['Branch']);

    // Create user
    await prisma.user.create({
      data: {
        memberId: row['members-id'].toString(),
        memberName: row['Member Name'].toString().trim(),
        nationalId: row['National ID'].toString(),
        mobileNumber: row['Mobile Number'].toString(),
        branch: branchEnum,
        role: 'MEMBER',
        branchId: branch.id,
        isActive: true,
        hasVoted: false
      }
    });
  }

  mapBranchToEnum(branchName: string): 'WESTERN_MEMBER' | 'NYANZA_MEMBER' | 'WESTERN' | 'UPPER_EASTERN' {
    const branchMap: { [key: string]: 'WESTERN_MEMBER' | 'NYANZA_MEMBER' | 'WESTERN' | 'UPPER_EASTERN' } = {
      'Western(Member)': 'WESTERN_MEMBER',
      'Nyanza(Member)': 'NYANZA_MEMBER',
      'WESTERN': 'WESTERN',
      'UPPER EASTERN': 'UPPER_EASTERN'
    };
    return branchMap[branchName];
  }

  generateBranchCode(branchName: string): string {
    const codeMap: { [key: string]: string } = {
      'Western(Member)': 'WM',
      'Nyanza(Member)': 'NM', 
      'WESTERN': 'WE',
      'UPPER EASTERN': 'UE'
    };
    return codeMap[branchName] || 'UK';
  }

  validateExcelStructure(filePath: string): { valid: boolean; rowCount: number } {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const requiredHeaders = ['members-id', 'Member Name', 'National ID', 'Mobile Number', 'Branch'];
      
      for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
          throw new Error(`Missing required column: ${required}`);
        }
      }

      return { valid: true, rowCount: data.length - 1 };
    } catch (error: any) {
      throw new Error(`Invalid Excel structure: ${error.message}`);
    }
  }
}

export default new ExcelService();