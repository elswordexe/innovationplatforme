import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IdeaFrontend } from '../../dashb/dashb';
import { UserProfileService } from '../../../services/user-profile.service';
import { IdeaService } from '../../../services/idea';

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
  imageFile?: File | null = null;
  imagePreview: string | null = null;
  attachments: { file: File; preview: string; name: string; fileType: string }[] = [];
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private ideaService: IdeaService
  ) {
    this.ideaForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['Général', Validators.required],
      priority: ['Moyenne', Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onAttachmentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      if (!this.attachments.find(a => a.file.name === file.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          this.attachments.push({
            file,
            name: file.name,
            fileType: file.type || 'application/octet-stream',
            preview: reader.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  submitIdea() {
    if (this.ideaForm.invalid) {
      console.log('[DEBUG AddIdea] Form invalid:', this.ideaForm.value);
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = null;

    const userId = parseInt(localStorage.getItem('userId') || '1');

    // Prepare image data separately from attachments
    let imageData: any = null;
    if (this.imageFile && this.imagePreview) {
      imageData = {
        fileName: this.imageFile.name,
        fileType: this.imageFile.type,
        dataBase64: this.imagePreview.split(',')[1] // Remove data:image/...;base64, prefix
      };
    }

    const formValues = this.ideaForm.value;
    const newIdea: any = {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category || 'Général',
      priority: formValues.priority || 'Moyenne',
      image: imageData, // Send image data separately
      attachments: this.attachments.map(a => ({
        fileName: a.name,
        fileType: a.fileType,
        dataBase64: a.preview.split(',')[1] // Remove data:...;base64, prefix
      }))
    };

    console.log('[DEBUG AddIdea] Submitting idea with image:', !!imageData);
    console.log('[DEBUG AddIdea] Attachments count:', newIdea.attachments.length);
    console.log('[DEBUG AddIdea] Form values:', formValues);
    console.log('[DEBUG AddIdea] Final payload:', newIdea);

    this.ideaService.createIdeaWithImage(newIdea, userId).subscribe({
      next: (createdIdea) => {
        console.log('[DEBUG AddIdea] Idea created successfully:', createdIdea);
        
        // Convert backend idea to frontend format
        const frontendIdea: IdeaFrontend = {
          id: createdIdea.id,
          title: createdIdea.title,
          description: createdIdea.description,
          author: 'Vous',
          authorAvatar: '👤',
          date: new Date().toLocaleDateString(),
          votesCount: 0,
          commentsCount: 0,
          category: createdIdea.category || 'Général',
          status: createdIdea.status || 'DRAFT',
          hasVoted: false,
          userVoteId: undefined,
          isBookmarked: false,
          bookmarkCount: 0,
          bookmarkId: undefined
        };
        
        console.log('[DEBUG AddIdea] Emitting frontend idea:', frontendIdea);
        this.ideaAdded.emit(frontendIdea);
        this.ideaForm.reset({ category: 'Général', priority: 'Moyenne' });
        this.imagePreview = null;
        this.imageFile = null;
        this.attachments = [];
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erreur création idée', err);
        this.errorMessage = 'Erreur lors de la création de l\'idée. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }
}
