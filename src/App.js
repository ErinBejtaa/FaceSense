import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import { useCallback } from "react";
import Particles from "react-particles";
import 'tachyons';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Register from './components/Register/Register';


const PAT = '1f99a3573f0143219eee1f52aed0a5dd';
const USER_ID = 'erinbejta';       
const APP_ID = 'my-first-application-t9kdyj';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    


class App extends Component{
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name:data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }


  

  calculateFaceLocation = (data) => {
   try{ 
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;

  //const clarifaiFace = data.outputs.regions.region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  
  return {
   leftCol: clarifaiFace.left_col * width,
   topRow: clarifaiFace.top_row * height,
   rightCol: width - (clarifaiFace.right_col * width),
   bottomRow: height - (clarifaiFace.bottom_row * height),
  }

    
  }catch(error){
    console.log("error", error);
  }
    //console.log(dataparse);
}

displayFaceBox = (box) => {
    this.setState({box: box});
    console.log(box);
}



  onInputChange = (event) => {
    this.setState({input: event.target.value});

  }


  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
     const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": this.state.input
                    }
                }
            }
        ]
    });


    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    let fetchok = false;

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(result => this.displayFaceBox(this.calculateFaceLocation(result)))
        .then(fetchok = true)
        .then(response => {
            if(fetchok === true){
                fetch('http://localhost:3000/image',{
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id
                    })
                })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, { entries: count}))
                      })
            }
        })
}
    onRouteChange = (route) =>{
        if(route === 'signout'){
            this.setState({isSignedIn: false})
        } else if(route === 'home'){
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
    }




  render(){

 return (
    <div className="App">
     <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
     {this.state.route === 'home'
     
     ?
        
       <div>
     <Logo />
    {/*} <Rank 
     name={this.state.user.name}
     entries={this.state.user.entries} />*/}
     <ImageLinkForm 
     onInputChange={this.onInputChange}
     onButtonSubmit={this.onButtonSubmit}
      />
    <FaceRecognition box = {this.state.box} imageUrl={this.state.input} /> 
    </div>
    : (this.state.route === 'signin'
    ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
    : <Register loadUser={this.loadUser}onRouteChange={this.onRouteChange}/>
        )
    }
    
    
    </div>

  );

}
}
 
export default App;
