import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxDatatableModule,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { AiApiService } from '../ai-api.service';

interface DataType {
  name: string;
  color: string;
  required: boolean;
}

@Component({
  selector: 'app-spec-reader',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule],
  templateUrl: 'spec-reader.component.html',
})
export class SpecReaderComponent {
  @ViewChild('myTable') table!: DatatableComponent;

  constructor(private cdr: ChangeDetectorRef, private ai: AiApiService) {}

  SelectionType = SelectionType;
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

  triggerFileInput(inputId: string) {
    document.getElementById(inputId)?.click();
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

  getColumnColor(prop: string): string {
    const assignedType = this.columnAssignments[prop];
    if (assignedType) {
      const dataType = this.dataTypes.find((dt) => dt.name === assignedType);
      return dataType ? dataType.color : '';
    }
    return '';
  }

  private generateColumns(firstRow: any): any[] {
    return Object.keys(firstRow).map((key) => ({
      prop: key,
      name: key,
      sortable: true,
      draggable: true,
      resizeable: true,
    }));
  }

  async onFileSelected(event: any, fileType: 'excel' | 'pdf') {
    const file: File = event.target.files[0];
    if (file) {
      if (fileType === 'pdf') {
        try {
          // this.ai.extractFixtures(file).subscribe((results: any[]) => {
          //   console.log('Results:', results);
          //   this.rows = results;
          //   this.columns = this.generateColumns(results[0]);
          //   this.cdr.detectChanges();
          // });
          this.ai.processQuote(file).subscribe((results: any[]) => {
            console.log('Results:', results);
            this.rows = results;
            this.columns = this.generateColumns(results[0]);
            this.cdr.detectChanges();
          });
        } catch (error) {
          console.error('Error parsing PDF file:', error);
          // Handle error (e.g., show an error message to the user)
        }
      }
    }
  }
}
