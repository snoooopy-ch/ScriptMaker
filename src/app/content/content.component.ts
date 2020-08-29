import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MainService} from '../main.service';

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

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.inputUrls = '';
    this.part1 = '';
    this.part2 = '';
    this.part3 = '';
    this.part4 = '';
    this.rows = 0;
    this.outputScript = '';
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
      this.cdRef.detectChanges();
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
      selectedCharset: this.selectedCharset
    });
  }

  btnOutputClickHandler(): void {
    const inputList = this.inputUrls.split('\n');
    for (const line of inputList){
      const items = line.split('\t');
      if (items.length > 6) {
        this.outputScript += `${this.part1}${items[6]}${this.part1}${this.part2}${items[2]}${this.part3}${items[3]}${this.part4}\n`;
      }
    }
    this.cdRef.detectChanges();
  }
}
