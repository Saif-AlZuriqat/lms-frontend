import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();
  private nextId = 1;

  success(text: string): void {
    this.push(text, 'success');
  }

  error(text: string): void {
    this.push(text, 'error');
  }

  remove(id: number): void {
    this.messagesSubject.next(this.messagesSubject.value.filter((message) => message.id !== id));
  }

  private push(text: string, type: 'success' | 'error'): void {
    const id = this.nextId++;
    const next = [...this.messagesSubject.value, { id, text, type }];
    this.messagesSubject.next(next);
    setTimeout(() => this.remove(id), 3000);
  }
}
