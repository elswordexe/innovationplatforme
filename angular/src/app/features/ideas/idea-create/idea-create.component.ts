import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IdeaService } from '../../../core/services/idea.service';

interface OrganizationOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-idea-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Nouvelle idee</h1>
        <p class="text-slate-500 mb-8">Proposez une innovation pour votre organisation.</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
            <input
              type="text"
              formControlName="title"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#915506]/20 focus:border-[#915506]"
              placeholder="Ex: Plateforme d'innovation interne" />
            <p *ngIf="form.controls.title.touched && form.controls.title.invalid" class="text-xs text-red-600 mt-1">Titre obligatoire</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="5"
              formControlName="description"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#915506]/20 focus:border-[#915506]"
              placeholder="Decrivez clairement l'idee..."></textarea>
            <p *ngIf="form.controls.description.touched && form.controls.description.invalid" class="text-xs text-red-600 mt-1">Description obligatoire</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
            <select
              formControlName="organizationId"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#915506]/20 focus:border-[#915506]">
              <option [ngValue]="null">Selectionner une organisation</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.name }}</option>
            </select>
            <p *ngIf="orgError" class="text-xs text-red-600 mt-1">{{ orgError }}</p>
          </div>

          <div class="flex items-center justify-between pt-4">
            <button type="button" class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium" (click)="onCancel()">
              Annuler
            </button>
            <button type="submit" class="bg-[#915506] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#7a4605]">
              Creer l'idee
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class IdeaCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ideaService = inject(IdeaService);
  private http = inject(HttpClient);
  private router = inject(Router);

  organizations: OrganizationOption[] = [];
  orgError = '';

  form = this.fb.group({
    title: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.nonNullable.control('', Validators.required),
    organizationId: this.fb.control<number | null>(null, Validators.required)
  });

  ngOnInit() {
    this.loadOrganizations();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    if (rawValue.organizationId === null) {
      this.orgError = "Veuillez selectionner une organisation.";
      return;
    }

    const payload = {
      title: rawValue.title,
      description: rawValue.description,
      organizationId: rawValue.organizationId
    };
    const userId = this.readCurrentUserId();

    this.ideaService.createIdea(payload, userId ?? undefined).subscribe({
      next: () => {
        this.router.navigate(['/ideas']);
      },
      error: (err) => {
        console.error('Create idea failed:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/ideas']);
  }

  private loadOrganizations() {
    this.http.get<any[]>('/api/organizations').subscribe({
      next: (data) => {
        this.organizations = (data || []).map((org) => ({
          id: org.id,
          name: org.name || org.organizationName || 'Organisation'
        }));
      },
      error: () => {
        this.orgError = "Impossible de charger les organisations.";
        this.organizations = [];
      }
    });
  }

  private readCurrentUserId(): number | null {
    const stored = localStorage.getItem('userId');
    if (!stored) {
      return null;
    }
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
