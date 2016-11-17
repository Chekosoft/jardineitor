import React, {PropTypes} from 'react';
import Jardineitor from './Jardineitor.jsx';
import Gauge from 'svg-gauge';

export default class StatusGauges extends React.Component {
  static get propTypes() {
    return {
      parent: PropTypes.instanceOf(Jardineitor).isRequired
    };
  }

  constructor() {
    super();
    this.state = {
      moist: -1,
      light: -1
    }
  }

  componentDidMount() {
    this.moistGauge = Gauge(this.moistGaugePlaceholder, {
      min: -1,
      max: 1023,
      value: this.state.moist,
      valueDialClass: 'value moist'
    });

    this.lightGauge = Gauge(this.lightGaugePlaceholder, {
      min: -1,
      max: 1023,
      value: this.state.moist,
      valueDialClass: 'value light'
    });

    this.props.parent.ws.on('update_status', (message) => {
      this.setState({
        moist: message.moist,
        light: message.light
      }, () => {
        this.moistGauge.setValueAnimated(this.state.moist, 1);
        this.lightGauge.setValueAnimated(this.state.light, 1);
      });
    });
  }

  render() {
    return <div className="has-text-centered">
      <div className="content">
        <h2>Humedad</h2>
      </div>
      <div ref={(ref) => this.moistGaugePlaceholder = ref} className="gauge-container" />
      <div className="content">
        <h2>Luminosidad</h2>
      </div>
      <div ref={(ref) => this.lightGaugePlaceholder = ref} className="gauge-container" />
    </div>
  }
}
