import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResourceService } from './resource.service';
import { ActionService } from './action.service';

export interface StoryEvent {
  id: string;
  content: string;
  condition: () => boolean;
  displayed?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  private storyEvents$: BehaviorSubject<StoryEvent[]> = new BehaviorSubject<StoryEvent[]>([]);

  constructor(
    private resourceService: ResourceService,
    private actionService: ActionService
  ) {
    this.initializeStoryEvents();
    this.resourceService.resourceSpent.subscribe(() => this.checkStoryProgress());
    this.resourceService.resourceAcquired.subscribe(() => this.checkStoryProgress());
  }

  getStoryEvents() {
    return this.storyEvents$.asObservable();
  }

  private initializeStoryEvents() {
    const storyEvents: StoryEvent[] = [
      {
        id: 'start',
        content: 'You wake up and find yourself in a forest, with no memory of how you got there. You look around and see a small campfire. You also see a small axe and a small knife.',
        condition: () => this.resourceService.getResourceByName('Wood')?.amount > 0,
      },
      {
        id: 'gatheringWood',
        content: 'You start gathering wood...',
        condition: () => this.resourceService.getResourceByName('Wood')?.amount > 0,
      },
      {
        id: 'enoughWoodForFire',
        content: 'You have enough wood to light a fire.',
        condition: () => {
          return this.actionService.getGameActionById('lightFire')?.condition() ?? false;
        },
      },
    ];

    this.storyEvents$.next(storyEvents);
  }

  private checkStoryProgress() {
    const storyEvents = this.storyEvents$.getValue();
    let updated = false;

    for (const event of storyEvents) {
      if (!event.displayed && event.condition()) {
        event.displayed = true;
        updated = true;
      }
    }

    if (updated) {
      this.storyEvents$.next(storyEvents);
    }
  }
}
