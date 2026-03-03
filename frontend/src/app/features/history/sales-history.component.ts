import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { Sale } from '../../shared/models/sale.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="container-main">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Historial de Ventas</mat-card-title>
          <mat-card-subtitle>Consulta todas las ventas realizadas</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters mb-6">
            <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <mat-form-field>
                <mat-label>Fecha Desde</mat-label>
                <input matInput [matDatepicker]="pickerStart" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="pickerStart"></mat-datepicker-toggle>
                <mat-datepicker #pickerStart></mat-datepicker>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Fecha Hasta</mat-label>
                <input matInput [matDatepicker]="pickerEnd" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="pickerEnd"></mat-datepicker-toggle>
                <mat-datepicker #pickerEnd></mat-datepicker>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Buscar por Recibo</mat-label>
                <input matInput formControlName="search" placeholder="REC-20240101-0001">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="flex gap-2 items-center">
                <button mat-raised-button color="primary" (click)="applyFilters()">
                  <mat-icon>filter_list</mat-icon>
                  Filtrar
                </button>
                <button mat-stroked-button (click)="clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <!-- Stats Summary -->
          @if (dataSource.data.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-600">Total Ventas</p>
                <p class="text-2xl font-bold text-blue-800">{{ dataSource.data.length }}</p>
              </div>
              <div class="p-4 bg-green-50 rounded-lg">
                <p class="text-sm text-green-600">Monto Total</p>
                <p class="text-2xl font-bold text-green-800">\${{ getTotalAmount() | number:'1.0-0' }}</p>
              </div>
              <div class="p-4 bg-purple-50 rounded-lg">
                <p class="text-sm text-purple-600">Promedio por Venta</p>
                <p class="text-2xl font-bold text-purple-800">\${{ getAverageAmount() | number:'1.0-0' }}</p>
              </div>
            </div>
          }

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              
              <ng-container matColumnDef="numeroRecibo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Recibo</th>
                <td mat-cell *matCellDef="let sale">
                  <span class="font-mono text-sm">{{ sale.numeroRecibo }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
                <td mat-cell *matCellDef="let sale">
                  {{ sale.fecha | date:'dd/MM/yyyy HH:mm' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Productos</th>
                <td mat-cell *matCellDef="let sale">
                  <mat-chip-set>
                    <mat-chip>{{ sale.items.length }} items</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
                <td mat-cell *matCellDef="let sale">
                  <span class="text-lg font-semibold text-green-600">\${{ sale.total | number:'1.0-0' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let sale">
                  <button mat-icon-button color="primary" (click)="viewReceipt(sale)" matTooltip="Ver recibo">
                    <mat-icon>receipt_long</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="downloadPDF(sale)" matTooltip="Descargar PDF">
                    <mat-icon>download</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="text-center py-12">
                    <mat-icon class="text-gray-400 text-8xl">receipt</mat-icon>
                    <p class="text-gray-600 mt-4 text-lg">No se encontraron ventas</p>
                    <p class="text-gray-500 text-sm">Intenta con otros filtros</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    th.mat-header-cell {
      font-weight: 600;
      color: #4a5568;
    }

    .font-mono {
      font-family: 'Courier New', monospace;
    }
  `]
})
export class SalesHistoryComponent implements OnInit {
  displayedColumns: string[] = ['numeroRecibo', 'fecha', 'items', 'total', 'actions'];
  dataSource = new MatTableDataSource<Sale>([]);
  
  filterForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    search: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSales(): void {
    const startDate = this.filterForm.value.startDate?.toISOString().split('T')[0];
    const endDate = this.filterForm.value.endDate?.toISOString().split('T')[0];

    this.apiService.getAllSales(startDate, endDate, 1000, 1).subscribe({
      next: (sales) => {
        this.dataSource.data = sales;
        
        // Filtrar por búsqueda local
        const searchTerm = this.filterForm.value.search?.toLowerCase();
        if (searchTerm) {
          this.dataSource.data = sales.filter(sale => 
            sale.numeroRecibo.toLowerCase().includes(searchTerm)
          );
        }
      },
      error: (error) => {
        this.snackBar.open('Error al cargar ventas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    this.loadSales();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadSales();
  }

  getTotalAmount(): number {
    return this.dataSource.data.reduce((sum, sale) => sum + sale.total, 0);
  }

  getAverageAmount(): number {
    if (this.dataSource.data.length === 0) return 0;
    return this.getTotalAmount() / this.dataSource.data.length;
  }

  viewReceipt(sale: Sale): void {
    this.router.navigate(['/sales/receipt', sale._id]);
  }

  downloadPDF(sale: Sale): void {
    this.apiService.getReceiptPdf(sale._id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-${sale.numeroRecibo}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF descargado exitosamente', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Error al descargar el PDF', 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewDetails(sale: Sale): void {
    // Mostrar detalles en un snackbar o modal
    const itemsList = sale.items.map(item => `${item.nombre} x${item.cantidad}`).join(', ');
    this.snackBar.open(`Productos: ${itemsList}`, 'Cerrar', { duration: 5000 });
  }
}
