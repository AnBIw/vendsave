import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private electronAPI: any;

  constructor() {
    if (this.isElectron()) {
      this.electronAPI = (window as any).electronAPI;
    }
  }

  isElectron(): boolean {
    return !!(window && (window as any).electronAPI);
  }

  getPlatform(): string {
    return this.electronAPI?.platform || 'web';
  }

  send(channel: string, data: any): void {
    if (this.isElectron()) {
      this.electronAPI.send(channel, data);
    }
  }

  receive(channel: string, func: Function): void {
    if (this.isElectron()) {
      this.electronAPI.receive(channel, func);
    }
  }
}
