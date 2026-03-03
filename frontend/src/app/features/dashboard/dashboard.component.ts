import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatListModule
  ],
  template: `
    <div class="container-main">
      <h1 class="text-3xl font-bold mb-6">Dashboard - 🛠️Emi Repuestos⚙️</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Products -->
        <mat-card class="stats-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Productos</p>
              <h2 class="text-3xl font-bold text-indigo-600">{{ totalProducts }}</h2>
            </div>
            <mat-icon class="text-indigo-500 text-5xl">inventory_2</mat-icon>
          </div>
        </mat-card>

        <!-- Today's Sales -->
        <mat-card class="stats-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Ventas del Día</p>
              <h2 class="text-3xl font-bold text-green-600">{{ todaySales.count }}</h2>
              <p class="text-xs text-gray-500 mt-1">\${{ todaySales.total | number:'1.0-0' }}</p>
            </div>
            <mat-icon class="text-green-500 text-5xl">point_of_sale</mat-icon>
          </div>
        </mat-card>

        <!-- Low Stock Alert -->
        <mat-card class="stats-card" [class.border-orange-500]="lowStockProducts.length > 0">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Productos Bajo Stock</p>
              <h2 class="text-3xl font-bold" [class.text-orange-600]="lowStockProducts.length > 0" [class.text-gray-400]="lowStockProducts.length === 0">
                {{ lowStockProducts.length }}
              </h2>
            </div>
            <mat-icon class="text-5xl" [class.text-orange-500]="lowStockProducts.length > 0" [class.text-gray-400]="lowStockProducts.length === 0">
              warning
            </mat-icon>
          </div>
        </mat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Accesos Rápidos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-3">
              <button mat-raised-button color="primary" class="w-full" routerLink="/inventory/register">
                <mat-icon>add_circle</mat-icon>
                Registrar Producto
              </button>
              <button mat-raised-button color="accent" class="w-full" routerLink="/sales/cart">
                <mat-icon>shopping_cart</mat-icon>
                Nueva Venta
              </button>
              <button mat-stroked-button class="w-full" routerLink="/inventory/list">
                <mat-icon>list</mat-icon>
                Ver Inventario
              </button>
              <button mat-stroked-button class="w-full" routerLink="/history">
                <mat-icon>history</mat-icon>
                Historial de Ventas
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Low Stock Products -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Productos con Bajo Stock</mat-card-title>
            <mat-card-subtitle>Menos de 5 unidades</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (lowStockProducts.length > 0) {
              <mat-list>
                @for (product of lowStockProducts; track product._id) {
                  <mat-list-item>
                    <div class="flex justify-between items-center w-full">
                      <div>
                        <p class="font-semibold">{{ product.nombre }}</p>
                        <p class="text-sm text-gray-600">{{ product.marca }} - {{ product.modelo }}</p>
                      </div>
                      <span class="px-3 py-1 rounded-full text-sm font-semibold" [class]="getStockBadgeClass(product.cantidad)">
                        {{ product.cantidad }} unid.
                      </span>
                    </div>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-6xl text-gray-300">check_circle</mat-icon>
                <p class="mt-2">Todos los productos tienen stock suficiente</p>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Top Products -->
      @if (topProducts.length > 0) {
        <mat-card class="mt-6">
          <mat-card-header>
            <mat-card-title>Productos Más Vendidos</mat-card-title>
            <mat-card-subtitle>Top 5</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              @for (product of topProducts; track product._id; let i = $index) {
                <div class="p-4 bg-gray-50 rounded-lg text-center">
                  <div class="text-2xl font-bold text-indigo-600">#{{ i + 1 }}</div>
                  <p class="font-semibold mt-2">{{ product.nombre }}</p>
                  <p class="text-sm text-gray-600">{{ product.marca }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ product.totalVendido }} vendidos</p>
                  <p class="text-xs font-semibold text-green-600">\${{ product.ingresos | number:'1.0-0' }}</p>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .stats-card {
      transition: transform 0.2s;
    }

    .stats-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    mat-icon.text-5xl {
      width: 60px;
      height: 60px;
      font-size: 60px;
    }
  `]
})
export class DashboardComponent implements AfterViewInit {
  totalProducts = 0;
  todaySales = { count: 0, total: 0 };
  lowStockProducts: Product[] = [];
  topProducts: any[] = [];

  constructor(private apiService: ApiService) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    // Total products
    this.apiService.getTotalProductsCount().subscribe({
      next: (count) => {
        this.totalProducts = count;
      },
      error: (error) => console.error('Error loading total products:', error)
    });

    // Today's sales
    this.apiService.getTodaySales().subscribe({
      next: (sales) => {
        this.todaySales = sales;
      },
      error: (error) => console.error('Error loading today sales:', error)
    });

    // Low stock products
    this.apiService.getLowStockProducts(5).subscribe({
      next: (products) => {
        this.lowStockProducts = products;
      },
      error: (error) => console.error('Error loading low stock products:', error)
    });

    // Top products
    this.apiService.getTopProducts(5).subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => console.error('Error loading top products:', error)
    });
  }

  getStockBadgeClass(cantidad: number): string {
    if (cantidad === 0) return 'bg-red-100 text-red-800';
    if (cantidad < 3) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  }
}
