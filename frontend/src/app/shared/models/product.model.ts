export interface Product {
  _id?: string;
  barcode: string;
  nombre: string;
  marca: string;
  modelo: string;
  tipo: string;
  precioUnitario: number;
  cantidad: number;
  fechaRegistro?: Date;
  ultimaActualizacion?: Date;
}

export interface CreateProductDto {
  nombre: string;
  marca: string;
  modelo: string;
  tipo: string;
  precioUnitario: number;
  cantidad: number;
  barcode?: string;
}

export interface UpdateProductDto {
  nombre?: string;
  marca?: string;
  modelo?: string;
  tipo?: string;
  precioUnitario?: number;
  cantidad?: number;
}

export interface UpdateStockDto {
  cantidad: number;
  operacion: 'add' | 'subtract';
}
