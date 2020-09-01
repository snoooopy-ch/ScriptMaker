import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MainService} from '../main.service';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

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

      if (value.hasOwnProperty('save_folder')) {
        this.saveFolder = this.settings.save_folder;
      }
      this.cdRef.detectChanges();
      if (value.hasOwnProperty('output_key')) {
        this.setHotKeys();
      }
    });
  }

  ngOnDestroy(): void{
    this.subscribers.settings.unsubscribe();
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
      saveFolder: this.saveFolder
    });
  }

  /**
   * ショートカットキー値を設定します。
   */
  setHotKeys(): void{
    // レス描写エリアの一番上に移動
    this.hotkeysService.add(new Hotkey(this.settings.output_key.toLowerCase(),
      (event: KeyboardEvent): boolean => {
        this.btnOutputClickHandler();
        return false; // Prevent bubbling
      }));

    // レス描写エリアの一番下に移動
    this.hotkeysService.add(new Hotkey(this.settings.make_key.toLowerCase(), (event: KeyboardEvent): boolean => {
      this.btnMakeFileClickHandler();
      return false; // Prevent bubbling
    }));
  }

  btnOutputClickHandler(): void {
    const inputList = this.inputUrls.split('\n');
    this.outputScript = '';
    this.rows = 0;
    for (const line of inputList){
      const items = line.split('\t');
      if (items.length > 6) {
        this.outputScript += `${this.part1}${items[6]}${this.part2}${items[2]}${this.part3}${items[3]}${this.part4}\n`;
        this.rows++;
      }
    }
    this.cdRef.detectChanges();
  }

  btnMakeFileClickHandler(): void {
    this.mainService.makeFiles({
      outputScript: this.outputScript,
      filePrefix: this.filePrefix,
      startRow: this.startRow,
      fileExtension: this.fileExtension,
      saveFolder: this.saveFolder,
      selectedCharset: this.selectedCharset
    });
  }
}
