import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthGuardService } from './login/auth-guard.service';
import { AuthService } from './login/auth.service';
import { WebsocketService } from './services/websocket.service';
import { HassService } from './services/hass.service';

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
  MatButtonToggleModule,
  MatSnackBarModule,
  MatGridListModule,
  MatDialogModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LightComponent } from './light/light.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { NickNamePipe, CapitalizeFirstPipe } from './custom.pipe';
import { ClimateTileComponent, ClimateDialogComponent } from './climate-tile/climate-tile.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    MapComponent,
    PanelComponent,
    LightComponent,
    SnackbarComponent,
    NickNamePipe,
    CapitalizeFirstPipe,
    ClimateTileComponent,
    ClimateDialogComponent
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
    MatButtonToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    AngularDraggableModule,
    MatGridListModule,
    FormsModule
  ],
  providers: [AuthGuardService, AuthService, WebsocketService, HassService],
  bootstrap: [AppComponent],
  entryComponents: [SnackbarComponent, ClimateDialogComponent]
})
export class AppModule { }
