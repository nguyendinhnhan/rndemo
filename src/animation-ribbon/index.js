import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Rain from './Rain';

const imgs = [
  require('./img/ribbon-1.png'),
  require('./img/ribbon-2.png'),
  require('./img/ribbon-3.png'),
  require('./img/ribbon-4.png'),
  require('./img/ribbon-5.png'),
  require('./img/ribbon-6.png'),
  require('./img/ribbon-7.png'),
  require('./img/ribbon-8.png'),
  require('./img/ribbon-9.png'),
  require('./img/ribbon-10.png'),
  require('./img/ribbon-11.png'),
  require('./img/ribbon-12.png'),
  require('./img/ribbon-13.png'),
  require('./img/ribbon-14.png'),
  require('./img/ribbon-15.png'),
  require('./img/ribbon-16.png'),
  require('./img/ribbon-17.png'),
  require('./img/ribbon-18.png'),
];

export default class RainScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Rain imgs={imgs} count={35} duration={3000} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
