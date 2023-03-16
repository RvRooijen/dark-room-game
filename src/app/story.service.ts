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
  private storyEvents: StoryEvent[] = [];

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
    this.storyEvents = [
      {
        id: 'start',
        content: 'You wake up and find yourself in a forest, with no memory of how you got there. You look around and see a small campfire. You also see a small axe and a small knife.',
        condition: () => true,
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
      {
        id: 'warmth',
        content: 'You start to feel a little bit warmer...',
        condition: () => {
          return this.resourceService.getResourceByName('Warmth')?.amount > 0.1;
        },
      },
    ];
  }

  private checkStoryProgress() {
    let updated = false;

    for (const event of this.storyEvents) {
      if (!event.displayed && event.condition()) {
        event.displayed = true;
        updated = true;
        this.storyEvents$.next([...this.storyEvents$.getValue(), event]);
      }
    }
  }
}
