import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionService, GameAction } from '../action.service';
import { Subscription } from 'rxjs';
import {Resource, ResourceService} from "../resource.service";
import {trigger, transition, style, animate, state} from '@angular/animations';
import {StoryEvent, StoryService} from "../story.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-in')
      ]),
      transition(':leave', [
        animate('1s ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
})
export class GameComponent implements OnInit, OnDestroy {
  gameActions: GameAction[] = [];
  storyEvents: StoryEvent[] = [];
  resources: Resource[] = [];
  private gameActionsSubscription: Subscription | undefined;

  gameActions$ = this.actionService.getGameActions();
  storyEvents$ = this.storyService.getStoryEvents();
  latestStoryEvent: StoryEvent | null = null;
  private storyEventsSubscription: Subscription | undefined;

  fadeOut: boolean = false;

  constructor(private actionService: ActionService, private resourceService: ResourceService, private storyService: StoryService) {}

  ngOnInit(): void {
    this.gameActionsSubscription = this.actionService.getGameActions().subscribe((gameActions) => {
      this.gameActions = gameActions;
    });

    this.storyService.getStoryEvents().subscribe((storyEvents) => {
      this.storyEvents = storyEvents;
    });

    this.resourceService.getResources().subscribe((resources) => {
      this.resources = resources;
    });

    this.storyEventsSubscription = this.storyEvents$.subscribe((storyEvents) => {
      this.storyEvents = storyEvents;
      this.latestStoryEvent = this.storyEvents[this.storyEvents.length - 1] ?? null;

      // Fade out the latest story event after a specified duration
      if (this.latestStoryEvent) {
        this.fadeOut = false; // Reset the fadeOut flag
        setTimeout(() => {
          this.fadeOut = true;
        }, 5000); // Set the duration after which the text should fade out (e.g., 3 seconds)
      }
    });

  }

  ngOnDestroy(): void {
    if (this.gameActionsSubscription) {
      this.gameActionsSubscription.unsubscribe();
    }

    this.storyEventsSubscription?.unsubscribe();
  }

  performAction(action: GameAction): void {
    this.actionService.performAction(action.id);
  }

  getActionCosts(action: GameAction): { resourceName: string; amount: number }[] {
    const costs: { resourceName: string; amount: number }[] = [];
    if (action.cost) {
      for (const [resourceName, amount] of Object.entries(action.cost)) {
        costs.push({ resourceName, amount });
      }
    }
    return costs;
  }
}
