import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'singup',
  templateUrl: './singup.component.html',
  styleUrls: ['./singup.component.css', '../../../assets/styles/singup/vendor/mdi-font/css/material-design-iconic-font.min.css',
    '../../../assets/styles/singup/vendor/font-awesome-4.7/css/font-awesome.min.css',
    '../../../assets/styles/singup/vendor/select2/select2.min.css',
    '../../../assets/styles/singup/vendor/datepicker/daterangepicker.css',
    '../../../assets/styles/singup/css/main.css'
  ]
})

export class SingupComponent implements OnInit {
  public title: string;

  constructor() {
    this.title = "Registrate uwu"
  }
  ngOnInit() {
    console.log('Cargando el resgistro')
  }
}
