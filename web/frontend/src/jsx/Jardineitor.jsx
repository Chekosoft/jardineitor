import React from 'react';
import io from 'socket.io-client';
import classnames from 'classnames';
import delay from 'timeout-as-promise';

import WaterButton from './WaterButton.jsx';
import EventTable from './EventTable.jsx';
import StatusGauges from './StatusGauges.jsx';
import Calendar from './Calendar.jsx';
import CalendarCreate from './CalendarCreate.jsx';


export default class Jardineitor extends React.Component {

  constructor() {
    super();
    this.state = {
      alert: {
        show: false,
        type: 'general',
        message: 'asdf'
      },
      showCreateForm: false
    };

    this.ws = io('http://localhost:3389');
    this.setNotification = this.setNotification.bind(this);
    this.showCreateForm = this.showCreateForm.bind(this);
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

  showCreateForm() {
    this.setState({
      showCreateForm: true
    });
  }

  render() {

    let {alert, showCreateForm} = this.state;
    let createForm = null;
    let self = this;

    if(showCreateForm) {
      createForm = <CalendarCreate parent={this} />
    }

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
          <div className="columns max-height-setter">
            <div className="column full-height is-3 is-offset-3">
              <div className="panel half-height">
                <h2 className="panel-heading">
                  Riegos Programados para Hoy.
                  <button className="button is-primary is-pulled-right"
                    onClick={self.showCreateForm}>Agregar fecha</button>
                </h2>
                <div className="panel-block">
                  <Calendar parent={this} />
                </div>
              </div>
              <div className="panel half-height hide-overflow">
                <h2 className="panel-heading">
                  Historia de eventos
                </h2>
                <div className="panel-block">
                  <EventTable parent={this} />
                </div>
              </div>
            </div>
            <div className="column full-height is-3">
              <div className="panel full-height">
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
        {createForm}
      </div>
    )
  }
}
