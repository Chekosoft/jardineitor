import React, {PropTypes} from 'react';
import Jardineitor from './Jardineitor.jsx';
import axios from 'axios';


export default class WaterButton extends React.Component {

  static get propTypes() {
    return {
      parent: PropTypes.instanceOf(Jardineitor).isRequired
    };
  }

  constructor() {
    super();
    this.sendWater = this.sendWater.bind(this);
  }

  sendWater(e) {
    e.preventDefault();
    console.log("Sending water to API");
    axios.post('http://localhost:3389/api/water')
    .then((res) => {
      this.props.parent.setNotification(
        'Listo, se ha enviado la orden de regado.',
        'primary');
        
      console.log(res);
    });
  }

  render() {
    return <button onClick={this.sendWater}>Regar planta</button>;
  }
}
