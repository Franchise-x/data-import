import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxDatatableModule,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { ExcelImportService } from '../excel-import.service';
import { Router } from '@angular/router';
import { AiApiService } from '../ai-api.service';

interface DataType {
  name: string;
  color: string;
  required: boolean;
}

@Component({
  selector: 'import-data',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule],
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ImportDataComponent {
  @ViewChild('myTable') table!: DatatableComponent;

  // Custom table styles
  tableStyles = {
    backgroundColor: '#FFF',
    color: '222222',
    border: '222222',
    header: '222222',
  };

  SelectionType = SelectionType;
  sheets: { [key: string]: any[] } = {};
  sheetNames: string[] = [];
  currentSheet: string = '';
  rows: any[] = [];
  columns: any[] = [];
  selected: any[] = [];
  editingCell: { rowIndex: number; prop: string } | null = null;

  dataTypes: DataType[] = [
    { name: 'Fixture Type', color: '#FF6B6B', required: true },
    { name: 'Part Number', color: '#4ECDC4', required: true },
    { name: 'Manufacturer', color: '#45B7D1', required: true },
    { name: 'Quantity', color: '#FFA07A', required: false },
    { name: 'Description', color: '#98D8C8', required: false },
  ];

  columnAssignments: { [key: string]: string } = {};

  colorPalette: string[] = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F67280',
    '#C06C84',
    '#6C5B7B',
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private excelImportService: ExcelImportService,
    private router: Router
  ) // private ai: AiApiService
  {}

  ngOnInit() {
    // Initialize with empty data
  }

  isEditing(rowIndex: number, prop: string): boolean {
    return (
      this.editingCell?.rowIndex === rowIndex && this.editingCell?.prop === prop
    );
  }

  editCell(rowIndex: number, prop: string): void {
    this.editingCell = { rowIndex, prop };
  }

  updateCell(rowIndex: number, prop: string, event: Event): void {
    const element = event.target as HTMLInputElement;
    this.rows[rowIndex][prop] = element.value;
    this.editingCell = null;
    this.table.rows = [...this.rows];
    this.cdr.detectChanges();
  }

  assignDataType(columnProp: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const dataTypeName = selectElement.value;
    this.columnAssignments[columnProp] = dataTypeName;
    const dataType = this.dataTypes.find((dt) => dt.name === dataTypeName);
    if (dataType) {
      const column = this.columns.find((col) => col.prop === columnProp);
      if (column) {
        column.color = dataType.color;
      }
    } else {
      // If no data type is selected, remove the assignment and color
      delete this.columnAssignments[columnProp];
      const column = this.columns.find((col) => col.prop === columnProp);
      if (column) {
        delete column.color;
      }
    }
    this.cdr.detectChanges();
  }

  getColumnColor(columnProp: string): string {
    const dataTypeName = this.columnAssignments[columnProp];
    if (dataTypeName) {
      const dataType = this.dataTypes.find((dt) => dt.name === dataTypeName);
      return dataType ? dataType.color : 'transparent';
    }
    return 'transparent';
  }

  getAssignedDataType(columnProp: string): string | undefined {
    return this.columnAssignments[columnProp];
  }

  isDataTypeAssigned(dataTypeName: string): boolean {
    return Object.values(this.columnAssignments).includes(dataTypeName);
  }

  isSaveDisabled(): boolean {
    return !this.dataTypes.every(
      (dt) => !dt.required || this.isDataTypeAssigned(dt.name)
    );
  }

  structureDataForSubmission(): any {
    const structuredData: any[] = [];

    this.rows.forEach((row) => {
      const item: any = {};
      Object.entries(this.columnAssignments).forEach(
        ([columnProp, dataTypeName]) => {
          item[dataTypeName] = row[columnProp];
        }
      );
      structuredData.push(item);
    });

    return structuredData;
  }

  saveChanges() {
    const structuredData = this.structureDataForSubmission();
    console.log('Structured data for submission:', structuredData);
    // Here you would send structuredData to your backend
  }

  selectEntireColumn(columnProp: string) {
    const column = this.columns.find((col) => col.prop === columnProp);
    if (!column) return;

    const columnCells = this.rows.map((row) => ({ row, column }));
    const allSelected = columnCells.every((cell) =>
      this.selected.some(
        (s) => s.row === cell.row && s.column.prop === cell.column.prop
      )
    );

    if (allSelected) {
      this.selected = this.selected.filter((s) => s.column.prop !== columnProp);
    } else {
      const newSelections = columnCells.filter(
        (cell) =>
          !this.selected.some(
            (s) => s.row === cell.row && s.column.prop === cell.column.prop
          )
      );
      this.selected = [...this.selected, ...newSelections];
    }

    this.table.selected = [...this.selected];
    console.log(`Toggled column: ${columnProp}`);

    // Force table refresh
    this.table.rows = [...this.rows];
    this.cdr.detectChanges();
  }

  onSelect({ selected }: any) {
    console.log('Select Event', selected);
    this.selected = selected;
    // Force table refresh
    this.table.rows = [...this.rows];
    this.cdr.detectChanges();
  }

  isCellSelected(rowIndex: number, columnProp: string): boolean {
    return this.selected.some(
      (s) => s.row === this.rows[rowIndex] && s.column.prop === columnProp
    );
  }

  triggerFileInput(inputId: string) {
    document.getElementById(inputId)?.click();
  }

  async onFileSelected(event: any, fileType: 'excel' | 'pdf') {
    const file: File = event.target.files[0];
    if (file) {
      if (fileType === 'excel') {
        try {
          const data = await this.excelImportService.parseExcelFile(file);
          this.sheets = data;
          this.sheetNames = Object.keys(this.sheets);
          if (this.sheetNames.length > 0) {
            this.switchSheet(this.sheetNames[0]);
          }
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          // Handle error (e.g., show an error message to the user)
        }
      } else if (fileType === 'pdf') {
        console.log('PDF upload is not implemented yet');
        console.log('File selected:', file.name);
        // this.ai.extractFixtures(file)

        // Navigate to the SpecReader page
        this.router.navigate(['/spec-reader']);
      }
    }
  }

  navigatePDF() {
    this.router.navigate(['/spec-reader']);
  }

  switchSheet(sheetName: string) {
    this.currentSheet = sheetName;
    this.updateTableData(this.sheets[sheetName]);
  }

  updateTableData(data: any[]) {
    if (data && data.length > 0) {
      this.columns = Object.keys(data[0]).map((key, index) => ({
        prop: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        color: this.colorPalette[index % this.colorPalette.length],
      }));
      this.rows = data;
    } else {
      this.columns = [];
      this.rows = [];
    }

    this.selected = [];

    if (this.table) {
      this.table.columns = [...this.columns];
      this.table.rows = [...this.rows];

      setTimeout(() => {
        this.table.recalculate();
        this.cdr.detectChanges();
      }, 0);
    }
  }

  getCellBackgroundColor(rowIndex: number, columnProp: string): string {
    if (this.isCellSelected(rowIndex, columnProp)) {
      const column = this.columns.find((col) => col.prop === columnProp);
      return column ? column.color : 'transparent';
    }
    return 'transparent';
  }

  getCellTextColor(rowIndex: number, columnProp: string): string {
    return this.isCellSelected(rowIndex, columnProp) ? 'black' : 'black';
  }

  uploadFile(file: File, fileType: 'excel' | 'pdf') {
    // This is a placeholder for your actual file upload logic
    console.log(`Uploading ${fileType} file: ${file.name}`);
    // You would typically use HttpClient to send the file to your server
    // For example:
    // const formData = new FormData();
    // formData.append('file', file, file.name);
    // this.http.post('your-upload-url', formData).subscribe(
    //   (response) => console.log('Upload successful', response),
    //   (error) => console.error('Upload failed', error)
    // );
  }

  clearData(): void {
    this.rows = [];
    this.columns = [];
    this.selected = [];
    this.editingCell = null;

    if (this.table) {
      this.table.rows = [];
      this.table.columns = [];
    }

    this.cdr.detectChanges();
  }
}
