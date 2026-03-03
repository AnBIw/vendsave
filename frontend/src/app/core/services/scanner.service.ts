import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private scannedCodeSubject = new Subject<string>();
  public scannedCode$: Observable<string> = this.scannedCodeSubject.asObservable();

  private buffer: string = '';
  private lastKeyTime: number = 0;
  private readonly scannerThreshold = 100; // ms entre teclas para detectar scanner

  constructor() {
    this.initScannerListener();
  }

  private normalizeScannedCode(code: string): string {
    return code.replace(/[\r\n\t]/g, '').trim();
  }

  private initScannerListener(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', (event: KeyboardEvent) => {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastKeyTime;

        // Si es Enter, procesar el buffer
        if (event.key === 'Enter') {
          const normalizedCode = this.normalizeScannedCode(this.buffer);
          if (normalizedCode.length > 3) {
            this.scannedCodeSubject.next(normalizedCode);
            this.buffer = '';
          } else {
            // Limpiar buffer si es entrada manual
            this.buffer = '';
          }
          this.lastKeyTime = 0;
          return;
        }

        // Detectar si es entrada rápida (scanner)
        if (timeDiff < this.scannerThreshold || this.lastKeyTime === 0) {
          // Agregar al buffer solo caracteres válidos
          if (event.key.length === 1) {
            this.buffer += event.key;
            this.lastKeyTime = currentTime;
          }
        } else {
          // Tiempo excedido, reiniciar buffer (entrada manual)
          this.buffer = event.key.length === 1 ? event.key : '';
          this.lastKeyTime = currentTime;
        }

        // Limpiar buffer si se excede cierto tamaño (seguridad)
        if (this.buffer.length > 50) {
          this.buffer = '';
          this.lastKeyTime = 0;
        }
      });
    }
  }

  // Método para simular escaneo (útil para pruebas)
  simulateScan(code: string): void {
    const normalizedCode = this.normalizeScannedCode(code);
    if (normalizedCode.length > 3) {
      this.scannedCodeSubject.next(normalizedCode);
    }
  }

  // Resetear estado
  reset(): void {
    this.buffer = '';
    this.lastKeyTime = 0;
  }
}
