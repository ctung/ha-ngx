import { Component, AfterViewInit } from '@angular/core';
import * as _ from 'raphael';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  ngAfterViewInit() {
    const paper = Raphael(10, 50, 320, 200);
    const circle = paper.circle(50, 40, 10);
    circle.attr('fill', '#f00');

    // Sets the stroke attribute of the circle to white
    circle.attr('stroke', '#fff');

    circle.click(this.click);
  }

  click() {
    console.log('foo');
  }
}
