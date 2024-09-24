import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ImportDataComponent } from './app/import-data/import-data.component';
import { SpecReaderComponent } from './app/spec-reader/spec-reader.component';
import { provideRouter, RouterModule, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

const routes = [
  {
    path: '',
    loadComponent: () =>
      import('./app/import-data/import-data.component').then(
        (m) => m.ImportDataComponent
      ),
  },
  {
    path: 'spec-reader',
    loadComponent: () =>
      import('./app/spec-reader/spec-reader.component').then(
        (m) => m.SpecReaderComponent
      ),
  },
];
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    ImportDataComponent,
    SpecReaderComponent,
  ],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), 
  ],
});