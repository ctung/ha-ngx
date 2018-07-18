import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

interface Options {
  diameter: number;
  minValue: number; // Minimum value for target temperature
  maxValue: number; // Maximum value for target temperature
  numTicks: number; // Number of tick lines to display around the dial
}

interface State {
  away: boolean;
  has_leaf: boolean;
  hvac_state: string;
  ambient_temperature: number;
  target_temperature: number;
}

declare var Snap: any;

@Component({
  selector: 'app-nest-dial',
  templateUrl: './nest-dial.component.html',
  styleUrls: ['./nest-dial.component.scss']
})
export class NestDialComponent implements OnInit, AfterViewInit {
  @Input() options: Options;
  @Input() state: Observable<State>;
  @Output() onmove = new EventEmitter<any>();
  @Output() onstart = new EventEmitter<any>();
  @Output() onend = new EventEmitter<any>();
  localState: State;
  inProgress = false;

  dial: any;
  tickArray: any;
  lblTarget: any;
  lblTargetHalf: any;
  lblAmbient: any;
  lblAway: any;
  icoLeaf: any;
  properties: any;
  tickPoints: any;
  tickPointsLarge: any;
  theta: number;
  nestId: string;

  constructor() { }

  ngOnInit() {
    /*
     * Properties - calculated from options in many cases
     */
    this.nestId = '_' + Math.random().toString(36).substr(2, 9);

    this.properties = {
      tickDegrees: 300, //  Degrees of the dial that should be covered in tick lines
      rangeValue: this.options.maxValue - this.options.minValue,
      radius: this.options.diameter / 2,
      ticksOuterRadius: this.options.diameter / 30,
      ticksInnerRadius: this.options.diameter / 8,
      hvac_states: ['off', 'heating', 'cooling'],
      dragLockAxisDistance: 15,
      lblAmbientPosition: null,
      offsetDegrees: null
    };

    this.tickPoints = [
      [this.properties.radius - 1, this.properties.ticksOuterRadius],
      [this.properties.radius + 1, this.properties.ticksOuterRadius],
      [this.properties.radius + 1, this.properties.ticksInnerRadius],
      [this.properties.radius - 1, this.properties.ticksInnerRadius]
    ];

    this.tickPointsLarge = [
      [this.properties.radius - 1.5, this.properties.ticksOuterRadius],
      [this.properties.radius + 1.5, this.properties.ticksOuterRadius],
      [this.properties.radius + 1.5, this.properties.ticksInnerRadius + 20],
      [this.properties.radius - 1.5, this.properties.ticksInnerRadius + 20]
    ];

    this.theta = this.properties.tickDegrees / this.options.numTicks;
    this.properties.lblAmbientPosition = [
      this.properties.radius, this.properties.ticksOuterRadius - (this.properties.ticksOuterRadius - this.properties.ticksInnerRadius) / 2
    ];
    this.properties.offsetDegrees = 180 - (360 - this.properties.tickDegrees) / 2;

    this.state.subscribe(x => {
      this.localState = x;
      this.render();
    });
  }

  ngAfterViewInit() {
    this.drawDial();
    this.render();
  }

  onMove(dx, dy, x, y, e) {
    if (this.inProgress) {
      this.onmove.emit([dx, dy, x, y, e]);
    }
  }
  onStart(x, y, e) {
    setTimeout(() => {
      this.dial.addClass('dial--edit');
      this.inProgress = true;
      this.onstart.emit([x, y, e]);
    }, 1000);
  }
  onEnd(x, y, e) {
    this.dial.removeClass('dial--edit');
    this.inProgress = false;
    this.onend.emit([x, y, e]);
  }

  render() {
    if (this.dial) {
      this.renderTicks();
      this.renderTargetTemperature();
      this.renderAmbientTemperature();
      this.renderAway();
      this.renderLeaf();
      this.renderHvacState();
    }
  }

  drawDial() {
    const radius = this.properties.radius;
    this.dial = Snap('#' + this.nestId);
    this.dial.attr({ viewBox: '0 0 ' + this.options.diameter + ' ' + this.options.diameter });
    this.dial.addClass('dial');
    const circle = this.dial.circle(radius, radius, radius);
    circle.addClass('dial__shape');
    const editCircle = this.dial.path(this.donutPath(radius, radius, radius - 4, radius - 8));
    editCircle.addClass('dial__editableIndicator');

    this.dial.drag(
      this.onMove.bind(this),
      this.onStart.bind(this),
      this.onEnd.bind(this)
    );

    /*
     * Ticks
     */
    const ticks = this.dial.group();
    ticks.addClass('dial__ticks');
    this.tickArray = [];
    for (let iTick = 0; iTick < this.options.numTicks; iTick++) {
      this.tickArray.push(ticks.path(this.pointsToPath(this.tickPoints)));
    }

    // *************
    // * Labels
    // **********************
    this.lblTarget = this.dial.text(radius, radius, '');
    this.lblTarget.addClass('dial__lbl dial__lbl--target');

    this.lblAmbient = this.dial.text(0, 0, '');
    this.lblAmbient.addClass('dial__lbl dial__lbl--ambient');

    this.lblTargetHalf = this.dial.text(
      radius + radius / 2.5,
      radius - radius / 8, '5');
    this.lblTargetHalf.addClass('dial__lbl dial__lbl--target--half');

    this.lblAway = this.dial.text(radius, radius, 'AWAY');
    this.lblAway.addClass('dial__lbl dial__lbl--away');

    const leafScale = radius / 5 / 100;
    const leafDef = [
      'M', 3, 84, 'c', 24, 17, 51, 18, 73, -6, 'C', 100, 52, 100, 22, 100, 4, 'c', -13, 15, -37, 9, -70, 19,
      'C', 4, 32, 0, 63, 0, 76, 'c', 6, -7, 18, -17, 33, -23, 24, -9, 34, -9, 48, -20, -9, 10, -20, 16, -43, 24,
      'C', 22, 63, 8, 78, 3, 84, 'z'].map(function (x) {
        return isNaN(x as any) ? x : x as number * leafScale;
      }).join(' ');
    const translate = [radius - (leafScale * 100 * 0.5), radius * 1.5];
    this.icoLeaf = this.dial.path(leafDef).transform('t' + translate[0] + ',' + translate[1]);
    this.icoLeaf.addClass('dial__ico__leaf');
  }

