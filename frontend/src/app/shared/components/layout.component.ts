import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="h-full">
      <mat-sidenav #sidenav mode="side" opened class="w-64">
        <div class="sidenav-header p-4 bg-indigo-600 text-white">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <mat-icon>store</mat-icon>
            Emi Repuestos
          </h2>
          <p class="text-sm text-indigo-100">Gestión de Inventario</p>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <a mat-list-item routerLink="/inventory/register" routerLinkActive="active-link">
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Guardar Producto</span>
          </a>

          <a mat-list-item routerLink="/sales/cart" routerLinkActive="active-link">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Vender</span>
          </a>

          <a mat-list-item routerLink="/inventory/list" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Inventario</span>
          </a>

          <a mat-list-item routerLink="/history" routerLinkActive="active-link">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Historial</span>
          </a>
        </mat-nav-list>

        <div class="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div class="text-xs text-gray-500 text-center">
            <p>🛠️Emi Repuestos⚙️ v1.0.0</p>
            <p>Repuestos de Autos</p>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar-shadow">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="flex-1"></span>
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-icon-button>
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .h-full {
      height: 100vh;
    }

    .w-64 {
      width: 256px;
    }

    .sidenav-header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .active-link {
      background-color: rgba(99, 102, 241, 0.1);
      border-left: 4px solid #6366f1;
      color: #6366f1;
      font-weight: 600;
    }

    .toolbar-shadow {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .content-wrapper {
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
      padding: 0;
    }

    mat-sidenav {
      border-right: 1px solid #e5e7eb;
    }

    mat-sidenav-container {
      background-color: #f5f5f5;
    }

    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 8px;
    }

    mat-nav-list a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class LayoutComponent {}
