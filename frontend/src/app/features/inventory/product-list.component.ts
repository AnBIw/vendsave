import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="container-main">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Inventario de Productos</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters mb-4 flex gap-4">
            <mat-form-field class="flex-1">
              <mat-label>Buscar</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Buscar por código, nombre, marca...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Filtrar por Tipo</mat-label>
              <mat-select [formControl]="tipoControl">
                <mat-option value="">Todos</mat-option>
                <mat-option value="motor">Motor</mat-option>
                <mat-option value="frenos">Frenos</mat-option>
                <mat-option value="suspension">Suspensión</mat-option>
                <mat-option value="electrico">Eléctrico</mat-option>
                <mat-option value="transmision">Transmisión</mat-option>
                <mat-option value="carroceria">Carrocería</mat-option>
                <mat-option value="filtros">Filtros</mat-option>
                <mat-option value="lubricantes">Lubricantes</mat-option>
                <mat-option value="neumaticos">Neumáticos</mat-option>
                <mat-option value="otros">Otros</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="loadProducts()">
              <mat-icon>refresh</mat-icon> Actualizar
            </button>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              
              <ng-container matColumnDef="barcode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                <td mat-cell *matCellDef="let product">{{ product.barcode }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let product">{{ product.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="marca">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Marca</th>
                <td mat-cell *matCellDef="let product">{{ product.marca }}</td>
              </ng-container>

              <ng-container matColumnDef="modelo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Modelo</th>
                <td mat-cell *matCellDef="let product">{{ product.modelo }}</td>
              </ng-container>

              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                <td mat-cell *matCellDef="let product">
                  <span class="px-2 py-1 rounded text-xs" [class]="getTipoClass(product.tipo)">
                    {{ product.tipo | titlecase }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="precioUnitario">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Precio</th>
                <td mat-cell *matCellDef="let product">\${{ product.precioUnitario | number:'1.0-0' }}</td>
              </ng-container>

              <ng-container matColumnDef="cantidad">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock</th>
                <td mat-cell *matCellDef="let product">
                  <span [class]="getStockClass(product.cantidad)">
                    {{ product.cantidad }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="text-center py-8">
                    <mat-icon class="text-gray-400 text-6xl">inventory_2</mat-icon>
                    <p class="text-gray-600 mt-4">No se encontraron productos</p>
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
  `]
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['barcode', 'nombre', 'marca', 'modelo', 'tipo', 'precioUnitario', 'cantidad', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  searchControl = new FormControl('');
  tipoControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProducts();
      });

    this.tipoControl.valueChanges.subscribe(() => {
      this.loadProducts();
    });
  }

  loadProducts(): void {
    const search = this.searchControl.value || undefined;
    const tipo = this.tipoControl.value || undefined;

    this.apiService.getAllProducts(search, tipo, 1000, 1).subscribe({
      next: (products: Product[]) => {
        this.dataSource.data = products;
      },
      error: (error: unknown) => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      motor: 'bg-red-100 text-red-800',
      frenos: 'bg-orange-100 text-orange-800',
      suspension: 'bg-yellow-100 text-yellow-800',
      electrico: 'bg-blue-100 text-blue-800',
      transmision: 'bg-purple-100 text-purple-800',
      carroceria: 'bg-green-100 text-green-800',
      filtros: 'bg-teal-100 text-teal-800',
      lubricantes: 'bg-indigo-100 text-indigo-800',
      neumaticos: 'bg-gray-100 text-gray-800',
      otros: 'bg-pink-100 text-pink-800'
    };
    return classes[tipo] || 'bg-gray-100 text-gray-800';
  }

  getStockClass(cantidad: number): string {
    if (cantidad === 0) return 'font-bold text-red-600';
    if (cantidad < 5) return 'font-semibold text-orange-600';
    return 'text-green-600';
  }

  viewDetails(product: Product): void {
    this.snackBar.open(`Detalles de: ${product.nombre}`, 'Cerrar', { duration: 2000 });
    // TODO: Implementar modal de detalles
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar "${product.nombre}"?`)) {
      this.apiService.deleteProduct(product._id!).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error: unknown) => {
          this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
