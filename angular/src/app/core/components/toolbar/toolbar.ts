
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css'],
})
export class Toolbar {
  @Input() title: string = 'Titre';
  @Input() icon: string = '⭐';
}
