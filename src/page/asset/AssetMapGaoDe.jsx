import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, Modal, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import AMapLoader from '@amap/amap-jsapi-loader';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';

class AssetMapGaoDe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: this.props.match.params.lng ? this.props.match.params.lng : 114.5220818442,
            lat: this.props.match.params.lat ? this.props.match.params.lat : 38.0489583146,
            actoinZoom: this.props.match.params.lng ? true : false,
            map: null,
            AMap: null,
            panelDisplay: 'none',
            gateway: {},
            assetList: [
            ],
            dataList: [],
            collapsed: false,
            listType: 'list',
            searchKeyword: null,
            cluster: null,
            markers: [],
            showDetailFromList: false,
            searchValue: '',
            listModal: false,
        }
    }

    componentDidMount() {
        this.init();
    }

    zoomend = () => {
        console.log('zoomend 当前等级', this.state.map.getZoom())
    }

    init = () => {
        console.log("初始位置：", this.state.lng, this.state.lat)
        //初始化地图
        AMapLoader.load({
            "key": "034f37e988d8a97079766539387a6a0b",   // 申请好的Web端开发者Key，首次调用 load 时必填
            // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            "plugins": ['AMap.MarkerClusterer']  //插件列表
        }).then((AMap) => {
            this.state.AMap = AMap;
            this.state.map = new AMap.Map('mapContainer', {
                center: [this.state.lng, this.state.lat],
                zoom: this.state.actoinZoom ? 12 : 7,// [3,19]
                resizeEnable: true,
            });

            this.loadGatewayList();
            //this.initMapData(map, AMap);
            this.state.map.on('zoomend', this.zoomend);


        }).catch(e => {
            console.log(e);
        })
    }

    /**
     * 获取网关数据
     */
    loadGatewayList() {
        let param = {};
        let _this = this;

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        let isSearch = this.state.listType === 'search'
        if (isSearch) {
            param.keyword = this.state.searchKeyword;
        }
        HttpService.post('reportServer/gateway/listEamGatewayByMap', JSON.stringify(param))
            .then(response => {
                if (response.resultCode == '1000') {
                    _this.setState({
                        dataList: response.data,
                        showDetail: false
                    });

                    //搜索后定位至第一个
                    if (0 < response.data.length) {
                        this.state.map.setZoom(10) // [3,19]
                        this.state.map.panTo(new AMap.LngLat(response.data[0].lng, response.data[0].rng));
                    }


                    _this.initMapData(_this.state.map, _this.state.AMap);

                    if (isSearch) {
                        this.setState({
                            listModal: true
                        })
                    }
                } else {
                    addResponseMessage(response.message);
                }
            });
    }

    getAddr = (gateway) => {

        //获取网关下的资产数据
        let param = { gateway_id: gateway.gateway_id };
        HttpService.post('reportServer/asset/listEamAssetByGatewayId', JSON.stringify(param)).then(response => {

            this.setState({
                gateway: gateway,
                assetList: response.data,
                showDetail: true,
            })
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    initMapData = (map, AMap) => {
        console.log('initMapData')
        map.clearMap();
        this.state.markers = [];
        let _this = this;
        for (var i = 0; i < this.state.dataList.length; i++) {
            // 创建一个 Marker 实例
            let gatewayItem = this.state.dataList[i];
            let marker = new AMap.Marker({
                position: new AMap.LngLat(gatewayItem.lng, gatewayItem.rng),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: gatewayItem.address
            });

            marker.on('click', function (e) {
                _this.setState({
                    showDetailFromList: false,
                    listModal: true
                })

                //e.preventDefault(); // 修复 Android 上点击穿透
                _this.getAddr(gatewayItem);

            });


            // 将创建的点标记添加到已有的地图实例：
            //map.add(marker);

            this.state.markers.push(marker);

            if (this.state.cluster) {
                this.state.cluster.setMap(null);
            }
            if (this.state.listType === 'search') {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 10 });
            } else {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 18 });
            }


        }
    }

    onChange = (value) => {
        this.setState({ searchValue: value });
    };
    clear = () => {
        this.setState({ searchValue: '' });
    };


    // 搜索
    onSearch(searchKeyword) {
        let listType = searchKeyword === '' ? 'list' : 'search';
        this.setState({
            listType: listType,
            searchKeyword: searchKeyword
        }, () => {
            this.loadGatewayList();
        });
    }



    showModal = (key, e) => {

        console.log('key', e)
        // e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            [key]: true,
        });
    }

    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    onWrapTouchStart = (e) => {
        // fix touch to scroll background page on iOS
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
    }


    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                >
                    <span style={{ color: 'white' }}>资产地图</span>
                </NavBar>
                <SearchBar
                    value={this.state.searchValue}
                    placeholder="搜索"
                    onSubmit={value => { this.onSearch(value) }}
                    onClear={value => console.log(value, 'onClear')}
                    onFocus={() => console.log('onFocus')}
                    onBlur={() => console.log('onBlur')}
                    onCancel={value => { this.onSearch(value) }}
                    cancelText="搜索"
                    showCancelButton
                    onChange={this.onChange}
                />

                <div id="mapContainer" style={{ height: "400px" }}></div>


                <Modal
                    popup
                    visible={this.state.listModal}
                    onClose={this.onClose('listModal')}
                    animationType="slide-up"
                    afterClose={() => { console.log('afterClose') }}
                >
                    <List renderHeader={() => <div>委托买入</div>} className="popup-list">
                        {['股票名称', '股票代码', '买入价格'].map((i, index) => (
                            <List.Item key={index}>{i}</List.Item>
                        ))}
                        <List.Item>
                            <Button type="primary" onClick={this.onClose('listModal')}>买入</Button>
                        </List.Item>
                    </List>
                </Modal>


            </div>
        )
    }
}
export default AssetMapGaoDe;