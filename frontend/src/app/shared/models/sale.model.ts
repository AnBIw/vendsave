export interface SaleItem {
  producto?: string;
  barcode: string;
  nombre: string;
  marca: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Sale {
  _id?: string;
  numeroRecibo: string;
  items: SaleItem[];
  total: number;
  fecha: Date;
}

export interface SaleItemDto {
  productoId: string;
  cantidad: number;
}

export interface CreateSaleDto {
  items: SaleItemDto[];
}
