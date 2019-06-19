// Copyright (c) 2017-2019, Substratum LLC (https://substratum.net) and/or its affiliates. All rights reserved.

import {Component, NgZone, Output} from '@angular/core';
import {NodeStatus} from '../node-status.enum';
import {MainService} from '../main.service';
import {ConfigService} from '../config.service';
import {ConfigurationMode} from '../configuration-mode.enum';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  constructor(private mainService: MainService, private configService: ConfigService, private ngZone: NgZone) {
    IndexComponent.resizeSmall();
    mainService.nodeStatus.subscribe((newStatus) => {
      ngZone.run(() => {
        this.status = newStatus;
      });
    });
    mainService.nodeDescriptor.subscribe((newNodeDescriptor) => {
      ngZone.run(() => {
        this.nodeDescriptor = newNodeDescriptor;
      });
    });
  }

  @Output() status: NodeStatus = NodeStatus.Off;
  @Output() configurationMode: ConfigurationMode = ConfigurationMode.Hidden;
  nodeDescriptor = '';

  static resizeSmall() {
    if (window.outerHeight !== 360) {
      window.resizeTo(640, 360);
    }
  }

  static resizeLarge() {
    if (window.outerHeight !== 710) {
      window.resizeTo(640, 710);
    }
  }

  off() {
    if (this.isOff()) {
      if (this.configurationMode === ConfigurationMode.Serving || this.configurationMode === ConfigurationMode.Consuming) {
        this.openStandardDisplay();
      }
    } else {
      this.mainService.turnOff();
    }
  }

  serve() {
    if (!this.isServing()) {
      this.configurationMode = ConfigurationMode.Hidden;
      if (this.configService.isValidServing()) {
        this.openStandardDisplay();
        this.mainService.serve();
      } else {
        this.openServingSettings();
      }
    }
  }

  consume() {
    if (!this.isConsuming()) {
      this.configurationMode = ConfigurationMode.Hidden;
      if (this.configService.isValidConsuming()) {
        this.openStandardDisplay();
        this.mainService.consume();
      } else {
        this.openConsumingSettings();
      }
    }
  }

  copyNodeDescriptor() {
    this.mainService.copyToClipboard(this.nodeDescriptor);
  }

  openStandardDisplay() {
    IndexComponent.resizeSmall();
    this.configurationMode = ConfigurationMode.Hidden;
  }

  openServingSettings() {
    IndexComponent.resizeLarge();
    this.configurationMode = ConfigurationMode.Serving;
  }

  openConsumingSettings() {
    IndexComponent.resizeLarge();
    this.configurationMode = ConfigurationMode.Consuming;
  }

  isOff(): boolean {
    return this.status === NodeStatus.Off;
  }

  isServing(): boolean {
    return this.status === NodeStatus.Serving;
  }

  isConsuming(): boolean {
    return this.status === NodeStatus.Consuming;
  }

  isInvalid(): boolean {
    return this.status === NodeStatus.Invalid;
  }

  isConfigurationShown(): boolean {
    return this.configurationMode !== ConfigurationMode.Hidden;
  }

  isServingConfigurationShown(): boolean {
    return this.configurationMode === ConfigurationMode.Serving;
  }

  isConsumingConfigurationShown(): boolean {
    return this.configurationMode === ConfigurationMode.Consuming;
  }

  statusText(): string {
    return (this.status === NodeStatus.Invalid) ? 'An error occurred. Choose a state.' : this.status;
  }

  onConfigurationSaved(mode: ConfigurationMode) {
    switch (mode) {
      case ConfigurationMode.Serving:
        this.onServingSaved();
        break;
      case ConfigurationMode.Consuming:
        this.onConsumingSaved();
        break;
      case ConfigurationMode.Configuring:
        this.configurationSaved();
        break;
    }
  }

  configurationSaved() {
    this.openStandardDisplay();

    if (this.isServing() || this.isConsuming()) {
      this.mainService.turnOff();
    }
  }

  onServingSaved() {
    this.configurationMode = ConfigurationMode.Hidden;
    this.mainService.serve();
    IndexComponent.resizeSmall();
  }

  onConsumingSaved() {
    this.configurationMode = ConfigurationMode.Hidden;
    this.mainService.consume();
    IndexComponent.resizeSmall();
  }

  onConfigurationMode($event: ConfigurationMode) {
    IndexComponent.resizeLarge();
    this.configurationMode = $event;
  }

  onCancelEvent() {
    this.openStandardDisplay();
  }
}
