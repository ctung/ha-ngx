import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthGuardService } from './login/auth-guard.service';
import { AuthService } from './login/auth.service';
import { WebsocketService } from './websocket.service';
import { HassService } from './hass.service';

import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { PanelComponent } from './panel/panel.component';

import {
  MatSidenavModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatInputModule,
  MatSliderModule,
  MatButtonToggleModule
 } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LightComponent } from './light/light.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    MapComponent,
    PanelComponent,
    LightComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    MatSliderModule,
    MatButtonToggleModule
  ],
  providers: [AuthGuardService, AuthService, WebsocketService, HassService],
  bootstrap: [AppComponent]
})
export class AppModule { }
