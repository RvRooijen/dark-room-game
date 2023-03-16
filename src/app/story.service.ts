import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Resource, ResourceService} from './resource.service';
import { ActionService } from './action.service';

export interface StoryEvent {
  id: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  private storyEvents: StoryEvent[] = [];
  private storyEvents$ = new BehaviorSubject<StoryEvent[]>([]);

  constructor(private resourceService: ResourceService, private actionService: ActionService) {
    this.resourceService.resourceAcquired.subscribe((resource: Resource) => {
      this.checkStoryConditions();
    });

    this.resourceService.resourceSpent.subscribe((resource: Resource) => {
      this.checkStoryConditions();
    });
  }

  getStoryEvents() {
    return this.storyEvents$.asObservable();
  }

  addStoryEvent(content: string) {
    const id = `storyEvent-${Date.now()}`;
    const storyEvent: StoryEvent = { id, content };
    this.storyEvents.unshift(storyEvent);
    this.storyEvents$.next(this.storyEvents);
  }

  checkStoryConditions() {
    const woodResource = this.resourceService.getResourceByName('Wood');
    if (woodResource && woodResource.amount >= 10) {
      this.addStoryEvent('You have gathered enough wood to light a fire.');
      this.actionService.enableAction('lightFire', true);
    }
  }
}
