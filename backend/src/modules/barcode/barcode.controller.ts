import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { BarcodeService } from './barcode.service';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post('generate')
  async generateCode(@Body('tipo') tipo: string) {
    const code = await this.barcodeService.generateUniqueCode(tipo);
    return { code };
  }

  @Get('image/:code')
  async getBarcodeImage(@Param('code') code: string, @Res() res: Response) {
    try {
      const imageBuffer = await this.barcodeService.generateBarcodeImage(code);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename=barcode-${code}.png`);
      res.send(imageBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error generando imagen de código de barras' });
    }
  }
}
