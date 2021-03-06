import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as CustomersActions from './customer.actions';
import * as fromApp from '../../store/app.reducer';
import { Customer } from '../../shared/customer.model';

@Injectable()
export class CustomerEffects {

    userId: any;

    @Effect()
    fetchCustomers = this.actions$.pipe(
        ofType(CustomersActions.FETCH_CUTOMERS),
        switchMap(() => {
            this.store.select('auth').pipe(map(authState => authState.user)).subscribe(user => {
                if (user) this.userId = user.id;
            });
            return this.http
            .get<Customer[]>(
                'https://ng-oren.firebaseio.com/users/' + this.userId + '/customers.json'
            //   'https://ng-oren.firebaseio.com/customers.json'
            );
        }),
        map(customers => {
            return customers.map(customer => {
                return { ...customer };
            });
        }),
        map(customers => {
            return new CustomersActions.SetCustomers(customers);
        })
    );

    @Effect({dispatch: false})
    storeCustomers = this.actions$.pipe(
        ofType(CustomersActions.STORE_CUSTOMERS),
        withLatestFrom(this.store.select('customers')),
        switchMap(([actionData, customersState]) => {
            this.store.select('auth').pipe(map(authState => authState.user)).subscribe(user => {
                if (user) this.userId = user.id;
            });
            return this.http.put(
                'https://ng-oren.firebaseio.com/users/' + this.userId + '/customers.json',
            //   'https://ng-oren.firebaseio.com/customers.json',
              customersState.customers
            )
        })

    );

    constructor(
        private actions$: Actions, 
        private http: HttpClient, 
        private store: Store<fromApp.AppState>
    ) {
    }
}