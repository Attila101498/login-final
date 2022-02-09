import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { Alert, AlertType } from '@app/_models';
import { AlertService } from '@app/_services';

@Component({ 
    selector: 'alert', 
    templateUrl: 'alert.component.html' 
})
export class AlertComponent implements OnInit, OnDestroy {
    @Input() id = 'default-alert';
    @Input() fade = true;

    alerts: Alert[] = [];
    alertSubscription: Subscription;
    routeSubscription: Subscription;

    constructor(private router: Router, 
                private alertService: AlertService) { }

    ngOnInit() {
        // feliratkozás az új alertre
        this.alertSubscription = this.alertService.onAlert(this.id)
            .subscribe(alert => {
                // alertek törlése, ha üres alert érkezik
                if (!alert.message) {
                    // alertek kiszűrése a „keepAfterRouteChange” jelző nélkül
                    this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

                    // A többiről eltávolítjuk el a „keepAfterRouteChange” jelzőt
                    this.alerts.forEach(x => delete x.keepAfterRouteChange);
                    return;
                }

                // alert hozzáadása a tömbhöz
                this.alerts.push(alert);

                // szükség esetén automatikusan bezárjuk az alertet
                if (alert.autoClose) {
                    setTimeout(() => this.removeAlert(alert), 3000);
                }
           });

        // helyváltozásnál ürítsük ki az alerteket
        this.routeSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.alertService.clear(this.id);
            }
        });
    }

    ngOnDestroy() {
        // iratkozzunk le a memóriatúlcsordulás elkerülése érdekében
        this.alertSubscription.unsubscribe();
        this.routeSubscription.unsubscribe();
    }

    removeAlert(alert: Alert) {
        // ellenőrizzük, hogy már eltávolították-e, hogy elkerüljük az 
        // automatikus bezáráskor jelentkező hibákat
        if (!this.alerts.includes(alert)) return;

        if (this.fade) {
            // fade out alert
            alert.fade = true;

            // alert eltávolítása a fade out után
            setTimeout(() => {
                this.alerts = this.alerts.filter(x => x !== alert);
            }, 250);
        } else {
            // alert eltávolítása
            this.alerts = this.alerts.filter(x => x !== alert);
        }
    }

    cssClass(alert: Alert) {
        if (!alert) return "";

        const classes = ['alert', 'alert-dismissable', 'mt-4', 'container'];
                
        const alertTypeClass = {
            [AlertType.Success]: 'alert alert-success',
            [AlertType.Error]: 'alert alert-danger',
            [AlertType.Info]: 'alert alert-info',
            [AlertType.Warning]: 'alert alert-warning'
        }

        classes.push(alertTypeClass[alert.type]);

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    }
}