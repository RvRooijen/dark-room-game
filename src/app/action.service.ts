import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResourceService } from './resource.service';

export interface GameAction {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  cost?: { [resourceName: string]: number };
  condition?: () => boolean;
  action: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ActionService {
  private gameActions: GameAction[] = [];
  private gameActions$ = new BehaviorSubject<GameAction[]>(this.gameActions);

  constructor(private resourceService: ResourceService) {
    this.initializeActions();

    resourceService.resourceSpent.subscribe((resource) => {
      this.checkConditions();
    });

    resourceService.resourceAcquired.subscribe((resource) => {
      this.checkConditions();
    });
  }

  private checkConditions() {
    this.gameActions.forEach((action) => {
      if (action.condition) {
        action.enabled = action.condition();
      }
    });
    this.gameActions$.next(this.gameActions);
  }

  getGameActions() {
    return this.gameActions$.asObservable();
  }

  getGameActionById(id: string): GameAction | undefined {
    return this.gameActions.find((action) => action.id === id);
  }

  enableAction(id: string, enable: boolean) {
    const action = this.getGameActionById(id);
    if (action) {
      action.enabled = enable;
      this.gameActions$.next(this.gameActions);
    }
  }

  performAction(actionId: string) {
    const action = this.getGameActionById(actionId);
    if (action && action.enabled) {
      action.action();
    }
  }

  hasResources(cost: { [resourceName: string]: number } | undefined) {
    for (const resourceName in cost) {
      const resource = this.resourceService.getResourceByName(resourceName);
      if (resource) {
        if (resource.amount < cost[resourceName]) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  private initializeActions() {
    this.gameActions = [
      {
        id: 'gatherWood',
        name: 'Gather Wood',
        description: 'Gather wood from the forest.',
        enabled: true,
        action: () => this.resourceService.acquireResource('Wood', 1)
      },
      {
        id: 'lightFire',
        name: 'Light Fire',
        description: 'Light a fire to keep warm.',
        enabled: false,
        cost: { Wood: 10 },
        condition: () => {
          let cost = this.getGameActionById('lightFire')?.cost;
          return this.hasResources(cost);
        },
        action: () => {
          let cost = this.getGameActionById('lightFire')?.cost;
          this.resourceService.spendResources(cost);
          this.resourceService.acquireResource('Fire', 1);
        }
      }
    ];

    this.gameActions$.next(this.gameActions);
  }
}
