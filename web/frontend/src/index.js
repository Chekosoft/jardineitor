import {render} from 'react-dom';
import React from 'react';

import style from './sass/style.scss';
import Jardineitor from './jsx/Jardineitor.jsx';

const cssEl = document.createElement('style');
cssEl.type = 'text/css';
cssEl.innerHTML = style;
document.head.appendChild(cssEl);

render(<Jardineitor />, document.getElementById("jardineitor"));
