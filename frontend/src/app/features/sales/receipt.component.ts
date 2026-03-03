import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Sale } from '../../shared/models/sale.model';

@Component({
  selector: 'app-receipt',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container-main">
      @if (sale) {
        <mat-card class="receipt-card max-w-4xl mx-auto p-6 md:p-8">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-indigo-600">🛠️Emi Repuestos⚙️</h1>
            <p class="text-lg text-gray-600">Repuestos de Autos</p>
            <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <mat-icon class="sale-success-icon text-green-600">check_circle</mat-icon>
              <p class="text-green-800 font-semibold mt-2">¡Venta Completada!</p>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Receipt Info -->
          <div class="my-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Número de Recibo:</p>
                <p class="font-bold text-lg">{{ sale.numeroRecibo }}</p>
              </div>
              <div class="text-right">
                <p class="text-gray-600">Fecha:</p>
                <p class="font-bold">{{ sale.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Items Table -->
          <div class="my-6">
            <h3 class="font-semibold text-lg mb-4">Productos Vendidos</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-2">Código</th>
                    <th class="text-left p-2">Producto</th>
                    <th class="text-right p-2">Precio</th>
                    <th class="text-center p-2">Cant.</th>
                    <th class="text-right p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of sale.items; track item.barcode) {
                    <tr class="border-b">
                      <td class="p-2">{{ item.barcode }}</td>
                      <td class="p-2">
                        <p class="font-semibold">{{ item.nombre }}</p>
                        <p class="text-xs text-gray-600">{{ item.marca }}</p>
                      </td>
                      <td class="text-right p-2">\${{ item.precioUnitario | number:'1.0-0' }}</td>
                      <td class="text-center p-2">{{ item.cantidad }}</td>
                      <td class="text-right p-2 font-semibold">\${{ item.subtotal | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Total -->
          <div class="my-6">
            <div class="flex justify-between items-center">
              <span class="text-xl font-semibold">TOTAL:</span>
              <span class="text-3xl font-bold text-indigo-600">\${{ sale.total | number:'1.0-0' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Footer -->
          <div class="text-center mt-6 text-gray-600 text-sm">
            <p class="italic">¡Gracias por su compra!</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 mt-6">
            <button mat-raised-button color="primary" (click)="downloadPDF()" class="flex-1">
              <mat-icon>download</mat-icon>
              Descargar PDF
            </button>
            <button mat-raised-button color="accent" (click)="printReceipt()" class="flex-1">
              <mat-icon>print</mat-icon>
              Imprimir
            </button>
            <button mat-raised-button routerLink="/sales/cart" class="flex-1">
              <mat-icon>shopping_cart</mat-icon>
              Nueva Venta
            </button>
            <button mat-stroked-button routerLink="/history" class="flex-1">
              <mat-icon>history</mat-icon>
              Ver Historial
            </button>
          </div>
        </mat-card>
      } @else {
        <div class="text-center py-12">
          <mat-icon class="text-8xl text-gray-300">receipt_long</mat-icon>
          <p class="text-gray-600 mt-4">Cargando recibo...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .receipt-card {
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 12px;
    }

    .sale-success-icon {
      width: 48px;
      height: 48px;
      font-size: 48px;
      line-height: 48px;
      display: block;
      margin: 0 auto;
    }

    table {
      border-collapse: collapse;
    }

    thead {
      border-bottom: 2px solid #e5e7eb;
    }
  `]
})
export class ReceiptComponent implements AfterViewInit {
  sale: Sale | null = null;
  saleId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.saleId = this.route.snapshot.params['id'];
      if (this.saleId) {
        this.loadSale();
      } else {
        this.router.navigate(['/dashboard']);
      }
      this.cdr.markForCheck();
    });
  }

  loadSale(): void {
    this.apiService.getSaleById(this.saleId).subscribe({
      next: (sale: Sale) => {
        this.sale = sale;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.snackBar.open('Error al cargar el recibo', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
        this.cdr.markForCheck();
      }
    });
  }

  downloadPDF(): void {
    this.apiService.getReceiptPdf(this.saleId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-${this.sale?.numeroRecibo}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF descargado exitosamente', 'Cerrar', { duration: 2000 });
      },
      error: (error: unknown) => {
        this.snackBar.open('Error al descargar el PDF', 'Cerrar', { duration: 3000 });
      }
    });
  }

  printReceipt(): void {
    window.print();
  }
}
