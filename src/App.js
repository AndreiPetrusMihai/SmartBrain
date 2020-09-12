import React from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey:'bc35e760aa65419a90a562accb3e1d60'
});

const particlesOptions = {
particles: {
  number:{
    value:40,
    density:{
      enable:true,
      value_area:400
    }
  }
}
}

const initialState = {
      input:'',
      imageUrl:'',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id:"",
        name: '',
        email:'',
        entries: 0,
        joined: ''
      }   
}

class App extends React.Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id:"",
        name: '',
        email:'',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) =>{
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
    console.log('userloaded');
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image= document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col*width,
      topRow : clarifaiFace.top_row*height,
      rightCol: width - (clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row*height),

    }
  }

  displayFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl : this.state.input});////////////////?

    console.log('click');

    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(response => {
      if(response){
        fetch('http://localhost:4000/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
          id: this.state.user.id,

          })
        })
        .then(response=>response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
        .catch(err=>{
          console.log(err);
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
      })
    .catch(err=>console.log(err));
  }

  onRouteChange = (route) =>{

    if (route ==='signout')
    {
        this.setState(initialState);

    } else if(route === 'home'){
      this.setState({isSignedIn:true});
    }
    this.setState({route:route});
  }

  render(){ 
    return (
      <div className="App">
      <Particles className='particles' params={particlesOptions}/>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <Logo />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
      </div>

      {
      this.state.route === 'home' 
      ?
      <div>
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
      </div>
      :
      (
      this.state.route ==='signin'
      ?
      <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
      :
      <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
      )}
      </div>
  );
  }
}

export default App;
