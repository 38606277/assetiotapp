import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';


class AssetScan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isInitialized: false,//是否初始化
            isEnabled: false,//是否启用
            errorMessage: '',//错误提示
            hasPermission: false,//是否开启权限
            isLocationEnabled: false,//定位服务是否开启
            foundDevices: [] //找到的设备集合
        }
    }
    componentDidMount() {

    }
    /**
     * 界面销毁
     */
    componentWillUnmount() {
        this.stopScanBluetooth();
    }

    getAdapterInfo() {
        bluetoothle.getAdapterInfo((result) => {
            console.log('getAdapterInfo - ', result);
        })
    }


    /**
     * 检查是否初始化蓝牙
     */
    checkInitialized() {
        return new Promise(function (resolve, reject) {
            bluetoothle.isInitialized((result) => {
                console.log('checkInitialized result - ', result);
                resolve(result.isInitialized);
            });
        })
    }

    /**
     * 初始化蓝牙
     */
    initBluetooth() {
        return new Promise(function (resolve, reject) {
            console.log('call initBluetooth');
            bluetoothle.initialize((result) => {
                console.log('initBluetooth result - ', result);
                resolve(result.status == 'enabled');//判断是否初始化成功
            }, {
                "request": true,
                "statusReceiver": false,
                "restoreKey": "bluetoothleplugin"
            });
        })
    }

    /**
     * 是否启用蓝牙
     */
    isEnabledBuletooth() {
        return new Promise(function (resolve, reject) {
            bluetoothle.isEnabled((result) => {
                console.log('isEnabledBuletooth result - ', result);
                resolve(result.isEnabled);
            });
        })

    }

    /**
     * 启用蓝牙
     */
    enabledBuletooth() {
        return new Promise(function (resolve, reject) {
            bluetoothle.enable((result) => {
                console.log('enabledBuletooth result- ', result);
                resolve(true)
            }, (error) => {
                console.log('enabledBuletooth error- ', error);
                reject(false);
            });
        })
    }


    /**
     * 检查权限
     */
    checkPermission() {
        return new Promise(function (resolve, reject) {
            bluetoothle.hasPermission((result) => {
                console.log('checkPermission result - ', result);
                resolve(result.hasPermission);
            });
        })
    }

    /**
     * 申请权限
     */
    requestPermission() {
        return new Promise((resolve, reject) => {
            bluetoothle.requestPermission((result) => {
                console.log('requestPermission result - ', result);
                resolve(result.requestPermission)
            }, (error) => {
                console.log('requestPermission error - ', error);
                reject(false);
            });
        })
    }

    /**
     * 检查定位权限是否开启
     */
    checkLocationEnabled() {
        return new Promise((resolve, reject) => {
            bluetoothle.isLocationEnabled((result) => {
                console.log('checkLocationEnabled result - ', result);
                resolve(result.isLocationEnabled);
            }, (error) => {
                console.log('checkLocationEnabled error - ', error);
                reject(false);
            });
        })
    }

    /**
     * 请求位置权限
     */
    requestLocation() {
        return new Promise((resolve, reject) => {
            bluetoothle.requestLocation((result) => {
                console.log('requestLocation result - ', result);
                resolve(result.requestLocation)
            }, (error) => {
                console.log('requestLocation error - ', error);
                reject(false);
            });
        })
    }


    /**
      * 是否正在扫描
      */
    checkIsScanning() {
        return new Promise((resolve, reject) => {
            bluetoothle.isScanning((result) => {
                console.log('checkIsScanning result - ', result);
                resolve(result.isScanning);
            });
        })
    }

    /**
     * 停止扫描
     */
    stopScan() {
        return new Promise((resolve, reject) => {
            bluetoothle.stopScan((result) => {
                console.log('stopScan result - ', result);
                resolve(result.status == 'scanStopped')
            }, (error) => {
                console.log('stopScan error - ', error);
                reject(false);
            });
        })
    }


    /**
     * 开始扫描
     */
    startScan() {
        console.log('开始扫描')
        bluetoothle.startScan((result) => {

            let foundDevices = this.state.foundDevices;

            if (result.status === "scanResult") {
                if (!foundDevices.some(function (device) {
                    return device.address === result.address;
                })) {
                    foundDevices.push(result);
                    this.setState({
                        foundDevices
                    })
                    console.log('startScan result - ', result);
                }
            }
        }, (error) => {
            console.log('startScan error - ', error);
        }, {
            "services": [],
            "allowDuplicates": true,
            "scanMode": bluetoothle.SCAN_MODE_LOW_LATENCY,
            "matchMode": bluetoothle.MATCH_MODE_AGGRESSIVE,
            "matchNum": bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
            "callbackType": bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
        });
    }

    //检查权限
    async startScanBluetooth() {

        console.log('scanBluetooth - start');

        //初始化
        let isInit = await this.checkInitialized();
        console.log(`isInit : ${isInit}`);
        if (!isInit) {
            console.log(`isInit 2 start`);
            isInit = await this.initBluetooth();
            console.log(`isInit 2: ${isInit}`);
            if (!isInit) {
                console.log('初始化失败')
                return;
            }
        }


        //检查权限
        let isRequestPermission = await this.checkPermission();
        console.log(`isRequestPermission : ${isRequestPermission}`);
        if (!isRequestPermission) {
            isRequestPermission = await this.requestPermission();
            console.log(`isRequestPermission2 : ${isRequestPermission}`);
            if (!isRequestPermission) {
                console.log('申请权限失败')
                return;
            }
        }

        //检查位置权限
        let isLocationEnabled = await this.checkLocationEnabled();
        console.log(`isLocationEnabled : ${isLocationEnabled}`);
        if (!isLocationEnabled) {
            isLocationEnabled = await this.requestLocation();
            if (!isLocationEnabled) {
                console.log('申请位置权限失败')
                return;
            }
        }


        //蓝牙是否启用
        let isEnabled = await this.isEnabledBuletooth();
        console.log(`isEnabled : ${isEnabled}`);
        if (!isEnabled) {
            isEnabled = await this.enabledBuletooth();
            console.log(`isEnabled2 : ${isEnabled}`);
            if (!isEnabled) {
                console.log('启用失败')
                return;
            }
        }




        //检查是否正在扫描
        let isScaning = await this.checkIsScanning();
        if (isScaning) {
            console.log('已开启扫描，请勿重复开启')
            return;
        }
        //开始扫描
        this.startScan();
    }

    //停止扫描
    async stopScanBluetooth() {

        //检查是否正在扫描
        let isScaning = await this.checkIsScanning();
        if (isScaning) {

            let isStopScan = await this.stopScan();
            if (isStopScan) {
                console.log('停止扫描成功')
            } else {
                console.log('停止扫描失败')
            }
        } else {
            console.log('已停止扫描，请勿重复停止')
        }
    }

    render() {
        let { foundDevices } = this.state;
        let devicesListUI = [];
        for (let i in foundDevices) {
            let devices = foundDevices[i];
            devicesListUI.push(<div> {`${devices.name} - ${devices.address}`}</div>)
        }
        return (
            <div>
                <NavBar
                    mode="light"
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                >
                    <span style={{ color: 'white' }}>扫描资产</span>
                </NavBar>

                <Button onClick={() => {
                    this.startScanBluetooth();
                }}> 开始扫描 </Button>


                <Button onClick={() => {
                    this.stopScanBluetooth();
                }}> 停止扫描 </Button>


                <div >
                    设备信息:<br />
                    {devicesListUI}
                </div>
            </div >
        )
    }
}
export default AssetScan;