  renderTicks() {
    let vMin, vMax;
    if (this.localState.away) {
      vMin = this.localState.ambient_temperature;
      vMax = vMin;
    } else {
      vMin = Math.min(this.localState.ambient_temperature, this.localState.target_temperature);
      vMax = Math.max(this.localState.ambient_temperature, this.localState.target_temperature);
    }
    const min = this.restrictToRange(Math.round((vMin - this.options.minValue)
      / this.properties.rangeValue * this.options.numTicks), 0, this.options.numTicks - 1);
    const max = this.restrictToRange(Math.round((vMax - this.options.minValue)
      / this.properties.rangeValue * this.options.numTicks), 0, this.options.numTicks - 1);

    this.tickArray.forEach((tick, iTick) => {
      const isLarge = iTick === min || iTick === max;
      const isActive = iTick >= min && iTick <= max;
      tick.attr('d', this.pointsToPath(
        this.rotatePoints(
          isLarge ? this.tickPointsLarge : this.tickPoints,
          iTick * this.theta - this.properties.offsetDegrees, [this.properties.radius, this.properties.radius]
        )
      ));
      this.setClass(tick, 'active', isActive);
    });
  }

  // * RENDER - target temperature
  renderTargetTemperature() {
    this.lblTarget.attr({ 'text': Math.floor(this.localState.target_temperature) + '' });
    this.setClass(this.lblTargetHalf, 'shown', this.localState.target_temperature % 1 !== 0);
  }

  // * RENDER - ambient temperature
  renderAmbientTemperature() {
    let ambient_text = Math.floor(this.localState.ambient_temperature) + '';
    if (this.localState.ambient_temperature % 1 !== 0) {
      ambient_text += '⁵';
    }
    this.lblAmbient.attr({ 'text': ambient_text });

    const peggedValue = this.restrictToRange(this.localState.ambient_temperature, this.options.minValue, this.options.maxValue);
    let degs = this.properties.tickDegrees * (peggedValue - this.options.minValue)
      / this.properties.rangeValue - this.properties.offsetDegrees;
    if (peggedValue > this.localState.target_temperature) {
      degs += 8;
    } else {
      degs -= 8;
    }
    const pos = this.rotatePoint(this.properties.lblAmbientPosition, degs, [this.properties.radius, this.properties.radius]);
    this.lblAmbient.attr({ x: pos[0], y: pos[1] });
  }

  // * RENDER - awau
  renderAway() {
    this.setClass(this.dial, 'away', this.localState.away);
  }

  // * RENDER - leaf
  renderLeaf() {
    this.setClass(this.dial, 'has-leaf', this.localState.has_leaf);
  }

  // * RENDER - HVAC state
  renderHvacState() {
    this.dial.attr('class').split(' ').forEach((e: string) => {
      if (e.startsWith('dial--state--')) { this.dial.removeClass(e); }
    });
    this.dial.addClass('dial--state--' + this.localState.hvac_state);
  }

  // **************
  // * Helper functions
  // *******************************************
  setClass(e, c, s) {
    if (s) { e.addClass(c); } else { e.removeClass(c); }
  }

  restrictTargetTemperature(t) {
    return this.restrictToRange(this.roundHalf(t), this.options.minValue, this.options.maxValue);
  }

  circleToPath(cx, cy, r) {
    return [
      'M', cx, ',', cy,
      'm', 0 - r, ',', 0,
      'a', r, ',', r, 0, 1, ',', 0, r * 2, ',', 0,
      'a', r, ',', r, 0, 1, ',', 0, 0 - r * 2, ',', 0,
      'z'
    ].join(' ').replace(/\s,\s/g, ',');
  }

  donutPath(cx, cy, rOuter, rInner) {
    return this.circleToPath(cx, cy, rOuter) + ' ' + this.circleToPath(cx, cy, rInner);
  }

  // Given an array of points, return an SVG path string representing the shape they define
  pointsToPath(points) {
    return points.map(function (point, iPoint) {
      return (iPoint > 0 ? 'L' : 'M') + point[0] + ' ' + point[1];
    }).join(' ') + 'Z';
  }

  // Rotate a cartesian point about given origin by X degrees
  rotatePoint(point, angle, origin) {
    const radians = angle * Math.PI / 180;
    const x = point[0] - origin[0];
    const y = point[1] - origin[1];
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [x1, y1];
  }
  // Rotate an array of cartesian points about a given origin by X degrees
  rotatePoints(points, angle, origin) {
    return points.map((point) => {
      return this.rotatePoint(point, angle, origin);
    });
  }

  // Restrict a number to a min + max range
  restrictToRange(val: number, min: number, max: number) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
  }

  // Round a number to the nearest 0.5
  roundHalf(num) {
    return Math.round(num * 2) / 2;
  }
}
