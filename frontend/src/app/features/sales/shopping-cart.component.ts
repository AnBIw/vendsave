import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, catchError, concatMap, finalize, map, of, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ScannerService } from '../../core/services/scanner.service';
import { Product } from '../../shared/models/product.model';
import { Sale, CreateSaleDto } from '../../shared/models/sale.model';

interface CartItem {
  product: Product;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="container-main">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Scanner Section -->
        <div class="lg:col-span-2">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Nueva Venta</mat-card-title>
              <mat-card-subtitle>Escanea los productos a vender</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Scanner Input -->
              <div class="scanner-section p-6 bg-gray-50 rounded-lg mb-6">
                <div class="flex items-center gap-4">
                  <mat-icon class="text-6xl text-indigo-500">qr_code_scanner</mat-icon>
                  <div class="flex-1">
                    <p class="text-lg font-semibold">Esperando escaneo...</p>
                    @if (lastScannedCode) {
                      <p class="text-sm text-green-600">Último código: {{ lastScannedCode }}</p>
                    }
                    @if (isScanning) {
                      <mat-spinner diameter="30" class="mt-2"></mat-spinner>
                    }
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-sm text-gray-600 mb-2">Si el scanner falla, ingresa el código manualmente:</p>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                      placeholder="Ej: 7802215303586"
                      [value]="manualCode"
                      (input)="onManualCodeInput($event)"
                      (keyup.enter)="submitManualCode()"
                      [disabled]="isScanning"
                    />
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="submitManualCode()"
                      [disabled]="isScanning"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cart Items -->
              @if (cartItems.length > 0) {
                <div class="space-y-3">
                  @for (item of cartItems; track getProductKey(item.product)) {
                    <div class="cart-item p-4 bg-white border border-gray-200 rounded-lg">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <h3 class="font-semibold">{{ item.product.nombre }}</h3>
                          <p class="text-sm text-gray-600">{{ item.product.marca }} - {{ item.product.modelo }}</p>
                          <p class="text-sm text-gray-500">Código: {{ item.product.barcode }}</p>
                          <p class="text-xs text-gray-500">Stock disponible: {{ item.product.cantidad }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-lg font-semibold text-indigo-600">\${{ item.product.precioUnitario | number:'1.0-0' }}</p>
                          <div class="flex items-center gap-2 mt-2">
                            <button mat-mini-fab color="primary" (click)="decreaseQuantity(item)" [disabled]="item.cantidad <= 1">
                              <mat-icon>remove</mat-icon>
                            </button>
                            <span class="text-xl font-bold px-3">{{ item.cantidad }}</span>
                            <button mat-mini-fab color="primary" (click)="increaseQuantity(item)" [disabled]="item.cantidad >= item.product.cantidad">
                              <mat-icon>add</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="removeItem(item)">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                          <p class="text-sm text-gray-600 mt-2">Subtotal: <strong>\${{ item.subtotal | number:'1.0-0' }}</strong></p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-12 text-gray-400">
                  <mat-icon class="text-8xl">shopping_cart</mat-icon>
                  <p class="mt-4 text-lg">Carrito vacío</p>
                  <p class="text-sm">Escanea productos para comenzar</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Summary Section -->
        <div>
          <mat-card class="sticky top-4">
            <mat-card-header>
              <mat-card-title>Resumen de Venta</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <div class="space-y-3">
                <div class="flex justify-between text-gray-600">
                  <span>Items:</span>
                  <span class="font-semibold">{{ totalItems }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Productos:</span>
                  <span class="font-semibold">{{ cartItems.length }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between text-2xl font-bold text-indigo-600">
                  <span>Total:</span>
                  <span>\${{ totalAmount | number:'1.0-0' }}</span>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <button 
                  mat-raised-button 
                  color="primary" 
                  class="w-full" 
                  (click)="finalizeSale()"
                  [disabled]="cartItems.length === 0 || isProcessing">
                  @if (isProcessing) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  }
                  <mat-icon>check_circle</mat-icon>
                  Finalizar Venta
                </button>
                <button 
                  mat-stroked-button 
                  color="warn" 
                  class="w-full" 
                  (click)="clearCart()"
                  [disabled]="cartItems.length === 0">
                  <mat-icon>clear</mat-icon>
                  Vaciar Carrito
                </button>
              </div>

              @if (cartItems.length > 0) {
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 class="font-semibold text-blue-900 mb-2">Detalles</h4>
                  <ul class="text-sm text-blue-800 space-y-1">
                    @for (item of cartItems; track getProductKey(item.product)) {
                      <li>{{ item.product.nombre }} x{{ item.cantidad }}</li>
                    }
                  </ul>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scanner-section {
      border: 2px dashed #6366f1;
      transition: all 0.3s;
    }

    .scanner-section:hover {
      border-color: #4f46e5;
      background-color: #eef2ff;
    }

    .cart-item {
      transition: transform 0.2s;
    }

    .cart-item:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .sticky {
      position: sticky;
      top: 1rem;
    }
  `]
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalAmount = 0;
  lastScannedCode = '';
  manualCode = '';
  isScanning = false;
  isProcessing = false;
  private scanRequests$ = new Subject<{ code: string; session: number }>();
  private scanSession = 0;
  private lastScannedAt = 0;
  private lastScannedValue = '';
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private scannerService: ScannerService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.scannerService.scannedCode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((code: string) => {
        this.handleScannedCode(code);
      });

    this.scanRequests$
      .pipe(
        takeUntil(this.destroy$),
        concatMap(({ code, session }) => {
          this.isScanning = true;
          this.cdr.markForCheck();

          return this.apiService.getProductByBarcode(code).pipe(
            map((product) => ({ code, session, product })),
            catchError(() => of({ code, session, product: null as Product | null })),
            finalize(() => {
              this.isScanning = false;
              this.cdr.markForCheck();
            }),
          );
        }),
      )
      .subscribe(({ code, session, product }) => {
        if (session !== this.scanSession) {
          return;
        }

        if (!product) {
          this.snackBar.open('Producto no encontrado', 'Cerrar', { duration: 3000 });
          this.cdr.markForCheck();
          return;
        }

        this.addToCart(product);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProductKey(product: Product): string {
    return product._id || product.barcode;
  }

  handleScannedCode(code: string): void {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      return;
    }

    const now = Date.now();
    const duplicatedFastEvent =
      this.lastScannedValue === normalizedCode && now - this.lastScannedAt < 180;

    this.lastScannedValue = normalizedCode;
    this.lastScannedAt = now;

    if (duplicatedFastEvent) {
      return;
    }

    this.lastScannedCode = normalizedCode;
    this.scanRequests$.next({ code: normalizedCode, session: this.scanSession });
    this.cdr.markForCheck();
  }

  onManualCodeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.manualCode = target.value;
  }

  submitManualCode(): void {
    const code = this.manualCode.trim();

    if (!code) {
      this.snackBar.open('Ingresa un código para buscar', 'Cerrar', { duration: 2000 });
      return;
    }

    this.manualCode = '';
    this.handleScannedCode(code);
  }

  addToCart(product: Product): void {
    if (product.cantidad === 0) {
      this.snackBar.open('Producto sin stock disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    const productKey = this.getProductKey(product);
    const existingIndex = this.cartItems.findIndex(item => this.getProductKey(item.product) === productKey);

    if (existingIndex !== -1) {
      const existingItem = this.cartItems[existingIndex];

      if (existingItem.cantidad >= product.cantidad) {
        this.snackBar.open('Stock insuficiente', 'Cerrar', { duration: 3000 });
        return;
      }

      const updatedItem: CartItem = {
        ...existingItem,
        cantidad: existingItem.cantidad + 1,
        subtotal: (existingItem.cantidad + 1) * existingItem.product.precioUnitario,
      };

      this.cartItems = this.cartItems.map((item, index) =>
        index === existingIndex ? updatedItem : item,
      );

      this.recalculateTotals();
      this.snackBar.open(`Cantidad actualizada: ${updatedItem.cantidad}`, 'Cerrar', { duration: 2000 });
      return;
    }

    this.cartItems = [
      ...this.cartItems,
      {
        product,
        cantidad: 1,
        subtotal: product.precioUnitario,
      },
    ];

    this.recalculateTotals();
    this.snackBar.open(`${product.nombre} agregado al carrito`, 'Cerrar', { duration: 2000 });
  }

  increaseQuantity(item: CartItem): void {
    if (item.cantidad >= item.product.cantidad) {
      this.snackBar.open('Stock insuficiente', 'Cerrar', { duration: 2000 });
      return;
    }

    this.cartItems = this.cartItems.map(cartItem => {
      if (this.getProductKey(cartItem.product) !== this.getProductKey(item.product)) {
        return cartItem;
      }

      const newCantidad = cartItem.cantidad + 1;
      return {
        ...cartItem,
        cantidad: newCantidad,
        subtotal: newCantidad * cartItem.product.precioUnitario,
      };
    });
    this.recalculateTotals();
  }

  decreaseQuantity(item: CartItem): void {
    if (item.cantidad > 1) {
      this.cartItems = this.cartItems.map(cartItem => {
        if (this.getProductKey(cartItem.product) !== this.getProductKey(item.product)) {
          return cartItem;
        }

        const newCantidad = cartItem.cantidad - 1;
        return {
          ...cartItem,
          cantidad: newCantidad,
          subtotal: newCantidad * cartItem.product.precioUnitario,
        };
      });

      this.recalculateTotals();
    }
  }

  removeItem(item: CartItem): void {
    const itemKey = this.getProductKey(item.product);
    const previousLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(
      cartItem => this.getProductKey(cartItem.product) !== itemKey,
    );

    if (this.cartItems.length < previousLength) {
      this.recalculateTotals();
      this.snackBar.open('Producto eliminado del carrito', 'Cerrar', { duration: 2000 });
    }
  }

  private recalculateTotals(): void {
    this.totalItems = this.cartItems.reduce((sum, item) => sum + item.cantidad, 0);
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.scanSession++;
      this.cartItems = [];
      this.recalculateTotals();
      this.snackBar.open('Carrito vaciado', 'Cerrar', { duration: 2000 });
      this.cdr.markForCheck();
    }
  }

  finalizeSale(): void {
    if (this.cartItems.length === 0) {
      return;
    }

    this.isProcessing = true;

    const saleData: CreateSaleDto = {
      items: this.cartItems.map(item => ({
        productoId: item.product._id!,
        cantidad: item.cantidad
      }))
    };

    this.apiService.createSale(saleData).subscribe({
      next: (sale: Sale) => {
        this.snackBar.open('¡Venta realizada exitosamente!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/sales/receipt', sale._id]);
        this.scanSession++;
        this.cartItems = [];
        this.recalculateTotals();
        this.isProcessing = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        const message =
          error && typeof error === 'object' && 'error' in error
            ? (error as { error?: { message?: string } }).error?.message
            : undefined;
        this.snackBar.open(message || 'Error al procesar la venta', 'Cerrar', { duration: 4000 });
        this.isProcessing = false;
        this.cdr.markForCheck();
      }
    });
  }
}
