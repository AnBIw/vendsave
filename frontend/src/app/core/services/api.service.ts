import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, UpdateStockDto } from '../../shared/models/product.model';
import { Sale, CreateSaleDto } from '../../shared/models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ==================== PRODUCTS ====================
  
  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  getAllProducts(search?: string, tipo?: string, limit?: number, page?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    if (limit) params = params.set('limit', limit.toString());
    if (page) params = params.set('page', page.toString());
    
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getProductByBarcode(code: string): Observable<Product | null> {
    const normalizedCode = code.trim();
    return this.http.get<Product | null>(`${this.baseUrl}/products/barcode/${encodeURIComponent(normalizedCode)}`);
  }

  updateProduct(id: string, updates: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, updates);
  }

  updateStock(id: string, stockData: UpdateStockDto): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/products/${id}/stock`, stockData);
  }

  deleteProduct(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/products/${id}`);
  }

  getLowStockProducts(threshold?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (threshold) params = params.set('threshold', threshold.toString());
    
    return this.http.get<Product[]>(`${this.baseUrl}/products/low-stock`, { params });
  }

  getTotalProductsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/products/count`);
  }

  // ==================== SALES ====================
  
  createSale(sale: CreateSaleDto): Observable<Sale> {
    return this.http.post<Sale>(`${this.baseUrl}/sales`, sale);
  }

  getAllSales(startDate?: string, endDate?: string, limit?: number, page?: number): Observable<Sale[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (limit) params = params.set('limit', limit.toString());
    if (page) params = params.set('page', page.toString());
    
    return this.http.get<Sale[]>(`${this.baseUrl}/sales`, { params });
  }

  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/sales/${id}`);
  }

  getSaleByReceiptNumber(numeroRecibo: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/sales/receipt/${numeroRecibo}`);
  }

  getTodaySales(): Observable<{ count: number; total: number }> {
    return this.http.get<{ count: number; total: number }>(`${this.baseUrl}/sales/today`);
  }

  getTopProducts(limit?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    
    return this.http.get<any[]>(`${this.baseUrl}/sales/top-products`, { params });
  }

  getReceiptPdf(saleId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/sales/${saleId}/receipt`, {
      responseType: 'blob'
    });
  }

  // ==================== BARCODE ====================
  
  generateBarcode(tipo: string): Observable<{ code: string }> {
    return this.http.post<{ code: string }>(`${this.baseUrl}/barcode/generate`, { tipo });
  }

  getBarcodeImage(code: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/barcode/image/${code}`, {
      responseType: 'blob'
    });
  }
}
