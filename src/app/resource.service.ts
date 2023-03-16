import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoryService } from './story.service';
import { interval } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';


export interface Resource {
  name: string;
  amount: number;
  maxAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private resources: Resource[] = [
    { name: 'Warmth', amount: 0, maxAmount: 100 },
    { name: 'Wood', amount: 0, maxAmount: 100 },
    { name: 'Fire', amount: 0, maxAmount: 100 },
  ];

  private resources$ = new BehaviorSubject<Resource[]>(this.resources);

  resourceAcquired = new EventEmitter<Resource>();
  resourceSpent = new EventEmitter<Resource>();

  private resourceUpdateInterval = 1000; // In milliseconds, set the desired interval between updates

  constructor() {
    // Set up the interval to update resources
    interval(this.resourceUpdateInterval)
      .pipe(
        startWith(0),
        tap(() => this.updateResources())
      )
      .subscribe();
  }

  private updateResources(): void {
    for (const resource of this.resources) {
      const resourceMappings = this.resourceGenerationMapping[resource.name];

      if (resourceMappings) {
        for (const mapping of resourceMappings) {
          const targetResource = this.resources.find(res => res.name === mapping.resourceName);

          if (targetResource) {
            // Generate resources based on the production value and mapping amount
            targetResource.amount += mapping.amount * resource.amount;

            // Ensure that the amount of resources never goes negative
            targetResource.amount = Math.max(0, targetResource.amount);

            this.resourceAcquired.emit(resource);
          }
        }
      }
    }

    // Notify the subscribers of the updated resources
    this.resources$.next(this.resources);
  }

  private resourceGenerationMapping: { [key: string]: { resourceName: string; amount: number }[] } = {
    Fire: [
      { resourceName: 'Warmth', amount: 0.01 }
    ],
    // Add more mappings for other resources if needed
  };

  getResources() {
    return this.resources$.asObservable();
  }

  getResourceByName(name: string): Resource {
    return this.resources.find((resource) => resource.name === name) as Resource;
  }

  acquireResource(resourceName: string, amount: number): void {
    const resource = this.resources.find(res => res.name === resourceName);

    if (resource) {
      resource.amount = Math.min(resource.amount + amount, resource.maxAmount);
      this.resources$.next(this.resources);
      this.resourceAcquired.emit(resource);
    }
  }

  spendResources(cost: { [resourceName: string]: number } | undefined) {
    for (const resourceName in cost) {
      const resource = this.getResourceByName(resourceName);
      if (resource) {
        resource.amount = Math.max(0, resource.amount - cost[resourceName]);
      }

      this.resourceSpent.emit(resource);
    }
    this.resources$.next(this.resources);
  }
}
