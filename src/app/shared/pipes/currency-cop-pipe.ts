import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCop',
})
export class CurrencyCopPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
