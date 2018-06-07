import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';

import { LoginComponent } from './login.component';
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
  MatInputModule
 } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    MapComponent,
    PanelComponent
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
    MatInputModule
  ],
  providers: [AuthGuardService, AuthService, WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
