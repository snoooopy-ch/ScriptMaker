import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MainService} from '../main.service';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import { ngxLoadingAnimationTypes } from 'ngx-loading';

const electron = (window as any).require('electron');

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit, OnDestroy {
  inputUrls: string;
  part1: string;
  part2: string;
  part3: string;
  part4: string;
  rows: number;
  outputScript: string;
  saveFolder: string;
  selectedCharset: any;
  subscribers: any = {};
  settings: any;
  filePrefix: string;
  startRow: number;
  fileExtension: string;
  isLoading: boolean;
  outputList: string[];
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  completedRows: number;
  public selectedSaveFolder: string;
  saveFolder1: any;
  saveFolder2: any;
  saveFolder3: any;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef, private hotkeysService: HotkeysService) { }

  ngOnInit(): void {
    this.inputUrls = '';
    this.part1 = '';
    this.part2 = '';
    this.part3 = '';
    this.part4 = '';
    this.rows = 0;
    this.outputScript = '';
    this.filePrefix = '';
    this.startRow = 0;
    this.fileExtension = '';
    this.saveFolder = '';
    this.isLoading = false;
    this.outputList = [];
    this.selectedSaveFolder = '1';

    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      if (value.hasOwnProperty('part1')) {
        this.part1 = this.settings.part1;
        this.part2 = this.settings.part2;
        this.part3 = this.settings.part3;
        this.part4 = this.settings.part4;
      }
      if (value.hasOwnProperty('select_charset')) {
        this.selectedCharset = this.settings.select_charset;
      }

      if (value.hasOwnProperty('file_prefix')) {
        this.filePrefix = this.settings.file_prefix;
      }

      if (value.hasOwnProperty('start_row')) {
        this.startRow = this.settings.start_row;
      }

      if (value.hasOwnProperty('file_extension')) {
        this.fileExtension = this.settings.file_extension;
      }

      if (value.hasOwnProperty('save_folder1')) {
        this.saveFolder = this.settings.save_folder1;
        this.saveFolder1 = this.settings.save_folder1;
        this.saveFolder2 = this.settings.save_folder2;
        this.saveFolder3 = this.settings.save_folder3;
      }

      this.cdRef.detectChanges();
      if (value.hasOwnProperty('make_key')) {
        this.setHotKeys();
      }
    });

    this.subscribers.makeStatus = this.mainService.makeStatus.subscribe((value) => {
      if (value.status === 'failure'){
        this.isLoading = false;
        this.cdRef.detectChanges();
      } else if (value.status === 'process'){
        this.completedRows = value.completedRows;
        this.cdRef.detectChanges();
        if (value.completedRows === this.outputList.length){
          let finishTime = 0;
          if (this.outputList.length > 8000){
            finishTime = this.outputList.length * 1.6;
          }
          setTimeout(() => {
            this.isLoading = false;
            this.cdRef.detectChanges();
            electron.ipcRenderer.send('showMessage');
          }, finishTime);
        }
      }
    });
  }

  ngOnDestroy(): void{
    this.subscribers.settings.unsubscribe();
    this.subscribers.makeStatus.unsubscribe();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event): void {
    this.mainService.saveSettings({
      part1: this.part1,
      part2: this.part2,
      part3: this.part3,
      part4: this.part4,
      selectedCharset: this.selectedCharset,
      filePrefix: this.filePrefix,
      startRow: this.startRow,
      fileExtension: this.fileExtension,
      saveFolder1: this.saveFolder1,
      saveFolder2: this.saveFolder2,
      saveFolder3: this.saveFolder3,
    });
  }

  /**
   * ショートカットキー値を設定します。
   */
  setHotKeys(): void{

    this.hotkeysService.add(new Hotkey(this.settings.make_key.toLowerCase(), (event: KeyboardEvent): boolean => {
      this.btnMakeFileClickHandler();
      return false; // Prevent bubbling
    }));
  }

  btnOutputClickHandler(): void {
    // this.isLoading = true;
    // this.output().then(() => {
    //   this.isLoading = false;
    //   this.cdRef.detectChanges();
    // });
  }

  output(): void{
    const inputList = this.inputUrls.split('\n');
    this.outputScript = '';
    this.outputList.length = 0;
    this.rows = 0;
    for (const line of inputList){
      const items = line.split('\t');
      if (items.length > 9) {
        this.outputList.push(`${this.part1}${items[9]}${this.part2}${items[5]}${this.part3}${items[6]}${this.part4}`);
        this.rows++;
      }
    }
    this.cdRef.detectChanges();
  }

  btnMakeFileClickHandler(): void {
    if (this.inputUrls.length > 0) {
      this.isLoading = true;
      this.completedRows = 0;
      this.cdRef.detectChanges();
      this.output();
      if (this.outputList.length > 0) {
        if (this.selectedSaveFolder === '1') {
          this.saveFolder = this.saveFolder1;
        } else if (this.selectedSaveFolder === '2') {
          this.saveFolder = this.saveFolder2;
        } else if (this.selectedSaveFolder === '3') {
          this.saveFolder = this.saveFolder3;
        }
        this.mainService.makeFiles({
          outputList: this.outputList,
          filePrefix: this.filePrefix,
          startRow: this.startRow,
          fileExtension: this.fileExtension,
          saveFolder: (this.saveFolder.endsWith('\\') || this.saveFolder.endsWith('/')) ? this.saveFolder : `${this.saveFolder}\\`,
          selectedCharset: this.selectedCharset
        });
      } else {
        this.isLoading = false;
        electron.remote.dialog.showMessageBoxSync(null, {
          type: 'info',
          title: '生成',
          message: '正確な入力内容がありません'
        });
      }
    } else{

      electron.remote.dialog.showMessageBoxSync(null, {
        type: 'info',
        title: '生成',
        message: '入力内容がありません'
      });
    }
  }

}
