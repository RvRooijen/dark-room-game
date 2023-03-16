import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../resource.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
})
export class ResourceComponent implements OnInit {
  @Input() resource!: Resource;
  resourceName: string = '';

  constructor() {}

  ngOnInit(): void {
    this.resourceName = this.resource.name;
  }
}
