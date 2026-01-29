import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IdeaFrontend } from '../../dashb/dashb';

@Component({
  selector: 'app-add-idea',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-idea.html',
  styleUrls: ['./add-idea.css']
})
export class AddIdea {
  @Output() ideaAdded = new EventEmitter<IdeaFrontend>();
  ideaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ideaForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['Général', Validators.required],
      author: ['', Validators.required],
      priority: ['Moyenne', Validators.required], // Nouveau champ
    });
  }

  submitIdea() {
    if (this.ideaForm.invalid) return;

    const newIdea: IdeaFrontend = {
      id: Date.now(),
      title: this.ideaForm.value.title,
      description: this.ideaForm.value.description,
      category: this.ideaForm.value.category,
      author: this.ideaForm.value.author,
      authorAvatar: '🧑',
      date: new Date().toLocaleDateString(),
      votesCount: 0,
      commentsCount: 0,
      status: 'En attente'
    };

    this.ideaAdded.emit(newIdea);
    this.ideaForm.reset({ category: 'Général', priority: 'Moyenne' });
  }
}
