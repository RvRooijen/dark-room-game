import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResourceService } from './resource.service';
import { ActionService } from './action.service';

export interface StoryEvent {
  id: string;
  content: string;
  condition: () => boolean;
  displayed: boolean;
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
        displayed: false,
        content: 'You wake up in an ancient, mysterious forest with no memory of how you got there. Your surroundings are filled with strange plants and enchanting sounds.',
        condition: () => true,
      },
      {
        id: 'firstClue',
        displayed: false,
        content: 'While gathering resources, you stumble upon a mysterious, glowing stone, embedded in a tree. It appears to be an ancient artifact.',
        condition: () => this.resourceService.getResourceByName('Wood')?.amount >= 10 && this.resourceService.getResourceByName('Stone')?.amount >= 10,
      },
      {
        id: 'unlockingMagic',
        displayed: false,
        content: 'As you hold the glowing stone, you feel a surge of energy, and your hands start to glow. You have unlocked the ability to manipulate the elements.',
        condition: () => this.resourceService.getResourceByName('Magic')?.amount >= 1,
      },
      {
        id: 'meetingCreatures',
        displayed: false,
        content: 'You come across a group of mystical creatures who seem to be attracted to your magical abilities. They decide to join you on your journey.',
        condition: () => this.resourceService.getResourceByName('MysticalCreatures')?.amount >= 1,
      },
      {
        id: 'discoveringAncientRuins',
        displayed: false,
        content: 'You discover ancient ruins hidden deep within the forest. Inside, you find more artifacts and clues about the forest\'s enigmatic history.',
        condition: () => this.resourceService.getResourceByName('AncientRuins')?.amount >= 1,
      },
      {
        id: 'unravelingTheMystery',
        displayed: false,
        content: 'As you continue to explore the forest and piece together the clues, you begin to unravel the mystery of the ancient civilization that once thrived here.',
        condition: () => this.resourceService.getResourceByName('Clues')?.amount >= 10,
      },
      {
        id: 'finalRevelation',
        displayed: false,
        content: 'You finally uncover the truth about your own past and your connection to the ancient civilization. The forest has been guiding you all along to help you rediscover your true self.',
        condition: () => this.resourceService.getResourceByName('Truth')?.amount >= 1,
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
