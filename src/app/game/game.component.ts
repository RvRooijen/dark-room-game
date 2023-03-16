import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionService, GameAction } from '../action.service';
import { Subscription } from 'rxjs';
import {Resource, ResourceService} from "../resource.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  gameActions: GameAction[] = [];
  resources: Resource[] = [];
  private gameActionsSubscription: Subscription | undefined;

  gameActions$ = this.actionService.getGameActions();

  constructor(private actionService: ActionService, private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.gameActionsSubscription = this.actionService.getGameActions().subscribe((gameActions) => {
      this.gameActions = gameActions;
    });

    this.resourceService.getResources().subscribe((resources) => {
      this.resources = resources;
    });
  }

  ngOnDestroy(): void {
    if (this.gameActionsSubscription) {
      this.gameActionsSubscription.unsubscribe();
    }
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
