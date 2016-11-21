import { combineReducers } from 'redux';
import welcome from './welcome';
import baozhangren from './baozhangren';
import zuoyeren from './zuoyeren';

const rootReducer = combineReducers({
  welcome,
  baozhangren,
  zuoyeren
});

export default rootReducer;
