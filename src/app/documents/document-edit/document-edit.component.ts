import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { Customer } from '../../shared/customer.model';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

import * as fromApp from '../../store/app.reducer';
import * as DocumentsActions from '../store/document.actions';

import * as CustomersActions from '../../customers/store/customer.actions';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
})
export class DocumentEditComponent implements OnInit, OnDestroy {

  // private userSub: Subscription; 

  url: string;
  attn: string;
  pdfData: any;

  id: number;
  editMode = false;
  documentForm: FormGroup;
  customers: Customer[];
  
  private subscription: Subscription;
  private storeSub: Subscription;

  services = [
    {name: 'generalWelding', value: false},
    {name: 'fireEscapes', value: false},
    {name: 'fences', value: false},
    {name: 'securityDoor', value: false},
    {name: 'generalRepair', value: false},
    {name: 'awnings', value: false},
    {name: 'stairs', value: false},
    {name: 'windowGuards', value: false},
    {name: 'basementDoor', value: false},
    {name: 'railings', value: false},
    {name: 'gates', value: false},
    {name: 'otherServices', value: false},
  ];

  images: any;
  
  // Playground
  // @ViewChild('numberInput', { static: false }) numberInput: ElementRef;
  // #numberInput 
  // @ContentChild('contentParagraph', {static: true}) paragraph: ElementRef;

  constructor( 
    private route: ActivatedRoute, 
    private router: Router, 
    private store: Store<fromApp.AppState> 
    ) {}  
  
  ngOnInit() { 
    this.images = new Array;
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      console.log(this.id);    
      this.editMode = params['id'] != null;
      this.initForm();
      this.store.dispatch(new CustomersActions.FetchCustomers()); // my 
      this.subscription = this.store
      .select('customers')
      .pipe(map(customersState => customersState.customers))
      .subscribe((customers: Customer[]) => {
        this.customers = customers;
      });
      this.attn = this.documentForm.value.attn;
      this.pdfData = this.documentForm.value;
    });

    this.documentForm.valueChanges.subscribe(console.log);
    
    // this.onChanges();
  }

  // onChanges(): void {
  //   this.documentForm.valueChanges.subscribe(val => {
  //     this.pdfData = this.documentForm.value;
  //   });
  // }

  onSubmit() {
    // event.preventDefault();
    if (this.editMode) {
      this.store.dispatch(
        new DocumentsActions.UpdateDocument({
          index: this.id,
          newDocument: this.documentForm.value
        })
      );
    } else {
      this.store.dispatch(new DocumentsActions.AddDocument(this.documentForm.value));
    }
    this.onCancel();
    this.store.dispatch(new DocumentsActions.StoreDocuments());
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onCancel() {
    event.preventDefault();
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  onDelete() {
    event.preventDefault();
    this.storeSub.unsubscribe();
    this.store.dispatch(new DocumentsActions.DeleteDocument(this.id));
    this.store.dispatch(new DocumentsActions.StoreDocuments());
    this.router.navigate(['/documents']);
  }
  onAddThing() {
    (<FormArray>this.documentForm.get('things')).push(
      new FormGroup({ aden: new FormControl(null, Validators.required) })
    );
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: Event) => {
        this.images.push(reader.result);
     };
    }
  }

  onDeleteThing(index: number) {
    (<FormArray>this.documentForm.get('things')).removeAt(index);
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
  }

  private initForm() {
    
    let documentNumber = '';
    let documentDate = '';
    let documentAttn = '';
    let documentCustomer = '';
    let documentWorksite = '';
    let documentGeneralWelding = false;
    let documentGeneralRepair = false;
    let documentBasementDoor = false;
    let documentFireEscapes = false;
    let documentAwnings = false;
    let documentRailings = false;
    let documentFences = false;
    let documentStairs = false;
    let documentGates = false;
    let documentSecurityDoor = false;
    let documentWindowGuards = false;
    let documentOtherServices = false;
    let documentDescription = '';
    let documentNote = 'Estimate time for project completion 4 to 6 weeks';
    let documentPrice = 0;
    let documentTax = false;
    let documentOptions = false;
    let documentImage = '';

    let documentThings = new FormArray([]);

    if (this.editMode) {
      this.storeSub = this.store.select('documents').pipe(map(documentState => {
          return documentState.documents.find((document, index) => {
            return index === this.id;
          })
      }))
      .subscribe(document => {
        documentNumber = document.number;
        documentDate = document.date;
        documentAttn = document.attn;
        documentCustomer = document.customer;
        documentWorksite = document.worksite;
        documentGeneralWelding = document.services.generalWelding;
        documentGeneralRepair = document.services.generalRepair;
        documentBasementDoor = document.services.basementDoor;
        documentFireEscapes = document.services.fireEscapes;
        documentAwnings = document.services.awnings;
        documentRailings = document.services.railings;
        documentFences = document.services.fences;
        documentStairs = document.services.stairs;
        documentGates = document.services.gates;
        documentSecurityDoor = document.services.securityDoor;
        documentWindowGuards = document.services.windowGuards;
        documentOtherServices = document.services.otherServices;
        documentDescription = document.description;
        documentNote = document.note;
        documentPrice = document.price;
        documentTax = document.tax;
        documentOptions = document.options;
        documentImage = document.image;
        if (document['things']) {
          for (let thing of document.things) {
            documentThings.push( new FormGroup({ aden: new FormControl(thing.aden, Validators.required)}) );
          }
        }
      });

      console.log(documentNumber);
    }

    this.documentForm = new FormGroup({
      number: new FormControl(documentNumber, Validators.required),
      date: new FormControl(documentDate, Validators.required),
      attn: new FormControl(documentAttn, Validators.required),
      customer: new FormControl(documentCustomer, Validators.required),
      worksite: new FormControl(documentWorksite, Validators.required),

      services: new FormGroup({
        generalWelding: new FormControl(documentGeneralWelding, Validators.required),
        generalRepair: new FormControl(documentGeneralRepair, Validators.required),
        basementDoor: new FormControl(documentBasementDoor, Validators.required),
        fireEscapes: new FormControl(documentFireEscapes, Validators.required),
        awnings: new FormControl(documentAwnings, Validators.required),
        railings: new FormControl(documentRailings, Validators.required),
        fences: new FormControl(documentFences, Validators.required),
        stairs: new FormControl(documentStairs, Validators.required),
        gates: new FormControl(documentGates, Validators.required),
        securityDoor: new FormControl(documentSecurityDoor, Validators.required),
        windowGuards: new FormControl(documentWindowGuards, Validators.required),
        otherServices: new FormControl(documentOtherServices, Validators.required),
      }),
       
      description: new FormControl(documentDescription, Validators.required),
      note: new FormControl(documentNote, Validators.required),
      price: new FormControl(documentPrice, Validators.required),
      tax: new FormControl(documentTax, Validators.required),
      options: new FormControl(documentOptions, Validators.required),
      image: new FormControl(documentImage, Validators.required),

      things: documentThings
    });
  }

  customer($selected) {
    const selected = this.customers.filter(customer => customer.attn === $selected.attn);
    this.documentForm.controls['attn'].setValue(selected[0].attn);
    this.documentForm.controls['customer'].setValue(selected[0].customer);
  }

}