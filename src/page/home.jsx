import React from 'react';
import { WhiteSpace, Carousel, Icon, Card, Flex, Toast, NavBar } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';
import User from '../service/user-service.jsx'
import LocalStorge from '../util/LogcalStorge.jsx';
import CommonSearch from './commonSearch.jsx';
import QueryClassList from './QueryClassList.jsx';

import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';

import HttpService from '../util/HttpService.jsx';

const _user = new User();
const localStorge = new LocalStorge();

const data1 = Array.from(new Array(3)).map(() => ({
  icon: (<Icon type='check' />),
  text: 'hello'
}));


const data = [{ text: '首页', icon: require('../assets/radio-o.png') },
{ text: '机器人小涵', icon: require('../assets/saying.gif') },
{ text: '自然语言查询', icon: require('../assets/java.png') },
{ text: '查询', icon: require('../assets/yy_btn.png') }]

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    const renderResult = null;
    this.state = {
      paramClass: null,
      selectedTab: this.props.selectedTab,
      data: ['1', '2', '3'],
      imgHeight: 196,

      assetNumData: {
        normal_num: '-',
        assetCost: '-',
        assetNumber: '-',
        baseStationNum: '-',
        abnormal_num: '-',
        asset_num: '-'
      },
      city_data: {}
    }

  }

  componentDidMount() {
    //查询资产总数
    HttpService.post("reportServer/assetquery/getAssetNum", JSON.stringify({}))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            asset_num: res.data.asset_num,
            normal_num: res.data.normal_num,
            abnormal_num: res.data.abnormal_num,
            baseStationNum: res.data.baseStationNum,
            assetCost: this.numFormat(res.data.assetCost == null ? 0 : res.data.assetCost),
            assetNumber: res.data.assetNumber
          })
        } else {
          message.error(res.message);
        }

      });

    //查询资产上线按城市
    HttpService.post("reportServer/assetquery/getAssetNumByCity", JSON.stringify({}))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({ city_data: res.data })
        } else {
          message.error(res.message);
        }

      });
    // //查询资产预警信息
    // HttpService.post("reportServer/assetquery/getAssetAlarm", JSON.stringify({}))
    //   .then(res => {
    //     if (res.resultCode == "1000") {
    //       this.setState({ alarm_data: res.data })
    //     } else {
    //       message.error(res.message);
    //     }
    //   });

    // //查询资产异常信息
    // HttpService.post("reportServer/assetquery/getAssetAlarmNum", JSON.stringify({}))
    //   .then(res => {
    //     if (res.resultCode == "1000") {
    //       this.setState({
    //         gatewayNumber: res.data.gatewayNumber,
    //         assetAlarmNumber: res.data.assetAlarmNumber,
    //         pendAssetAlarmNumber: res.data.pendAssetAlarmNumber
    //       })
    //     }
    //     else
    //       message.error(res.message);

    //   });
    //查询资产异常信息
    HttpService.post("reportServer/assetquery/getAssetTypeNum", JSON.stringify({}))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            typeName: res.data.typeName.split(","),
            typeNum: res.data.typeNum.split(",")
          });
        } else {
          message.error(res.message);
        }
      });

    // //查询资产异常信息
    // HttpService.post("reportServer/assetquery/getAssetJZType", JSON.stringify({}))
    //   .then(res => {
    //     if (res.resultCode == "1000") {
    //       this.setState({
    //         twog: res.data[0].total,
    //         threeg: res.data[1].total,
    //         fourg: res.data[2].total
    //       });
    //     } else {
    //       message.error(res.message);
    //     }
    //   });
    //查询资产分布信息
    HttpService.post("reportServer/assetquery/getAssetFB", JSON.stringify({}))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            assetCJCost: res.data.cost.split(","),
            assetTotal: res.data.total.split(","),
            assetLocal: res.data.cj.split(",")
          });
        } else {
          message.error(res.message);
        }
      });
  }


  fmoney(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(),
      r = s.split(".")[1];
    var t = "";
    for (var i = 0; i < l.length; i++) {
      t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
  }

  numFormat(num) {
    if (num >= 10000) {
      num = this.fmoney(Math.abs(num / 1000) / 10, 2) + '万';
    } else if (num >= 1000) {
      num = this.fmoney(Math.abs(num / 100) / 10, 2) + '千';
    } else {
      num = this.fmoney(num, 2) + '元';
    }

    return num;
  }



  getMapOption = () => {
    var option = {
      visualMap: {
        show: false,
        min: 0,
        max: 50,
        left: 'left',
        top: 'bottom',
        // text: ['高', '低'], // 文本，默认为数值文本
        calculable: true,
        inRange: {
          color: ['#142957']
        }
      },
      series: [{
        type: 'map',
        zoom: 1.2,
        mapType: '河北',
        roam: true,
        label: {
          normal: {
            show: true,
            color: '#A6C84C',
            areaColor: '#142957',
            borderColor: '#0692a4',
            formatter: '{b}\n{c}',
          },
          emphasis: {
            textStyle: {
              color: '#000'
            }
          }
        },
        itemStyle: {

          normal: {
            borderColor: '#389BB7',
            areaColor: 'white',
            color: '#080A20'
          },
          emphasis: {
            areaColor: '#389BB7',
            borderWidth: 0
          }
        },
        animation: true,
        data: this.state.city_data,
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'quinticInOut'
      }],
      // 值域选择，每个图表最多仅有一个值域控件

    };
    return option;
  }



  getLineOption = () => {
    var option = {
      //鼠标提示工具
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        // 类目类型                                  
        type: 'category',
        // x轴刻度文字                                  
        data: this.state.assetLocal,
        axisTick: {
          show: false//去除刻度线
        },
        axisLabel: {
          color: '#4c9bfd'//文本颜色
        },
        axisLine: {
          show: false//去除轴线  
        },
        boundaryGap: true//去除轴内间距
      },
      yAxis: {
        // 数据作为刻度文字                                  
        type: 'value',
        axisTick: {
          show: false//去除刻度线
        },
        axisLabel: {
          color: '#4c9bfd'//文本颜色
        },
        axisLine: {
          show: false//去除轴线  
        },
        boundaryGap: true//去除轴内间距
      },
      //图例组件
      legend: {
        textStyle: {
          color: '#4c9bfd' // 图例文字颜色

        },
        right: '10%'//距离右边10%
      },
      // 设置网格样式
      grid: {
        show: true,// 显示边框
        top: '20%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        borderColor: '#012f4a',// 边框颜色
        containLabel: true // 包含刻度文字在内
      },
      series: [{
        name: '资产原值(万元)',
        // 数据                                  
        data: this.state.assetCJCost,
        // 图表类型                                  
        type: 'line',
        // 圆滑连接                                  
        smooth: true,
        itemStyle: {
          color: '#00f2f1'  // 线颜色
        }
      },
      {
        name: '资产条数',
        // 数据                                  
        data: this.state.assetTotal,
        // 图表类型                                  
        type: 'bar',
        // 圆滑连接                                  
        // smooth: true,
        barWidth: '20px',
        itemStyle: {
          color: '#ed3f35'  // 线颜色
        }
      }]
    };
    return option;
  }

  getOption2 = () => {
    var item = {
      name: '',
      value: 1200,
      // 柱子颜色
      itemStyle: {
        color: '#254065'
      },
      // 鼠标经过柱子颜色
      emphasis: {
        itemStyle: {
          color: '#254065'
        }
      },
      // 工具提示隐藏
      tooltip: {
        extraCssText: 'opacity:0'
      }
    };

    let option = {
      // 工具提示
      tooltip: {
        // 触发类型  经过轴触发axis  经过轴触发item
        trigger: 'item',
        // 轴触发提示才有效
        axisPointer: {
          // 默认为直线，可选为：'line' 线效果 | 'shadow' 阴影效果       
          type: 'shadow'
        }
      },
      // 图表边界控制
      grid: {
        // 距离 上右下左 的距离
        left: '0',
        right: '3%',
        bottom: '3%',
        top: '5%',
        // 大小是否包含文本【类似于boxsizing】
        containLabel: true,
        //显示边框
        show: true,
        //边框颜色
        borderColor: 'rgba(0, 240, 255, 0.3)'
      },
      // 控制x轴
      xAxis: [
        {
          // 使用类目，必须有data属性
          type: 'category',
          // 使用 data 中的数据设为刻度文字
          data: this.state.typeName,
          // 刻度设置
          axisTick: {
            // true意思：图形在刻度中间
            // false意思：图形在刻度之间
            alignWithLabel: false,
            show: false
          },
          //文字
          axisLabel: {
            color: '#4c9bfd',
            // interval:0,
            // rotate:50,
            formatter: function (value) {
              return value.split("").join("\n")
            }
          }
        }
      ],
      // 控制y轴
      yAxis: [
        {
          // 使用数据的值设为刻度文字
          type: 'value',
          axisTick: {
            // true意思：图形在刻度中间
            // false意思：图形在刻度之间
            alignWithLabel: false,
            show: false
          },
          //文字
          axisLabel: {
            color: '#4c9bfd'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 240, 255, 0.3)'
            }
          },
        }
      ],
      // 控制x轴
      series: [
        {
          // series配置
          // 颜色
          itemStyle: {
            // 提供的工具函数生成渐变颜色
            color: new echarts.graphic.LinearGradient(
              // (x1,y2) 点到点 (x2,y2) 之间进行渐变
              0, 0, 0, 1,
              [
                { offset: 0, color: '#00fffb' }, // 0 起始颜色
                { offset: 1, color: '#0061ce' }  // 1 结束颜色
              ]
            )
          },
          // 图表数据名称
          name: '用户统计',
          // 图表类型
          type: 'bar',
          // 柱子宽度
          barWidth: '60%',
          // 数据
          data: this.state.typeNum
        }
      ]
    };
    return option;
  }

  // 当用户点击查询文本框时显示真正的查询文本框 
  onSearch() {
    window.location.href = "#/AI";
  }

  toAI() {
    window.location.href = "#/Chat";
  }
  onClick = ((el, index) => {
    alert(el);
  })
  onChangeClick(e, index) {
    if (index == 0) {
      window.location.href = "#/Query";
    } else if (index == 1) {
      window.location.href = "#/AI";
    } else if (index == 2) {
      window.location.href = "#/Chat";
    } else if (index == 3) {
      window.location.href = "#/My";
    }
  }


  //界面渲染
  render() {
    return (

      <div >
        {/* <div className="headerBar">
          <CommonSearch onSearch={() => { this.onSearch() }} toAI={() => this.toAI()} />
        </div> */}

        <NavBar
          mode="light"
          style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
        >
          <span style={{ color: 'white' }}>主页</span>
        </NavBar>

        <Carousel
          autoplay={false}
          infinite
          beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
          afterChange={index => console.log('slide to', index)}
        >
          <a
            //href="#/Demo"
            style={{ display: 'inline-block', width: '100%', height: this.state.imgHeight }}
          >
            <img
              src={require("../assets/banner4.png")}
              alt=""
              style={{ width: '100%', verticalAlign: 'top', height: '176px' }}
              onLoad={() => {
                // fire window resize event to change height
                window.dispatchEvent(new Event('resize'));
                this.setState({ imgHeight: '20px' });
              }}
            />
          </a>


        </Carousel>
        <WhiteSpace size="lg" />



        <Card  >
          <Card.Header style={{ fontSize: '14px' }}
            title="物联网资产统计"
          />
          <Card.Body>
            <Flex style={{ textAlign: "center" }}>
              <Flex.Item>
                <div style={{ fontSize: 'small', color: '#999999', marginTop: '5px' }} >基站数量</div>
                <div style={{ fontSize: 'large', color: '#222222', marginTop: '5px' }}>{this.state.baseStationNum}</div>
              </Flex.Item>

              <Flex.Item>
                <div style={{ fontSize: 'small', color: '#999999', marginTop: '5px' }} >资产原值</div>
                <div style={{ fontSize: 'large', color: '#222222', marginTop: '5px' }}>{this.state.assetCost}</div>
              </Flex.Item>

              <Flex.Item>
                <div style={{ fontSize: 'small', color: '#999999', marginTop: '5px' }} >资产数</div>
                <div style={{ fontSize: 'large', color: '#222222', marginTop: '5px' }}>{this.state.asset_num}</div>
              </Flex.Item>
            </Flex>
          </Card.Body>
        </Card>
        <WhiteSpace size="lg" />
        <Card full >
          <Card.Header style={{ fontSize: '14px' }}
            title="资产场景分布"
          />
          <Card.Body>
            <div style={{ width: '100%', height: '300px' }}>

              <ReactEcharts option={this.getLineOption()} />

            </div>
          </Card.Body>
        </Card>

        <WhiteSpace size="lg" />
        <Card full style={{ paddingBottom: '50px' }}>
          <Card.Header style={{ fontSize: '14px' }}
            title="资产类别统计"
          />
          <Card.Body>
            <div style={{ width: '100%', height: '300px' }}>

              <ReactEcharts option={this.getOption2()} />

            </div>
          </Card.Body>
        </Card>

      </div >
    )
  }
}
