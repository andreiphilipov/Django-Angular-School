import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService, AlertService, routerTransition } from "../../_services";
import { NgForm } from '@angular/forms';

import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  providers: [UserService],
  animations: [routerTransition()]
})
export class SignUpComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({ url: 'http://localhost:3000/upload' });

  registerForm: FormGroup;
  loading = false;
  submitted = false;
  imageUrl: string = "";
  fileToUpload: File = null;
  sendData: any;
  imageName: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.imageName = item.file.name;
    };

  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);

    //show image preview
    var reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    }
    reader.readAsDataURL(this.fileToUpload);
    this.uploader.uploadAll();
  }

  //   passValidator(control: AbstractControl){
  //       if(control &&  (control.value !== null || control.value !== undefined)){
  //           const cnfpassValue = control.value;

  //           const passControl = control.root.get('password');
  //           if(passControl){
  //               const passValue = passControl.value;
  //               if(passValue !== cnfpassValue || passValue == ''){
  //                   return {
  //                       isError: true
  //                   }
  //               }
  //           }
  //       }
  //   }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(form: NgForm) {

    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    ///

    this.sendData = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      image: this.imageName
    }

    this.loading = true;
    this.userService.register(this.sendData)
      .pipe(first())
      .subscribe(
        data => {
          this.alertService.success('Registration successful', true);
          localStorage.setItem('currentUser', JSON.stringify(data));

          this.router.navigate(['/signin']);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

}
