import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../core/components/navbar/navbar';
import { Footer } from '../../core/components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, Footer, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  encapsulation: ViewEncapsulation.None,
})
export class Home {}
