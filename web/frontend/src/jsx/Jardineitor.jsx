import React from 'react';
import io from 'socket.io-client';
import classnames from 'classnames';
import delay from 'timeout-as-promise';

import WaterButton from './WaterButton.jsx';
import EventTable from './EventTable.jsx';
import StatusGauges from './StatusGauges.jsx';


export default class Jardineitor extends React.Component {

  constructor() {
    super();
    this.state = {
      alert: {
        show: false,
        type: 'general',
        message: 'asdf'
      }
    };

    this.ws = io('http://localhost:3389');
  }

  setNotification(message, type='info') {
    let alert = {
      show: true,
      type,
      message
    };
    this.setState({
      alert
    });

    delay(2500).then(() => {
      this.setState({
        alert: {show: false, type: 'general', message: 'asdf'}
      });
    });
  }

  render() {

    let {alert} = this.state;
    let self = this;

    let notificationClass = classnames('notification', {
      'invisible': !alert.show,
      'is-info': alert.type == 'info',
      'is-error': alert.type == 'error',
      'is-primary': alert.type == 'primary',
      'is-warning': alert.type == 'warning',
      'is-danger': alert.type == 'danger'
    });

    return (
      <div className="is-fullwidth">
        <nav className="nav has-shadow">
          <div className="nav-left">
            <h1 className="nav-item title is-brand has-text-centered">
              Jardineitor - Dashboard
            </h1>
          </div>

          <div className="nav-center">
            <div className={notificationClass}>
              {alert.message}
            </div>
          </div>

          <div className="nav-right"> &nbsp; </div>
        </nav>

        <section className="section">
          <div className="tile is-ancestor">
            <div className="tile is-parent is-vertical is-4">
              <div className="tile is-child panel">
                <h2 className="panel-heading">
                  Calendario de regado
                </h2>
              </div>
              <div className="tile is-child panel">
                <h2 className="panel-heading">
                  Historia de eventos
                </h2>
                <div className="panel-block">
                  <EventTable parent={this} />
                </div>
              </div>
            </div>
            <div className="tile is-vertical is-parent is-4">
              <div className="tile is-child box">
                <WaterButton parent={self} />
              </div>
            </div>
            <div className="tile is-vertical is-parent is-4">
              <div className="tile is-child panel">
                <h2 className="panel-heading">
                  Estado de la planta
                </h2>
                <div className="panel-block">
                  <StatusGauges parent={this} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
