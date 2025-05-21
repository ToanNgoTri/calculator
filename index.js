/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import BackgroundFetch from "react-native-background-fetch";
import Geolocation from 'react-native-geolocation-service';
import {Dirs, FileSystem} from 'react-native-file-access';


let MyHeadlessTask = async (event) => {
    // Get task id from event {}:
    let taskId = event.taskId;
    let isTimeout = event.timeout;  // <-- true when your background-time has expired.
    if (isTimeout) {
      console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
      BackgroundFetch.finish(taskId);
      console.log(taskId);
      
      return;
    }
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
  
    let name
    if (await FileSystem.exists(Dirs.CacheDir + '/info.txt', 'utf8')) {
      const FileInfoString = await FileSystem.readFile(
        Dirs.CacheDir + '/info.txt',
        'utf8',
      );
      console.log('index',FileInfoString);
      
      name = JSON.parse(FileInfoString)['name']
    }else{
      name = 'unknow'
    }
    

    Geolocation.getCurrentPosition(
      async (position) => {
  
        let today = new Date()
  
         let response = await fetch(
              `https://us-central1-calculator-7b8e5.cloudfunctions.net/addUser`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: name,
                  latitude:position.coords.latitude,
                  longitude:position.coords.longitude,
                  time: `${today.getHours()}:${today.getMinutes()}:${today.getMilliseconds()}, ${today.getDate()}/${
                today.getMonth() + 1
              }/${today.getFullYear()}`,
                }),
              },
            );
            let responseJson = await response.json();
            console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);
        },
        error => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
  




//     let responseJson = await response.json();
//     console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);
//   console.log('responseJson',responseJson);
  
    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(taskId);
  }
  
  // Register your BackgroundFetch HeadlessTask
  BackgroundFetch.registerHeadlessTask(MyHeadlessTask);


AppRegistry.registerComponent(appName, () => App);
