import { TestBed, inject } from '@angular/core/testing';

import { HassService } from './hass.service';

describe('HassService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HassService]
    });
  });

  it('should be created', inject([HassService], (service: HassService) => {
    expect(service).toBeTruthy();
  }));
});
