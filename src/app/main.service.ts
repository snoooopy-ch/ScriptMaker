import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class MainService {

  settings = new BehaviorSubject<any>({});
  makeStatus = new BehaviorSubject<any>({});

  constructor() {
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });

    electron.ipcRenderer.on('notifyComplete', (event, value) => {
      this.makeStatus.next(value);
    });
  }

  loadSettings(): void{
    electron.ipcRenderer.send('loadSettings');
  }

  saveSettings(params): void{
    electron.ipcRenderer.send('saveSettings', params);
  }

  makeFiles(params): void{
    electron.ipcRenderer.send('makeFiles', params);
  }

}
