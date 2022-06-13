import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit{
  public title: string;

  constructor (){
    this.title="Idendificate"
  }
  ngOnInit(): void{
      console.log('Cargando el login')
  }
}
