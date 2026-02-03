import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, Sidebar, FormsModule, ReactiveFormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);

    user = signal<User | null>(null);
    loading = signal<boolean>(true);
    saveLoading = signal<boolean>(false);
    message = signal<{ type: 'success' | 'error', text: string } | null>(null);

    profileForm: FormGroup = this.fb.group({
        fullname: ['', [Validators.required, Validators.minLength(3)]],
        email: [{ value: '', disabled: true }],
        role: [{ value: '', disabled: true }],
        organizationName: [{ value: '', disabled: true }]
    });

    ngOnInit(): void {
        this.loadUser();
    }

    loadUser(): void {
        this.loading.set(true);
        this.userService.getCurrentUser().subscribe({
            next: (userData) => {
                this.user.set(userData);
                this.profileForm.patchValue({
                    fullname: userData.fullname,
                    email: userData.email,
                    role: userData.role,
                    organizationName: userData.organizationName
                });
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading user:', err);
                this.loading.set(false);
            }
        });
    }

    onSubmit(): void {
        if (this.profileForm.valid) {
            this.saveLoading.set(true);
            const updatedData = {
                fullname: this.profileForm.value.fullname
            };

            this.userService.updateProfile(updatedData).subscribe({
                next: (updatedUser) => {
                    this.user.set(updatedUser);
                    this.saveLoading.set(false);
                    this.showFeedback('success', 'Profil mis à jour avec succès !');
                },
                error: (err) => {
                    this.saveLoading.set(false);
                    this.showFeedback('error', 'Erreur lors de la mise à jour.');
                }
            });
        }
    }

    private showFeedback(type: 'success' | 'error', text: string): void {
        this.message.set({ type, text });
        setTimeout(() => this.message.set(null), 3000);
    }
}
