import { Component } from '@angular/core';
import {MainService} from './main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ScriptMaker';
  constructor(private mainService: MainService) {
    this.mainService.loadSettings();
  }
}
