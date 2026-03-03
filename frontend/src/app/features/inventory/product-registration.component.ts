import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ScannerService } from '../../core/services/scanner.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container-main">
      <mat-card class="registration-card">
        <mat-card-header>
          <mat-card-title>Registrar Producto</mat-card-title>
          <mat-card-subtitle>Escanea el código de barras o ingresa manualmente</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Scanner Input -->
          <div class="scanner-section mb-6">
            <div class="flex items-center gap-4">
              <mat-form-field class="flex-1">
                <mat-label>Código de Barras</mat-label>
                <input matInput [value]="scannedCode" readonly placeholder="Esperando escaneo...">
              </mat-form-field>
              @if (isScanning) {
                <mat-spinner diameter="40"></mat-spinner>
              }
            </div>

            <div class="mt-3">
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
                  type="button"
                  (click)="submitManualCode()"
                  [disabled]="isScanning"
                >
                  Buscar
                </button>
              </div>
            </div>

            @if (scannedCode) {
              <div class="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p class="text-sm text-green-800">✓ Código escaneado: <strong>{{ scannedCode }}</strong></p>
              </div>
            }
          </div>

          <!-- Product Form -->
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
            @if (existingProduct) {
              <div class="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                <h3 class="font-semibold text-blue-900 mb-2">Producto Existente</h3>
                <p class="text-sm text-blue-800">{{ existingProduct.nombre }} - {{ existingProduct.marca }}</p>
                <p class="text-sm text-blue-700">Stock actual: <strong>{{ existingProduct.cantidad }}</strong> unidades</p>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field class="w-full">
                <mat-label>Nombre del Producto</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Filtro de aceite">
                @if (productForm.get('nombre')?.hasError('required') && productForm.get('nombre')?.touched) {
                  <mat-error>El nombre es obligatorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Marca</mat-label>
                <input matInput formControlName="marca" placeholder="Ej: Bosch">
                @if (productForm.get('marca')?.hasError('required') && productForm.get('marca')?.touched) {
                  <mat-error>La marca es obligatoria</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Modelo</mat-label>
                <input matInput formControlName="modelo" placeholder="Ej: F026407006">
                @if (productForm.get('modelo')?.hasError('required') && productForm.get('modelo')?.touched) {
                  <mat-error>El modelo es obligatorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Tipo de Repuesto</mat-label>
                <mat-select formControlName="tipo">
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
                @if (productForm.get('tipo')?.hasError('required') && productForm.get('tipo')?.touched) {
                  <mat-error>El tipo es obligatorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Precio Unitario ($)</mat-label>
                <input matInput type="number" formControlName="precioUnitario" placeholder="0.00" step="0.01">
                @if (productForm.get('precioUnitario')?.hasError('required') && productForm.get('precioUnitario')?.touched) {
                  <mat-error>El precio es obligatorio</mat-error>
                }
                @if (productForm.get('precioUnitario')?.hasError('min')) {
                  <mat-error>El precio debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>{{ existingProduct ? 'Cantidad a Agregar' : 'Cantidad Inicial' }}</mat-label>
                <input matInput type="number" formControlName="cantidad" placeholder="0" min="0">
                @if (productForm.get('cantidad')?.hasError('required') && productForm.get('cantidad')?.touched) {
                  <mat-error>La cantidad es obligatoria</mat-error>
                }
                @if (productForm.get('cantidad')?.hasError('min')) {
                  <mat-error>La cantidad debe ser mayor o igual a 0</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="flex gap-4 mt-6">
              <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || isLoading">
                @if (isLoading) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                {{ existingProduct ? 'Actualizar Stock' : 'Guardar Producto' }}
              </button>
              <button mat-raised-button type="button" (click)="resetForm()">Cancelar</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .registration-card {
      max-width: 900px;
      margin: 0 auto;
    }

    .scanner-section {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
    }
  `]
})
export class ProductRegistrationComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  scannedCode: string = '';
  manualCode: string = '';
  existingProduct: Product | null = null;
  isLoading = false;
  isScanning = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private scannerService: ScannerService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tipo: ['', Validators.required],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Escuchar eventos del scanner
    this.scannerService.scannedCode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((code: string) => {
        this.handleScannedCode(code);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleScannedCode(code: string): void {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      return;
    }

    this.scannedCode = normalizedCode;
    this.manualCode = '';
    this.isScanning = true;

    // Buscar si el producto ya existe
    this.apiService.getProductByBarcode(normalizedCode)
      .pipe(finalize(() => {
        this.isScanning = false;
      }))
      .subscribe({
      next: (product: Product | null) => {
        if (!product) {
          this.existingProduct = null;
          this.productForm.reset({ cantidad: 0, precioUnitario: 0 });
          this.snackBar.open('Producto nuevo. Completa el formulario para registrarlo.', 'Cerrar', { duration: 3000 });
          return;
        }

        this.existingProduct = product;
        this.populateForm(product);
        this.snackBar.open('Producto encontrado. Actualiza la cantidad para agregar stock.', 'Cerrar', { duration: 3000 });
      },
      error: (error: unknown) => {
        this.snackBar.open('Error al buscar el producto', 'Cerrar', { duration: 3000 });
      }
    });
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

    this.handleScannedCode(code);
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      nombre: product.nombre,
      marca: product.marca,
      modelo: product.modelo,
      tipo: product.tipo,
      precioUnitario: product.precioUnitario,
      cantidad: 0 // Para agregar más unidades
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.existingProduct) {
      // Actualizar stock del producto existente
      const cantidadAgregar = this.productForm.value.cantidad;
      this.apiService.updateStock(this.existingProduct._id!, {
        cantidad: cantidadAgregar,
        operacion: 'add'
      }).subscribe({
        next: (product: Product) => {
          this.snackBar.open(`Stock actualizado. Nuevo total: ${product.cantidad} unidades`, 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.snackBar.open('Error al actualizar el stock', 'Cerrar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      // Crear nuevo producto
      const productData = {
        ...this.productForm.value,
        barcode: this.scannedCode || undefined
      };

      this.apiService.createProduct(productData).subscribe({
        next: (product: Product) => {
          this.snackBar.open(`Producto "${product.nombre}" registrado exitosamente`, 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.snackBar.open('Error al registrar el producto', 'Cerrar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset({ cantidad: 0, precioUnitario: 0 });
    this.scannedCode = '';
    this.manualCode = '';
    this.existingProduct = null;
  }
}
