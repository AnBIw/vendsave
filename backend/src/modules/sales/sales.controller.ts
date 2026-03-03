import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PdfService } from '../../common/services/pdf.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.salesService.findAll(
      startDate,
      endDate,
      limit ? parseInt(limit) : undefined,
      page ? parseInt(page) : undefined,
    );
  }

  @Get('today')
  getTodaySales() {
    return this.salesService.getTodaySales();
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.salesService.getTopProducts(limit ? parseInt(limit) : undefined);
  }

  @Get('receipt/:numeroRecibo')
  findByReceiptNumber(@Param('numeroRecibo') numeroRecibo: string) {
    return this.salesService.findByReceiptNumber(numeroRecibo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @Res() res: Response) {
    try {
      const sale = await this.salesService.findOne(id);
      const pdfBuffer = await this.pdfService.generateReceipt(sale);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=recibo-${sale.numeroRecibo}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error generando recibo PDF' });
    }
  }
}
