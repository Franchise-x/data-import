import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelImportService {
  constructor() {}

  parseExcelFile(file: File): Promise<{ [key: string]: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const data: { [key: string]: any[] } = {};

        wb.SheetNames.forEach((sheetName) => {
          const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
          data[sheetName] = XLSX.utils.sheet_to_json(ws);
        });

        resolve(data);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  }
}
