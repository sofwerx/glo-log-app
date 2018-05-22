import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MissionPlanningFirstFormComponent } from '../forms/mission-planning-first-form/mission-planning-first-form.component';
import { MatDialogRef } from '@angular/material/dialog/typings/dialog-ref';
import { MissonPlanningSercondFormComponent } from '../forms/misson-planning-sercond-form/misson-planning-sercond-form.component';
import { MarkersLocationsService } from '../main-map/marker-layer/markers-locations.service';
import { Cartesian3 } from 'angular-cesium';
import { Mission } from '../common/state/types';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  missionDialogFirstRef: MatDialogRef<MissionPlanningFirstFormComponent>;
  missionDialogSecRef: MatDialogRef<MissonPlanningSercondFormComponent>;
  missionDialogOpenFirst = false;
  missionDialogOpenSecond = false;

  @Output()
  onMenuItemClick = new EventEmitter();

  constructor(public dialog: MatDialog, private markerService: MarkersLocationsService) {
  }

  openMissionPlanning(initialCartesian3?: Cartesian3) {
    if (!this.missionDialogOpenFirst && !this.missionDialogOpenSecond) {
      this.onMenuItemClick.emit();
      this.missionDialogFirstRef = this.dialog.open(MissionPlanningFirstFormComponent, {
        height: '530px',
        width: '350px',
        data: {
          initialLocation: initialCartesian3,
        }
      });
      this.missionDialogOpenFirst = true;

      const close$ = this.missionDialogFirstRef.afterClosed().subscribe((firstFormValues) => {
        close$.unsubscribe();
        this.missionDialogOpenFirst = false;
        if (firstFormValues) {
          this.markerService.stopListenToClicks();
          this.missionDialogSecRef = this.dialog.open(MissonPlanningSercondFormComponent, {
            height: '530px',
            width: '350px',
            data: {
              firstFormValues,
            }
          });
          this.missionDialogOpenSecond = true;
          this.missionDialogSecRef.afterClosed().subscribe((result) => {
            this.missionDialogOpenSecond = false;
            this.markerService.startMapListenToClicks();
            if (result && result.shouldGoBack) {
              this.openMissionPlanning();
            }
          });
        }
      });


    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.markerService.startMapListenToClicks();
      this.markerService.getMarkerLocations$().subscribe((mission: Mission) => {
        this.openMissionPlanning(mission.location);
      });
    }, 0);
  }
}
