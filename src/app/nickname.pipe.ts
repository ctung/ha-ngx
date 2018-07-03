import { Pipe, PipeTransform } from '@angular/core';

// pipe to shorten strings to make them suitable for buttons
@Pipe({name: 'nickName'})
export class NickNamePipe implements PipeTransform {
  transform(value: string): string {
    const val = value.split(' ')[0];
    if (val.length <= 4) { return val; }
    return val.substr(0, 3);
  }
}
