import { Analyzable } from './analyzable';
import { Characteristic } from './characteristic';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
import * as AWS from 'aws-sdk';
import { Credentials } from 'aws-sdk';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-analyzable',
  templateUrl: './analyzable.component.html',
  styleUrls: ['./analyzable.component.css']
})
  
export class AnalyzableComponent implements OnInit {  
  
  key_azure = sessionStorage['key_azure'];
  uri_azure = 'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze';
  
  key_visison = sessionStorage['key_visison'];
  uri_vision = 'https://vision.googleapis.com/v1/images:annotate';
  
  analyzable: Analyzable = {
    url: 'https://angular.io/assets/images/logos/angular/angular.png'
  };
  
  characteristic: Characteristic= {
     categories: [],
      tags: [],
      colors: [],
      caption: ''
  };
  
  analyzers = ['Azure', 'AWS', 'Vision'];
  selectedAnalyzer = this.analyzers[0];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    
  }
  
  getImage(imageUrl: string): Observable<File> {
    return this.http.get(imageUrl, { responseType: 'blob' });    
  }
  
  analyze(): void {
    if (this.selectedAnalyzer == 'Azure') {
      this.analyzeAzure();
    } else if (this.selectedAnalyzer == 'Vision') {
      this.analyzeVision();
    } else if (this.selectedAnalyzer == 'AWS') {
      this.analyzeAWS();
    }
  }
  
  analyzeAWS(): void {
    this.characteristic = new Characteristic();
    this.characteristic.tags = [];
    
    let getDataUri = function (targetUrl, callback, tags) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result, tags);
            };
            reader.readAsDataURL(xhr.response);
        };
        let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        xhr.open('GET', proxyUrl + targetUrl);
        xhr.responseType = 'blob';
        xhr.send();
    };
    
    getDataUri(this.analyzable.url, function (base64, tags) {             
        let base64Image = base64.split('data:image/png;base64,')[1];
        let binaryImg = atob(base64Image);
        let length = binaryImg.length;
        let ab = new ArrayBuffer(length);
        let ua = new Uint8Array(ab);
        for (let i = 0; i < length; i++) {
          ua[i] = binaryImg.charCodeAt(i);
        }

        let blob = new Blob([ab], {
        });
      
      let params = {
        Image: {
         Bytes: ab
        }, 
        MaxLabels: 20, 
        MinConfidence: 70
       };
            
      console.log(params);
      
      let rekognition = new AWS.Rekognition({apiVersion: '2016-06-27', region: 'eu-west-1', credentials: new Credentials(sessionStorage['pkey_aws'], sessionStorage['skey_aws'])});
      rekognition.detectLabels(params, function (err, data) {
        if (err) {
          console.log(err, err.stack); 
        } else {
          console.log(data);
           for (let entry of data['Labels']) {
              tags.push(entry.Name);
           }
        } 
      });
    }, this.characteristic.tags);
    
  }

  analyzeVision(): void {
    
     let rParams = new HttpParams();
     rParams = rParams.set('key',  this.key_visison);
    
     let json1 = '{ "requests":[{"image":{"source":{"imageUri":"';
     let json2 = '"}},"features":[{"type":"LABEL_DETECTION","maxResults":20}]}]}';
     let body = json1.concat(this.analyzable.url, json2);
    
     this.http
      .post(this.uri_vision, body, {
        params: rParams
      }).subscribe(
         data => {
           this.characteristic = new Characteristic();
            this.characteristic.tags = [];
           for (let entry of data['responses'][0]['labelAnnotations']) {
             this.characteristic.tags.push(entry.description);
           }
         },
         err => {
         });
  }
  
  analyzeAzure(): void {
     
     let rParams = new HttpParams();
     rParams = rParams.set('visualFeatures', 'Categories,Description,Color');
     rParams = rParams.set('lang', 'en');
     
     let rHeaders = new HttpHeaders();
     rHeaders = rHeaders.set('Content-Type', 'application/json');
     rHeaders = rHeaders.set('Ocp-Apim-Subscription-Key', this.key_azure);
     
     let json1 = '{"url":"';
     let json2 = '"}';
     let body = json1.concat(this.analyzable.url, json2);
     
     this.http
      .post(this.uri_azure, body, {
        headers: rHeaders,
        params: rParams
      }).subscribe(
         data => {
           this.characteristic = new Characteristic();
           this.characteristic.caption = data['description'].captions[0].text;
           this.characteristic.tags = data['description'].tags;      
         },
         err => {
         });
  }
}
