import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductRegistrationComponent } from './features/inventory/product-registration.component';
import { ProductListComponent } from './features/inventory/product-list.component';
import { ShoppingCartComponent } from './features/sales/shopping-cart.component';
import { ReceiptComponent } from './features/sales/receipt.component';
import { SalesHistoryComponent } from './features/history/sales-history.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventory/register', component: ProductRegistrationComponent },
      { path: 'inventory/list', component: ProductListComponent },
      { path: 'sales/cart', component: ShoppingCartComponent },
      { path: 'sales/receipt/:id', component: ReceiptComponent },
      { path: 'history', component: SalesHistoryComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
