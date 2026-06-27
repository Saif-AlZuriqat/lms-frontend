import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { BASE_URL } from '../../types/course-builder.types';

interface ExtensionRequest {
  id: number;
  user: {
    fullName: string;
    email: string;
  };
  enrollment: {
    course: {
      title: string;
    };
    deadline: string | null;
  };
  requestedAt: string;
}

@Component({
  selector: 'app-hr-extension-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hr-extension-requests.html',
  styleUrl: './hr-extension-requests.css'
})
export class HrExtensionRequests implements OnInit {
  requests = signal<ExtensionRequest[]>([]);
  isLoading = signal(true);
  error = signal('');

  // Modal State
  resolveModalOpen = false;
  selectedRequest: ExtensionRequest | null = null;
  isApproving = true; // true = approve, false = reject
  extensionValue: number | null = null;
  extensionUnit = '';
  isSubmitting = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    void this.loadRequests();
  }

  async loadRequests() {
    this.isLoading.set(true);
    this.error.set('');
    try {
      const token = this.authService.getToken();
      const response = await fetch(`${BASE_URL}/api/ExtensionRequest/Pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch pending requests');
      const data = await response.json();
      this.requests.set(data);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  openResolveModal(req: ExtensionRequest, approve: boolean) {
    this.selectedRequest = req;
    this.isApproving = approve;
    this.resolveModalOpen = true;
    this.extensionValue = null;
    this.extensionUnit = '';
  }

  closeModal() {
    this.resolveModalOpen = false;
    this.selectedRequest = null;
  }

  async submitResolution() {
    if (!this.selectedRequest) return;
    
    if (this.isApproving && (!this.extensionValue || !this.extensionUnit)) {
      return;
    }

    this.isSubmitting = true;
    try {
      const token = this.authService.getToken();
      const response = await fetch(`${BASE_URL}/api/ExtensionRequest/Resolve/${this.selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          Approve: this.isApproving,
          ExtensionValue: this.extensionValue,
          ExtensionUnit: this.extensionUnit
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to resolve request: ${errText}`);
      }
      
      this.closeModal();
      void this.loadRequests(); // Refresh list
    } catch (err) {
      alert((err as Error).message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
