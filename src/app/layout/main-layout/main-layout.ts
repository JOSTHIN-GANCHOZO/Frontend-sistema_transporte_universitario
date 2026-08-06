import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly sidebarAbierto = signal(false);

  alternarSidebar(): void {
    this.sidebarAbierto.update((abierto) => !abierto);
  }

  cerrarSidebar(): void {
    this.sidebarAbierto.set(false);
  }
}