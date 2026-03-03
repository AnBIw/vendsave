import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../database/schemas/product.schema';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Genera un código único formato RP-[TIPO]-[SECUENCIA]
   * Ejemplo: RP-MTR-00001
   */
  async generateUniqueCode(tipo: string): Promise<string> {
    const tipoPrefix = tipo.substring(0, 3).toUpperCase();
    let isUnique = false;
    let code = '';
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      // Generar secuencia aleatoria de 5 dígitos
      const sequence = Math.floor(10000 + Math.random() * 90000);
      code = `RP-${tipoPrefix}-${sequence}`;

      // Verificar unicidad en la base de datos
      const existing = await this.productModel.findOne({ barcode: code }).exec();
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('No se pudo generar un código único después de 100 intentos');
    }

    return code;
  }

  /**
   * Genera imagen de código de barras en formato PNG
   * @param code Código a generar
   * @returns Buffer con la imagen PNG
   */
  async generateBarcodeImage(code: string): Promise<Buffer> {
    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128',       // Tipo de código de barras
        text: code,            // Texto a codificar
        scale: 3,              // Factor de escala
        height: 10,            // Altura en milímetros
        includetext: true,     // Incluir texto legible
        textxalign: 'center',  // Alineación del texto
      });

      return png;
    } catch (error) {
      throw new Error(`Error generando código de barras: ${error.message}`);
    }
  }

  /**
   * Valida formato de código de barras
   */
  validateBarcodeFormat(code: string): boolean {
    const pattern = /^RP-[A-Z]{3}-\d{5}$/;
    return pattern.test(code);
  }
}
