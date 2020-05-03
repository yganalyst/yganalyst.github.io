---
title:  "[Dacon] 제주 퇴근시간 버스 승하차 인원 예측 1 - EDA"
excerpt: "Dacon에서 주최되었던 제주 퇴근시간 버스 승하차 인원 예측, 프로젝트를 진행해보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/dacon_logo.png

categories:
  - competition

tags:
  - dacon
  - project
  - machine learning
  - eda
  - histogram
  - describe
  - folium
  - geopandas
  - 프로젝트
  - 데이콘
  - 제주도
  - 버스승하차
  - 예측
  - correlation
  - 상관관계
  - 파생변수
  - 머신러닝 프로젝트

last_modified_at: 2020-03-05T19:00-19:30
---

# 개요  

이미 종료된 Competition이지만 데이콘에서 주최했던, "제주도 퇴근시간 버스 승하차 인원 예측"이라는 프로젝트를 사내 스터디겸 진행해보았다.  
개인적으로 모델링에 집중해서 머신러닝 알고리즘, 페이퍼 리뷰에 초점을 맞추려고 했지만, 결론적으로 시간... 할애를 많이 못했다ㅠㅠ
아쉽지만 정리해 놓고 기회될때 정확도 개선하기로!  
  
  
프로젝트관련 설명과 데이터셋 구성, 스키마 등의 정보는 [여기](https://github.com/yganalyst/dacon_project1)에 정리해 두었다.  

# EDA  

```python
import pandas as pd 
import numpy as np
import os 
import geopandas as gpd
import sys
from shapely.geometry import *
from shapely.ops import *
from fiona.crs import from_string
import warnings
warnings.filterwarnings(action='ignore')

epsg4326 = from_string("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
epsg5179 = from_string("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")

import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib
import matplotlib.font_manager as fm
font_name = fm.FontProperties(fname = 'C:/Windows/Fonts/malgun.ttf').get_name()
matplotlib.rc('font', family = font_name)
import folium
```


```python
os.chdir(r"D:\Python\dacon_bus_inout\data")
print("path: "+os.getcwd())
print(os.listdir())
```

    path: D:\Python\dacon_bus_inout\data
    ['bus_bts.csv', 'LSMD_ADM_SECT_UMD_50.dbf', 'LSMD_ADM_SECT_UMD_50.prj', 'LSMD_ADM_SECT_UMD_50.shp', 'LSMD_ADM_SECT_UMD_50.shx', 'LSMD_ADM_SECT_UMD_제주.zip', 'submission_sample.csv', 'test.csv', 'train.csv', 'weather.csv', '제주도_건물정보1.csv', '제주도_건물정보2.csv', '행정_법정동 중심좌표.xlsx']
    


```python
# dir_ = ""
train = pd.read_csv("train.csv", dtype=str, encoding='utf-8')
test = pd.read_csv("test.csv", dtype=str, encoding='utf-8')
bus_bts = pd.read_csv("bus_bts.csv", dtype=str, encoding='utf-8')
bjd_wgd = pd.read_excel("행정_법정동 중심좌표.xlsx", dtype= str, sheet_name="합본 DB")
sub = pd.read_csv("submission_sample.csv", dtype=str, encoding='utf-8')
print("train :", len(train))
print("test :", len(test))
print("bus_bts :", len(bus_bts))
print("submission_sample :", len(sub))
```

    train : 415423
    test : 228170
    bus_bts : 2409414
    submission_sample : 228170
    

# 1. 데이터 셋  기본정보  

**train set**


```python
train.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>date</th>
      <th>bus_route_id</th>
      <th>in_out</th>
      <th>station_code</th>
      <th>station_name</th>
      <th>latitude</th>
      <th>longitude</th>
      <th>6~7_ride</th>
      <th>7~8_ride</th>
      <th>...</th>
      <th>9~10_ride</th>
      <th>10~11_ride</th>
      <th>11~12_ride</th>
      <th>6~7_takeoff</th>
      <th>7~8_takeoff</th>
      <th>8~9_takeoff</th>
      <th>9~10_takeoff</th>
      <th>10~11_takeoff</th>
      <th>11~12_takeoff</th>
      <th>18~20_ride</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>0</td>
      <td>2019-09-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>344</td>
      <td>제주썬호텔</td>
      <td>33.4899</td>
      <td>126.49373</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>...</td>
      <td>5.0</td>
      <td>2.0</td>
      <td>6.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>1</td>
      <td>2019-09-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>357</td>
      <td>한라병원</td>
      <td>33.48944</td>
      <td>126.48508000000001</td>
      <td>1.0</td>
      <td>4.0</td>
      <td>...</td>
      <td>2.0</td>
      <td>5.0</td>
      <td>6.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>5.0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>2</td>
      <td>2019-09-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>432</td>
      <td>정존마을</td>
      <td>33.481809999999996</td>
      <td>126.47352</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>...</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>3</td>
      <td>2019-09-01</td>
      <td>4270000</td>
      <td>시내</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>33.50577</td>
      <td>126.49252</td>
      <td>0.0</td>
      <td>17.0</td>
      <td>...</td>
      <td>26.0</td>
      <td>14.0</td>
      <td>16.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>53.0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>4</td>
      <td>2019-09-01</td>
      <td>4270000</td>
      <td>시내</td>
      <td>1646</td>
      <td>중문관광단지입구</td>
      <td>33.255790000000005</td>
      <td>126.4126</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 21 columns</p>
</div>



**test set**


```python
test.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>date</th>
      <th>bus_route_id</th>
      <th>in_out</th>
      <th>station_code</th>
      <th>station_name</th>
      <th>latitude</th>
      <th>longitude</th>
      <th>6~7_ride</th>
      <th>7~8_ride</th>
      <th>8~9_ride</th>
      <th>9~10_ride</th>
      <th>10~11_ride</th>
      <th>11~12_ride</th>
      <th>6~7_takeoff</th>
      <th>7~8_takeoff</th>
      <th>8~9_takeoff</th>
      <th>9~10_takeoff</th>
      <th>10~11_takeoff</th>
      <th>11~12_takeoff</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>415423</td>
      <td>2019-10-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>344</td>
      <td>제주썬호텔</td>
      <td>33.4899</td>
      <td>126.49373</td>
      <td>4.0</td>
      <td>4.0</td>
      <td>7.0</td>
      <td>2.0</td>
      <td>9.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>415424</td>
      <td>2019-10-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>357</td>
      <td>한라병원</td>
      <td>33.48944</td>
      <td>126.48508000000001</td>
      <td>1.0</td>
      <td>6.0</td>
      <td>6.0</td>
      <td>1.0</td>
      <td>8.0</td>
      <td>11.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>415425</td>
      <td>2019-10-01</td>
      <td>4270000</td>
      <td>시외</td>
      <td>432</td>
      <td>정존마을</td>
      <td>33.481809999999996</td>
      <td>126.47352</td>
      <td>2.0</td>
      <td>4.0</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>415426</td>
      <td>2019-10-01</td>
      <td>4270000</td>
      <td>시내</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>33.50577</td>
      <td>126.49252</td>
      <td>1.0</td>
      <td>11.0</td>
      <td>18.0</td>
      <td>8.0</td>
      <td>26.0</td>
      <td>20.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>415427</td>
      <td>2019-10-01</td>
      <td>4270000</td>
      <td>시내</td>
      <td>1636</td>
      <td>롯데호텔</td>
      <td>33.24872</td>
      <td>126.41032</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
  </tbody>
</table>
</div>



**bus_bts(버스카드 별 승하차 정보)**  


```python
bus_bts.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>user_card_id</th>
      <th>bus_route_id</th>
      <th>vhc_id</th>
      <th>geton_date</th>
      <th>geton_time</th>
      <th>geton_station_code</th>
      <th>geton_station_name</th>
      <th>getoff_date</th>
      <th>getoff_time</th>
      <th>getoff_station_code</th>
      <th>getoff_station_name</th>
      <th>user_category</th>
      <th>user_count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>1010010127894129.0</td>
      <td>23000000</td>
      <td>149793674</td>
      <td>2019-09-10</td>
      <td>06:34:45</td>
      <td>360</td>
      <td>노형오거리</td>
      <td>2019-09-10</td>
      <td>07:10:31</td>
      <td>592.0</td>
      <td>화북초등학교</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>1</td>
      <td>1010010101730356.0</td>
      <td>23000000</td>
      <td>149793674</td>
      <td>2019-09-10</td>
      <td>06:34:58</td>
      <td>360</td>
      <td>노형오거리</td>
      <td>2019-09-10</td>
      <td>06:56:27</td>
      <td>3273.0</td>
      <td>고산동산(광양방면)</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>2</td>
      <td>1019160032727943.0</td>
      <td>21420000</td>
      <td>149793535</td>
      <td>2019-09-10</td>
      <td>07:19:07</td>
      <td>2495</td>
      <td>동광환승정류장4(제주방면)</td>
      <td>2019-09-10</td>
      <td>07:40:29</td>
      <td>431.0</td>
      <td>정존마을</td>
      <td>4</td>
      <td>1</td>
    </tr>
    <tr>
      <td>3</td>
      <td>1019150001770890.0</td>
      <td>21420000</td>
      <td>149793512</td>
      <td>2019-09-09</td>
      <td>09:14:47</td>
      <td>3282</td>
      <td>대정환승정류장(대정읍사무소)</td>
      <td>2019-09-09</td>
      <td>10:02:46</td>
      <td>431.0</td>
      <td>정존마을</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>4</td>
      <td>1010010097237127.0</td>
      <td>21420000</td>
      <td>149793512</td>
      <td>2019-09-09</td>
      <td>09:28:53</td>
      <td>2820</td>
      <td>삼정지에듀</td>
      <td>2019-09-09</td>
      <td>10:21:37</td>
      <td>2972.0</td>
      <td>제주국제공항(종점)</td>
      <td>4</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



## 1-1. 기초통계  


```python
round(train.describe(),3)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>6~7_ride</th>
      <th>7~8_ride</th>
      <th>8~9_ride</th>
      <th>9~10_ride</th>
      <th>10~11_ride</th>
      <th>11~12_ride</th>
      <th>6~7_takeoff</th>
      <th>7~8_takeoff</th>
      <th>8~9_takeoff</th>
      <th>9~10_takeoff</th>
      <th>10~11_takeoff</th>
      <th>11~12_takeoff</th>
      <th>18~20_ride</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>count</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
      <td>415423.000</td>
    </tr>
    <tr>
      <td>mean</td>
      <td>0.306</td>
      <td>0.830</td>
      <td>0.815</td>
      <td>0.642</td>
      <td>0.600</td>
      <td>0.579</td>
      <td>0.113</td>
      <td>0.345</td>
      <td>0.516</td>
      <td>0.431</td>
      <td>0.408</td>
      <td>0.403</td>
      <td>1.242</td>
    </tr>
    <tr>
      <td>std</td>
      <td>1.110</td>
      <td>2.255</td>
      <td>2.318</td>
      <td>1.960</td>
      <td>1.886</td>
      <td>1.942</td>
      <td>0.598</td>
      <td>1.279</td>
      <td>1.659</td>
      <td>1.485</td>
      <td>1.413</td>
      <td>1.446</td>
      <td>4.722</td>
    </tr>
    <tr>
      <td>min</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
    </tr>
    <tr>
      <td>50%</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
    </tr>
    <tr>
      <td>75%</td>
      <td>0.000</td>
      <td>1.000</td>
      <td>1.000</td>
      <td>1.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>1.000</td>
    </tr>
    <tr>
      <td>max</td>
      <td>85.000</td>
      <td>94.000</td>
      <td>136.000</td>
      <td>78.000</td>
      <td>124.000</td>
      <td>99.000</td>
      <td>45.000</td>
      <td>66.000</td>
      <td>59.000</td>
      <td>65.000</td>
      <td>52.000</td>
      <td>81.000</td>
      <td>272.000</td>
    </tr>
  </tbody>
</table>
</div>




```python
print("시간대별 승차인원 1명 이하 비율")
print(pd.DataFrame({'train':round((train[col_t] <= 1).sum() / len(train) * 100),
                  'test':round((test[col_t] <= 1).sum() / len(test) * 100)}))
```

    시간대별 승차인원 1명 이하 비율
                   train  test
    6~7_ride        94.0  94.0
    7~8_ride        84.0  85.0
    8~9_ride        84.0  84.0
    9~10_ride       87.0  87.0
    10~11_ride      88.0  87.0
    11~12_ride      89.0  88.0
    6~7_takeoff     98.0  98.0
    7~8_takeoff     94.0  94.0
    8~9_takeoff     90.0  90.0
    9~10_takeoff    92.0  91.0
    10~11_takeoff   92.0  91.0
    11~12_takeoff   92.0  91.0
    

- 기본적으로 시간대별 승하차인원과 종속변수인 저녁시간 승차인원(18~20_ride)도 0과 1의 값을 가지는 비율이 80_90%를 차지한다.    
- 회귀문제에서는 이러한 불균형 데이터에 대해 어떤 조치를 취할 수 있을 지 고민해 봐야한다.  

## 1-2. 결측값 확인  


```python
pd.DataFrame({'train':train.isnull().sum(),
              'test':test.isnull().sum()}).fillna('')
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>train</th>
      <th>test</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>10~11_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>10~11_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>11~12_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>11~12_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>18~20_ride</td>
      <td>0</td>
      <td></td>
    </tr>
    <tr>
      <td>6~7_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>6~7_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>7~8_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>7~8_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>8~9_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>8~9_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>9~10_ride</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>9~10_takeoff</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>bus_route_id</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>date</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>id</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>in_out</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>latitude</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>longitude</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>station_code</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>station_name</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>




```python
bus_bts.isnull().sum()
```




    user_card_id                0
    bus_route_id                0
    vhc_id                      0
    geton_date                  0
    geton_time                  0
    geton_station_code          0
    geton_station_name         49
    getoff_date            895736
    getoff_time            895736
    getoff_station_code    895736
    getoff_station_name    895775
    user_category               0
    user_count                  0
    dtype: int64



- 결측값은 bus_bts 데이터에만 존재 : 하차태그 안한 경우(895736, 약 37%), 정류장이름 없음(49)  

## 1-3. 컬럼별 타입변경  


```python
col_t = [str(j)+"~"+ str(j+1) + "_" + str(i) for i in ("ride","takeoff") for j in range(6,12)]
train['date'] = pd.to_datetime(train['date'])
train[col_t + ['18~20_ride']] = train[col_t + ['18~20_ride']].astype(float)
test['date'] = pd.to_datetime(test['date'])
test[col_t] = test[col_t].astype(float)
bus_bts['geton_datetime'] = pd.to_datetime(bus_bts['geton_date'] + ' ' + bus_bts['geton_time'])
bus_bts['getoff_datetime'] = pd.to_datetime(bus_bts['getoff_date'] + ' ' + bus_bts['getoff_time'])
bus_bts['user_category'] = bus_bts['user_category'].astype(int)
bus_bts['user_count'] = bus_bts['user_count'].astype(float)
```

## 1-4. 히스토그램 - 분포 탐색    

**일별, 시간대별(승차), 승차인원 수**  


```python
date_sum_ = train.groupby(['date'])[col_t + ['18~20_ride']].sum()
date_sum_.index = date_sum_.index.date

plt.figure(figsize=(12,12))
ax=plt.subplot(3,1,1)
date_sum_[date_sum_.columns[:6]].plot(kind='bar', ax=ax)
plt.title("ride", fontsize=15)
ax=plt.subplot(3,1,2)
date_sum_[date_sum_.columns[6:-1]].plot(kind='bar', ax=ax)
plt.title("takeoff", fontsize=15)
ax=plt.subplot(3,1,3)
date_sum_[date_sum_.columns[-1]].plot(kind='bar', ax=ax)
plt.title("18~20_ride", fontsize=15)

plt.tight_layout()
plt.show()
```


![png](/assets/images/dacon/bus_in_out/eda_1.png)


- 평일과 주말에 버스 이용율 차이에 대한 패턴이 보인다.  
- 요일 변수(category) 또는 평일여부(dummy) 파생변수에 대한 고려가 필요해보임.  

**요일, 공휴일여부, 주말여부 변수생성**  


```python
def get_dayattr(df):
    # 0(Monday) ~ 6(Sunday)
    df['dayofweek'] = df['date'].dt.dayofweek
    # 추석, 한글날, 개천절
    holiday=['2019-09-12', '2019-09-13', '2019-09-14','2019-10-03','2019-10-09']
    df['weekends'] = np.where(df['dayofweek'] >= 5, 1,0) # 주말여부
    df['holiday'] = np.where(df['date'].isin(holiday), 1,0) # 공휴일여부
    return df
train = get_dayattr(train)
```

**주요 정류장에 대한 평일,쉬는날(평일X)의 버스이용인원 차이 탐색**  


```python
def dayofweek_print_plot(train, idx_min=0,idx_max=15, sorting_col = 'total_ride'):
    # 평일
    train_1 = train[(train['weekends']==0) & (train['holiday']==0)].groupby(['station_code','station_name'])[col_t].sum().reset_index()
    train_1['total_ride'] = train_1[col_t[:6]].sum(axis=1)
    train_1['total_getoff'] = train_1[col_t[6:]].sum(axis=1)
    train_1 = train_1.sort_values(by=sorting_col,ascending=False).reset_index()
    # 쉬는날
    train_2 = train[(train['weekends']==1) | (train['holiday']==1)].groupby(['station_code','station_name'])[col_t].sum().reset_index()
    train_2['total_ride'] = train_2[col_t[:6]].sum(axis=1)
    train_2['total_getoff'] = train_2[col_t[6:]].sum(axis=1)
    # 평일 기준 Top 15 비교
    ls_ = train_1.iloc[idx_min:idx_max]['station_code'].unique().tolist()
    train_1_1 = train_1.iloc[idx_min:idx_max].set_index(['station_code','station_name'])
    train_2_2 = train_2[train_2['station_code'].isin(ls_)].set_index(['station_code','station_name']).reindex(train_1_1.index)
    plt.figure(figsize=(12,12))
    ax = plt.subplot(2,1,1)
    plt.title("평일")
    train_1_1[['total_ride','total_getoff']].plot(kind='bar', ax=ax)
    plt.grid()
    ax = plt.subplot(2,1,2)
    plt.title("쉬는날")
    train_2_2[['total_ride','total_getoff']].plot(kind='bar', ax=ax)
    plt.tight_layout()
    plt.grid()
    plt.show()
```


```python
# (평일기준 sorting) Ride Top 30 bus_station
dayofweek_print_plot(train, idx_min=0,idx_max=30, sorting_col = 'total_ride')
```


![png](/assets/images/dacon/bus_in_out/eda_2.png)


**bus_bts - user_card_id별 버스 승차시간** 


```python
delta_ = (bus_bts['getoff_datetime'] - bus_bts['geton_datetime'])
if delta_.dt.days.max() == 0:  
    bus_bts['travel_time'] = delta_.dt.seconds / 60 # minutes
```


```python
plt.title("travel time(minute) - histogram", fontsize=15)
bus_bts['travel_time'].hist(bins=30)
plt.show()
round(bus_bts['travel_time'].describe(), 2)
```


![png](/assets/images/dacon/bus_in_out/eda_3.png)





    count    1513678.00
    mean          23.23
    std           21.54
    min            0.10
    25%            7.85
    50%           15.85
    75%           31.80
    max          239.77
    Name: travel_time, dtype: float64



- 대부분 승차 ~ 하차 시간은 30분 내외  
- 결측치(하차 태그 약 37% 결측) 대체에 활용해도 무방할 것으로 보임  

**시간대별, 승객유형별 승차태그 빈도수**  


```python
user_cat = {1:'일반',2:'어린이',4:'청소년',6:'경로',
            27:'장애_일반',28:'장애_동반',29:'유공_일반',30:'유공_동반'}
bus_bts['user_category_kr'] = bus_bts['user_category'].replace(user_cat)
bus_bts['geton_hour'] = bus_bts['geton_datetime'].dt.hour
bus_bts.groupby(['geton_hour', 'user_category_kr']).size().plot(kind='bar', figsize=(14,5))
plt.show()
```


![png](/assets/images/dacon/bus_in_out/eda_4.png)


- 청소년 : 7~8시 쯤에 많이타고(등교)  
- 경로 : 두루두루 있고  
- 별다른 이슈는 없음(평일, 쉬는날 구분해서 보기)  
- "누가" "어디서" "언제" 많이 이용하는지를 보기  

# 2. 버스정류소별 좌표정보 테이블    


```python
st_col = ['station_code','station_name','in_out','longitude','latitude']
station_loc = pd.concat([train[st_col], test[st_col]], ignore_index=True).drop_duplicates().reset_index(drop=True)
station_loc[['longitude','latitude']] = station_loc[['longitude','latitude']].astype(float)
station_loc['geometry'] = station_loc.apply(lambda x : Point(x.longitude, x.latitude), axis=1)
station_loc = gpd.GeoDataFrame(station_loc, geometry='geometry', crs=epsg4326)

print("*버스 정류장 수 :", len(station_loc))
print(station_loc['in_out'].value_counts())
station_loc.head()
```

    *버스 정류장 수 : 3601
    시내    3519
    시외      82
    Name: in_out, dtype: int64
    




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>station_code</th>
      <th>station_name</th>
      <th>in_out</th>
      <th>longitude</th>
      <th>latitude</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>344</td>
      <td>제주썬호텔</td>
      <td>시외</td>
      <td>126.49373</td>
      <td>33.48990</td>
      <td>POINT (126.49373 33.4899)</td>
    </tr>
    <tr>
      <td>1</td>
      <td>357</td>
      <td>한라병원</td>
      <td>시외</td>
      <td>126.48508</td>
      <td>33.48944</td>
      <td>POINT (126.48508 33.48944)</td>
    </tr>
    <tr>
      <td>2</td>
      <td>432</td>
      <td>정존마을</td>
      <td>시외</td>
      <td>126.47352</td>
      <td>33.48181</td>
      <td>POINT (126.47352 33.48181)</td>
    </tr>
    <tr>
      <td>3</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>시내</td>
      <td>126.49252</td>
      <td>33.50577</td>
      <td>POINT (126.49252 33.50577)</td>
    </tr>
    <tr>
      <td>4</td>
      <td>1646</td>
      <td>중문관광단지입구</td>
      <td>시내</td>
      <td>126.41260</td>
      <td>33.25579</td>
      <td>POINT (126.4126 33.25579)</td>
    </tr>
  </tbody>
</table>
</div>




```python
jeju_bjd = gpd.GeoDataFrame.from_file('LSMD_ADM_SECT_UMD_50.shp',encoding='cp949')
if jeju_bjd.crs is None:
    jeju_bjd.crs = epsg5179
else:
    jeju_bjd = jeju_bjd.to_crs(epsg4326)
#    jeju_bjd = jeju_bjd.explode().reset_index(drop=True)
```


```python
ax=jeju_bjd.boundary.plot(linewidth=1,color='black',figsize=(10,10))
station_loc[station_loc['in_out']=="시내"].plot(ax=ax, color='blue',markersize=9, alpha=.4, label='시내')
station_loc[station_loc['in_out']=="시외"].plot(ax=ax, color='red',markersize=9,  label='시외')
plt.legend(fontsize=15)
plt.axis('off')
plt.show()
```


![png](/assets/images/dacon/bus_in_out/eda_5.png)


- 시내, 시외 버스 정류장의 의미 불분명  
- 고립된 정류장과 그렇지 않은 정류장을 구분할 필요가 있음  

## 2-1 folium으로 동적 지도 생성  


```python
from folium.plugins import MarkerCluster
def add_marker(map_, geo_df, cluster_op = False, c='red'):
    if cluster_op:
        marker_cluster = MarkerCluster().add_to(map_)
    for i in range(len(geo_df)):   
        marker=folium.Marker(
              location=[station_loc.geometry.y[i], station_loc.geometry.x[i]],
              popup=station_loc.station_name[i],
              icon=folium.Icon(color=c,icon='star')
            )
        if cluster_op:
            marker.add_to(marker_cluster)
        else:
            marker.add_to(map_)
```


```python
jeju_airport = [33.50577,126.49252] # 제주공항
osm_map = folium.Map(location=jeju_airport, zoom_start=9)
add_marker(osm_map, station_loc[station_loc['in_out']=="시외"], cluster_op = True, c='blue')
osm_map
```




<div style="width:100%;">

<div style="position:relative;width:100%;height:0;padding-bottom:60%;"><iframe src="about:blank" style="position:absolute;width:100%;height:100%;left:0;top:0;border:none !important;" data-html="PCFET0NUWVBFIGh0bWw+CjxoZWFkPiAgICAKICAgIDxtZXRhIGh0dHAtZXF1aXY9ImNvbnRlbnQtdHlwZSIgY29udGVudD0idGV4dC9odG1sOyBjaGFyc2V0PVVURi04IiAvPgogICAgCiAgICAgICAgPHNjcmlwdD4KICAgICAgICAgICAgTF9OT19UT1VDSCA9IGZhbHNlOwogICAgICAgICAgICBMX0RJU0FCTEVfM0QgPSBmYWxzZTsKICAgICAgICA8L3NjcmlwdD4KICAgIAogICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vbGVhZmxldEAxLjUuMS9kaXN0L2xlYWZsZXQuanMiPjwvc2NyaXB0PgogICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS0xLjEyLjQubWluLmpzIj48L3NjcmlwdD4KICAgIDxzY3JpcHQgc3JjPSJodHRwczovL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjIuMC9qcy9ib290c3RyYXAubWluLmpzIj48L3NjcmlwdD4KICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9MZWFmbGV0LmF3ZXNvbWUtbWFya2Vycy8yLjAuMi9sZWFmbGV0LmF3ZXNvbWUtbWFya2Vycy5qcyI+PC9zY3JpcHQ+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vbGVhZmxldEAxLjUuMS9kaXN0L2xlYWZsZXQuY3NzIi8+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vbWF4Y2RuLmJvb3RzdHJhcGNkbi5jb20vYm9vdHN0cmFwLzMuMi4wL2Nzcy9ib290c3RyYXAubWluLmNzcyIvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjIuMC9jc3MvYm9vdHN0cmFwLXRoZW1lLm1pbi5jc3MiLz4KICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9mb250LWF3ZXNvbWUvNC42LjMvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzIi8+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL0xlYWZsZXQuYXdlc29tZS1tYXJrZXJzLzIuMC4yL2xlYWZsZXQuYXdlc29tZS1tYXJrZXJzLmNzcyIvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL3Jhd2Nkbi5naXRoYWNrLmNvbS9weXRob24tdmlzdWFsaXphdGlvbi9mb2xpdW0vbWFzdGVyL2ZvbGl1bS90ZW1wbGF0ZXMvbGVhZmxldC5hd2Vzb21lLnJvdGF0ZS5jc3MiLz4KICAgIDxzdHlsZT5odG1sLCBib2R5IHt3aWR0aDogMTAwJTtoZWlnaHQ6IDEwMCU7bWFyZ2luOiAwO3BhZGRpbmc6IDA7fTwvc3R5bGU+CiAgICA8c3R5bGU+I21hcCB7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7cmlnaHQ6MDtsZWZ0OjA7fTwvc3R5bGU+CiAgICAKICAgICAgICAgICAgPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwKICAgICAgICAgICAgICAgIGluaXRpYWwtc2NhbGU9MS4wLCBtYXhpbXVtLXNjYWxlPTEuMCwgdXNlci1zY2FsYWJsZT1ubyIgLz4KICAgICAgICAgICAgPHN0eWxlPgogICAgICAgICAgICAgICAgI21hcF8yYmU2YzViMGEwZjU0ZDg4YjM4ZmEyYjg5ODY5ZmUzZCB7CiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAuMCU7CiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAuMCU7CiAgICAgICAgICAgICAgICAgICAgbGVmdDogMC4wJTsKICAgICAgICAgICAgICAgICAgICB0b3A6IDAuMCU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIDwvc3R5bGU+CiAgICAgICAgCiAgICA8c2NyaXB0IHNyYz0iaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbGVhZmxldC5tYXJrZXJjbHVzdGVyLzEuMS4wL2xlYWZsZXQubWFya2VyY2x1c3Rlci5qcyI+PC9zY3JpcHQ+CiAgICA8bGluayByZWw9InN0eWxlc2hlZXQiIGhyZWY9Imh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2xlYWZsZXQubWFya2VyY2x1c3Rlci8xLjEuMC9NYXJrZXJDbHVzdGVyLmNzcyIvPgogICAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIvMS4xLjAvTWFya2VyQ2x1c3Rlci5EZWZhdWx0LmNzcyIvPgo8L2hlYWQ+Cjxib2R5PiAgICAKICAgIAogICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb2xpdW0tbWFwIiBpZD0ibWFwXzJiZTZjNWIwYTBmNTRkODhiMzhmYTJiODk4NjlmZTNkIiA+PC9kaXY+CiAgICAgICAgCjwvYm9keT4KPHNjcmlwdD4gICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcF8yYmU2YzViMGEwZjU0ZDg4YjM4ZmEyYjg5ODY5ZmUzZCA9IEwubWFwKAogICAgICAgICAgICAgICAgIm1hcF8yYmU2YzViMGEwZjU0ZDg4YjM4ZmEyYjg5ODY5ZmUzZCIsCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBbMzMuNTA1NzcsIDEyNi40OTI1Ml0sCiAgICAgICAgICAgICAgICAgICAgY3JzOiBMLkNSUy5FUFNHMzg1NywKICAgICAgICAgICAgICAgICAgICB6b29tOiA5LAogICAgICAgICAgICAgICAgICAgIHpvb21Db250cm9sOiB0cnVlLAogICAgICAgICAgICAgICAgICAgIHByZWZlckNhbnZhczogZmFsc2UsCiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICk7CgogICAgICAgICAgICAKCiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIHRpbGVfbGF5ZXJfYzAwZjFlOTBiMjRhNDZjMzkwYjQ1OGFkMTA4NDE0NzcgPSBMLnRpbGVMYXllcigKICAgICAgICAgICAgICAgICJodHRwczovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZyIsCiAgICAgICAgICAgICAgICB7ImF0dHJpYnV0aW9uIjogIkRhdGEgYnkgXHUwMDI2Y29weTsgXHUwMDNjYSBocmVmPVwiaHR0cDovL29wZW5zdHJlZXRtYXAub3JnXCJcdTAwM2VPcGVuU3RyZWV0TWFwXHUwMDNjL2FcdTAwM2UsIHVuZGVyIFx1MDAzY2EgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCJcdTAwM2VPRGJMXHUwMDNjL2FcdTAwM2UuIiwgImRldGVjdFJldGluYSI6IGZhbHNlLCAibWF4TmF0aXZlWm9vbSI6IDE4LCAibWF4Wm9vbSI6IDE4LCAibWluWm9vbSI6IDAsICJub1dyYXAiOiBmYWxzZSwgIm9wYWNpdHkiOiAxLCAic3ViZG9tYWlucyI6ICJhYmMiLCAidG1zIjogZmFsc2V9CiAgICAgICAgICAgICkuYWRkVG8obWFwXzJiZTZjNWIwYTBmNTRkODhiMzhmYTJiODk4NjlmZTNkKTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjggPSBMLm1hcmtlckNsdXN0ZXJHcm91cCgKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcF8yYmU2YzViMGEwZjU0ZDg4YjM4ZmEyYjg5ODY5ZmUzZC5hZGRMYXllcihtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9lMDg4ZTI4N2Y2YTg0YzJhYTQ4MGZmYzQxZTNmZjBiNyA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4OTksIDEyNi40OTM3M10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl84MmE2ODE4NzFmYmQ0MTI2Yjk4ZDhmNGE0YmJiZmU4NyA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2UwODhlMjg3ZjZhODRjMmFhNDgwZmZjNDFlM2ZmMGI3LnNldEljb24oaWNvbl84MmE2ODE4NzFmYmQ0MTI2Yjk4ZDhmNGE0YmJiZmU4Nyk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfMTE2Mzc4NjY4ZDA0NDNiMTg0MDMzY2UxYmM2MjVmOWIgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2RhODA0MDlmMjk0ZjQ0ZGZhMmFiMDUyNTM1Mjc4ZGE0ID0gJChgPGRpdiBpZD0iaHRtbF9kYTgwNDA5ZjI5NGY0NGRmYTJhYjA1MjUzNTI3OGRhNCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO87I2s7Zi47YWUPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzExNjM3ODY2OGQwNDQzYjE4NDAzM2NlMWJjNjI1ZjliLnNldENvbnRlbnQoaHRtbF9kYTgwNDA5ZjI5NGY0NGRmYTJhYjA1MjUzNTI3OGRhNCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9lMDg4ZTI4N2Y2YTg0YzJhYTQ4MGZmYzQxZTNmZjBiNy5iaW5kUG9wdXAocG9wdXBfMTE2Mzc4NjY4ZDA0NDNiMTg0MDMzY2UxYmM2MjVmOWIpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfYTkyMDlmMDE1ZTNiNDNkMGE2NjUzYmM0ZDhmMTk3NzcgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40ODk0NCwgMTI2LjQ4NTA4MDAwMDAwMDAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzY4Y2NiNzQ2NGRiMjRkYWM5ODQ4ZTY5MzE1ODY4ODExID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfYTkyMDlmMDE1ZTNiNDNkMGE2NjUzYmM0ZDhmMTk3Nzcuc2V0SWNvbihpY29uXzY4Y2NiNzQ2NGRiMjRkYWM5ODQ4ZTY5MzE1ODY4ODExKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF85NTBkZDQ3MGQ5N2M0YWQwYWZiZjk2YjMwNGY2MjQxZCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfZDEzZTg3OWVjMTI2NDcwZmExZTJlNmE1M2NjYTM1MGEgPSAkKGA8ZGl2IGlkPSJodG1sX2QxM2U4NzllYzEyNjQ3MGZhMWUyZTZhNTNjY2EzNTBhIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7tlZzrnbzrs5Hsm5A8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfOTUwZGQ0NzBkOTdjNGFkMGFmYmY5NmIzMDRmNjI0MWQuc2V0Q29udGVudChodG1sX2QxM2U4NzllYzEyNjQ3MGZhMWUyZTZhNTNjY2EzNTBhKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2E5MjA5ZjAxNWUzYjQzZDBhNjY1M2JjNGQ4ZjE5Nzc3LmJpbmRQb3B1cChwb3B1cF85NTBkZDQ3MGQ5N2M0YWQwYWZiZjk2YjMwNGY2MjQxZCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl84NTk4NmM1MTU5NzM0MWZkYWEyNGVjODZmOWQwZjk1ZiA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4MTgwOTk5OTk5OTk5NiwgMTI2LjQ3MzUyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2Q4ZmM2YTNjNjE2NDQ5MTY4NzdjOTQyYzNiOTg0YTBmID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfODU5ODZjNTE1OTczNDFmZGFhMjRlYzg2ZjlkMGY5NWYuc2V0SWNvbihpY29uX2Q4ZmM2YTNjNjE2NDQ5MTY4NzdjOTQyYzNiOTg0YTBmKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8zZWQ2YTk1YzdmMWY0YWVkODE2ODQyZmI5OWEzYWQ0MiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOWY5N2ZhMzVjOWQ3NDkzZGI3M2JiMTAwYjViNGIyMTUgPSAkKGA8ZGl2IGlkPSJodG1sXzlmOTdmYTM1YzlkNzQ5M2RiNzNiYjEwMGI1YjRiMjE1IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7soJXsobTrp4jsnYQ8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfM2VkNmE5NWM3ZjFmNGFlZDgxNjg0MmZiOTlhM2FkNDIuc2V0Q29udGVudChodG1sXzlmOTdmYTM1YzlkNzQ5M2RiNzNiYjEwMGI1YjRiMjE1KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzg1OTg2YzUxNTk3MzQxZmRhYTI0ZWM4NmY5ZDBmOTVmLmJpbmRQb3B1cChwb3B1cF8zZWQ2YTk1YzdmMWY0YWVkODE2ODQyZmI5OWEzYWQ0MikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9lMTk5ODFhZjJkMDc0MDk3OTdmMzRiM2U2OTliMDQwYyA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjUwNTc3LCAxMjYuNDkyNTJdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fN2Q4MjA0YzQwMGNjNDFjNmI3ZDcyMzAyZTE5NDc5NDIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9lMTk5ODFhZjJkMDc0MDk3OTdmMzRiM2U2OTliMDQwYy5zZXRJY29uKGljb25fN2Q4MjA0YzQwMGNjNDFjNmI3ZDcyMzAyZTE5NDc5NDIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzhiZWI2Y2Q3OGIwMzQ5MzY4YTU5NTc0MjMyZGQwYTliID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF83NTljYWY0ODFjY2E0YzQ2OWFmMzkwMTc4ZTBjNzgwMyA9ICQoYDxkaXYgaWQ9Imh0bWxfNzU5Y2FmNDgxY2NhNGM0NjlhZjM5MDE3OGUwYzc4MDMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuygnOyjvOq1reygnOqzte2VrSg2MDDrsogpPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzhiZWI2Y2Q3OGIwMzQ5MzY4YTU5NTc0MjMyZGQwYTliLnNldENvbnRlbnQoaHRtbF83NTljYWY0ODFjY2E0YzQ2OWFmMzkwMTc4ZTBjNzgwMyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9lMTk5ODFhZjJkMDc0MDk3OTdmMzRiM2U2OTliMDQwYy5iaW5kUG9wdXAocG9wdXBfOGJlYjZjZDc4YjAzNDkzNjhhNTk1NzQyMzJkZDBhOWIpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZDczMWUwNzZmOGRlNDQ3ZmI1Y2FhNDk3NTBmOTUzZGEgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNTU3OTAwMDAwMDAwMDUsIDEyNi40MTI2XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzAyNDYzNWQ4MjY3YzQwYTBiZjk2MTIwMjUzNzJmZjQ0ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZDczMWUwNzZmOGRlNDQ3ZmI1Y2FhNDk3NTBmOTUzZGEuc2V0SWNvbihpY29uXzAyNDYzNWQ4MjY3YzQwYTBiZjk2MTIwMjUzNzJmZjQ0KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF80YjEzYmYzOGE5YWI0ODJkOWQ0Y2UzMzRlYTM0MjlmYiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfZDM5Y2ExNTc3ZDUzNDE0MWIzMDE3MzE2MTk1YmFiYzMgPSAkKGA8ZGl2IGlkPSJodG1sX2QzOWNhMTU3N2Q1MzQxNDFiMzAxNzMxNjE5NWJhYmMzIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7spJHrrLjqtIDqtJHri6jsp4DsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNGIxM2JmMzhhOWFiNDgyZDlkNGNlMzM0ZWEzNDI5ZmIuc2V0Q29udGVudChodG1sX2QzOWNhMTU3N2Q1MzQxNDFiMzAxNzMxNjE5NWJhYmMzKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2Q3MzFlMDc2ZjhkZTQ0N2ZiNWNhYTQ5NzUwZjk1M2RhLmJpbmRQb3B1cChwb3B1cF80YjEzYmYzOGE5YWI0ODJkOWQ0Y2UzMzRlYTM0MjlmYikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl82M2IxYmM1Njc0YmQ0Y2EyOThkM2VmY2VkYjJmMzJkZSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1ODYyLCAxMjYuNDA0NDJdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fMjNhZjM3ODBkNzBjNGJlMjhmNGVlOGUxZDJmMTVkODggPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl82M2IxYmM1Njc0YmQ0Y2EyOThkM2VmY2VkYjJmMzJkZS5zZXRJY29uKGljb25fMjNhZjM3ODBkNzBjNGJlMjhmNGVlOGUxZDJmMTVkODgpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2I5Zjk4YzhjMjg1MjRiMTY4ZDE1MmZmMDM2ZWVkMjU4ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9iZGYzZjM4ZjkwNzg0MmJjYjczMDhjMzZkZmVhYzU2MSA9ICQoYDxkaXYgaWQ9Imh0bWxfYmRmM2YzOGY5MDc4NDJiY2I3MzA4YzM2ZGZlYWM1NjEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyYiOuemOyeheq1rDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9iOWY5OGM4YzI4NTI0YjE2OGQxNTJmZjAzNmVlZDI1OC5zZXRDb250ZW50KGh0bWxfYmRmM2YzOGY5MDc4NDJiY2I3MzA4YzM2ZGZlYWM1NjEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNjNiMWJjNTY3NGJkNGNhMjk4ZDNlZmNlZGIyZjMyZGUuYmluZFBvcHVwKHBvcHVwX2I5Zjk4YzhjMjg1MjRiMTY4ZDE1MmZmMDM2ZWVkMjU4KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzRkOTM5ZGQzYzM3NDQwYzNhNjRjMmNmZmVjMmJlOGY1ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQzMDksIDEyNi40MjQ3Ml0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81ODNhZTVkMzVjZDU0MmQ2ODdmZmJlMjVkMjMyMDViZiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzRkOTM5ZGQzYzM3NDQwYzNhNjRjMmNmZmVjMmJlOGY1LnNldEljb24oaWNvbl81ODNhZTVkMzVjZDU0MmQ2ODdmZmJlMjVkMjMyMDViZik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfMjJiNGJlYmUyMjRhNDczODgzYzkwNTAxOWYzZDQ1ODUgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzA2M2I3OGQzOGI4NDRhZWY5NDc2NzRlZmI3MDJhZDQ3ID0gJChgPGRpdiBpZD0iaHRtbF8wNjNiNzhkMzhiODQ0YWVmOTQ3Njc0ZWZiNzAyYWQ0NyIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO86rWt7KCc7Luo67Kk7IWY7IS87YSw7KSR66y464yA7Y+s7ZW07JWI7KO87IOB7KCI66as64yAPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzIyYjRiZWJlMjI0YTQ3Mzg4M2M5MDUwMTlmM2Q0NTg1LnNldENvbnRlbnQoaHRtbF8wNjNiNzhkMzhiODQ0YWVmOTQ3Njc0ZWZiNzAyYWQ0Nyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl80ZDkzOWRkM2MzNzQ0MGMzYTY0YzJjZmZlYzJiZThmNS5iaW5kUG9wdXAocG9wdXBfMjJiNGJlYmUyMjRhNDczODgzYzkwNTAxOWYzZDQ1ODUpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZDYyMDU4NGVjZTNmNDhiZWJjZmFlYmQ1MDNkZDcwNDIgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNjU5OCwgMTI2LjM3MDgyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzUxYzY4MDg0OWVhZjQ1YjI5NTdkMmNhZTc5NDM1ZDhkID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZDYyMDU4NGVjZTNmNDhiZWJjZmFlYmQ1MDNkZDcwNDIuc2V0SWNvbihpY29uXzUxYzY4MDg0OWVhZjQ1YjI5NTdkMmNhZTc5NDM1ZDhkKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF84M2RkNGZkZTJiNDY0OTE4OGNhYjA1NzQwOWZkYzU4ZiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfM2IyN2U3ODBhNjMyNGU4MWE4MTZiNTFhYzA1ODY0OGMgPSAkKGA8ZGl2IGlkPSJodG1sXzNiMjdlNzgwYTYzMjRlODFhODE2YjUxYWMwNTg2NDhjIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7ssL3sspzrpqw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfODNkZDRmZGUyYjQ2NDkxODhjYWIwNTc0MDlmZGM1OGYuc2V0Q29udGVudChodG1sXzNiMjdlNzgwYTYzMjRlODFhODE2YjUxYWMwNTg2NDhjKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2Q2MjA1ODRlY2UzZjQ4YmViY2ZhZWJkNTAzZGQ3MDQyLmJpbmRQb3B1cChwb3B1cF84M2RkNGZkZTJiNDY0OTE4OGNhYjA1NzQwOWZkYzU4ZikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl81MjkwYTczMTZhOWE0YTBkYTg0MDQ5MTFkMjU2ZmQzNCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjIzNjAzLCAxMjYuNDc4MjddLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZjEzZTIyMmUyYzY4NGY4N2ExZWFlNWNlYTU1YTczMzQgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl81MjkwYTczMTZhOWE0YTBkYTg0MDQ5MTFkMjU2ZmQzNC5zZXRJY29uKGljb25fZjEzZTIyMmUyYzY4NGY4N2ExZWFlNWNlYTU1YTczMzQpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2E5OTllOWJiMWNhMDQ0YTQ4OGYyYjM1NzFmODdhZTFhID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8xNjY5ZTA5MGE0NTM0MmY2OTAyZTg1M2ViODQ5MTI2YyA9ICQoYDxkaXYgaWQ9Imh0bWxfMTY2OWUwOTBhNDUzNDJmNjkwMmU4NTNlYjg0OTEyNmMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuqwleygleuGje2YkTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9hOTk5ZTliYjFjYTA0NGE0ODhmMmIzNTcxZjg3YWUxYS5zZXRDb250ZW50KGh0bWxfMTY2OWUwOTBhNDUzNDJmNjkwMmU4NTNlYjg0OTEyNmMpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNTI5MGE3MzE2YTlhNGEwZGE4NDA0OTExZDI1NmZkMzQuYmluZFBvcHVwKHBvcHVwX2E5OTllOWJiMWNhMDQ0YTQ4OGYyYjM1NzFmODdhZTFhKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2VhMDZhMDIwNDdmNTQ4MmU5YzEyM2ZhODlhN2Y0ZDdjID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjM5NzcsIDEyNi41NjQ1XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzAxMjUxMDQ0NTVkODQ4Y2ZiOWRkZmIwYzRkOGVhMWZhID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZWEwNmEwMjA0N2Y1NDgyZTljMTIzZmE4OWE3ZjRkN2Muc2V0SWNvbihpY29uXzAxMjUxMDQ0NTVkODQ4Y2ZiOWRkZmIwYzRkOGVhMWZhKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9lNDAyOTA4YjM3YjE0ZjQ3YTJlMDNhYTk4YWJjNzE0MyA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMzE1NWY5YjAyYjY2NDhkNmE3OGI3NzhhZmZlYjU3NjEgPSAkKGA8ZGl2IGlkPSJodG1sXzMxNTVmOWIwMmI2NjQ4ZDZhNzhiNzc4YWZmZWI1NzYxIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7shJzqt4Dtj6ztla08L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfZTQwMjkwOGIzN2IxNGY0N2EyZTAzYWE5OGFiYzcxNDMuc2V0Q29udGVudChodG1sXzMxNTVmOWIwMmI2NjQ4ZDZhNzhiNzc4YWZmZWI1NzYxKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2VhMDZhMDIwNDdmNTQ4MmU5YzEyM2ZhODlhN2Y0ZDdjLmJpbmRQb3B1cChwb3B1cF9lNDAyOTA4YjM3YjE0ZjQ3YTJlMDNhYTk4YWJjNzE0MykKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8zYmRmYjIyNjliYzM0N2I0YWQyMjAxOGM0ODA3NmE5OSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0NjEzLCAxMjYuNTU5NTddLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZDg0NGRjZGY1YTViNGM3Mzg1YjYzNTA5OTFiYTIwY2QgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8zYmRmYjIyNjliYzM0N2I0YWQyMjAxOGM0ODA3NmE5OS5zZXRJY29uKGljb25fZDg0NGRjZGY1YTViNGM3Mzg1YjYzNTA5OTFiYTIwY2QpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzFiNTYzNWU3MjMwMDQ5YmViZDI3YjQ3MzlhNzFiMmYxID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9hZDNhMDAwNmUxZmI0MjdkOWJiYzhhNjliZGYxYzBlNyA9ICQoYDxkaXYgaWQ9Imh0bWxfYWQzYTAwMDZlMWZiNDI3ZDliYmM4YTY5YmRmMWMwZTciIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuJtOqyveuCqO2YuO2FlDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8xYjU2MzVlNzIzMDA0OWJlYmQyN2I0NzM5YTcxYjJmMS5zZXRDb250ZW50KGh0bWxfYWQzYTAwMDZlMWZiNDI3ZDliYmM4YTY5YmRmMWMwZTcpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfM2JkZmIyMjY5YmMzNDdiNGFkMjIwMThjNDgwNzZhOTkuYmluZFBvcHVwKHBvcHVwXzFiNTYzNWU3MjMwMDQ5YmViZDI3YjQ3MzlhNzFiMmYxKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2FjOGYxMmIwYjRjNjQ3M2RhMTIyYTg0Y2ZkMTIxMmYyID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQ3NzUsIDEyNi40MDc5MzAwMDAwMDAwMV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl83ZDE4NThkZWIwZWI0YjUyYWY0NmM2NWMxZmM0MzE1NiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2FjOGYxMmIwYjRjNjQ3M2RhMTIyYTg0Y2ZkMTIxMmYyLnNldEljb24oaWNvbl83ZDE4NThkZWIwZWI0YjUyYWY0NmM2NWMxZmM0MzE1Nik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfYjA3ZTIxYjJmMmUxNDgyMTg2MWFlY2VlZmU3N2Q5YjcgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzc4NGI3MDE3OTY1NjQ1M2NhZmQ4NjY4MDgzN2RjZWZkID0gJChgPGRpdiBpZD0iaHRtbF83ODRiNzAxNzk2NTY0NTNjYWZkODY2ODA4MzdkY2VmZCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7Iug65287Zi47YWUPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2IwN2UyMWIyZjJlMTQ4MjE4NjFhZWNlZWZlNzdkOWI3LnNldENvbnRlbnQoaHRtbF83ODRiNzAxNzk2NTY0NTNjYWZkODY2ODA4MzdkY2VmZCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9hYzhmMTJiMGI0YzY0NzNkYTEyMmE4NGNmZDEyMTJmMi5iaW5kUG9wdXAocG9wdXBfYjA3ZTIxYjJmMmUxNDgyMTg2MWFlY2VlZmU3N2Q5YjcpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZTM5YWEwMTJkOWI5NDA0MGE4MWMxYmEwZjNhYzY1YmMgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNDUxMSwgMTI2LjQwNTc5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzQ1MGI2MTAxODQ0MzRiMjc5ZjU4NTFiZjk0MmQwZGNlID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZTM5YWEwMTJkOWI5NDA0MGE4MWMxYmEwZjNhYzY1YmMuc2V0SWNvbihpY29uXzQ1MGI2MTAxODQ0MzRiMjc5ZjU4NTFiZjk0MmQwZGNlKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF85MjE2NzNkMDc3MDI0ZTZkOTk0OTIwN2RlMjNhNmIxMSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfZTExZmM1MGU0MjU3NGRmZmI5MmU3YjUyYmZiY2I2NDMgPSAkKGA8ZGl2IGlkPSJodG1sX2UxMWZjNTBlNDI1NzRkZmZiOTJlN2I1MmJmYmNiNjQzIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7tlZjslo/tirjtmLjthZQ8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfOTIxNjczZDA3NzAyNGU2ZDk5NDkyMDdkZTIzYTZiMTEuc2V0Q29udGVudChodG1sX2UxMWZjNTBlNDI1NzRkZmZiOTJlN2I1MmJmYmNiNjQzKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2UzOWFhMDEyZDliOTQwNDBhODFjMWJhMGYzYWM2NWJjLmJpbmRQb3B1cChwb3B1cF85MjE2NzNkMDc3MDI0ZTZkOTk0OTIwN2RlMjNhNmIxMSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9mNTYzYjU5NTg0NjY0OTI4OTM2OGFiY2Q0ZGJiMWM2ZiA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1MDI0MDAwMDAwMDAwNSwgMTI2LjQxMDIyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzFhMWYwYjAyNmI4ODRkZTQ5YmIxNzk3MzAyZjM3YTQ3ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZjU2M2I1OTU4NDY2NDkyODkzNjhhYmNkNGRiYjFjNmYuc2V0SWNvbihpY29uXzFhMWYwYjAyNmI4ODRkZTQ5YmIxNzk3MzAyZjM3YTQ3KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF81OTgzZWUwZWZjZTg0MDQwYTZiZWQwMmJkZmIyYzkwMCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMDZmMjcwNDU5Y2IwNDZjZDg2Y2Y4YTAyMzJmMmI0YzIgPSAkKGA8ZGl2IGlkPSJodG1sXzA2ZjI3MDQ1OWNiMDQ2Y2Q4NmNmOGEwMjMyZjJiNGMyIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7tlZzqta3svZjrj4TsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNTk4M2VlMGVmY2U4NDA0MGE2YmVkMDJiZGZiMmM5MDAuc2V0Q29udGVudChodG1sXzA2ZjI3MDQ1OWNiMDQ2Y2Q4NmNmOGEwMjMyZjJiNGMyKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2Y1NjNiNTk1ODQ2NjQ5Mjg5MzY4YWJjZDRkYmIxYzZmLmJpbmRQb3B1cChwb3B1cF81OTgzZWUwZWZjZTg0MDQwYTZiZWQwMmJkZmIyYzkwMCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8xYzUzZTcxM2IyM2E0MDBjODdmZjI3NGZhMTNlZjY1MyA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1MDM3MDAwMDAwMDAwNCwgMTI2LjQwOTkyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzI5NjRmMzI0MGJlMjQ3ZTQ5NmM1ZGU3ZGI4Yzk3ODNjID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfMWM1M2U3MTNiMjNhNDAwYzg3ZmYyNzRmYTEzZWY2NTMuc2V0SWNvbihpY29uXzI5NjRmMzI0MGJlMjQ3ZTQ5NmM1ZGU3ZGI4Yzk3ODNjKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8xZjE2ZmM1MDVmNTc0NzM4OGNkY2VhM2JhOTIxZjhiNyA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfZjQ2MzExMWI1NGM5NDFiMDkyMDQ2MjlkYWU2MGViNDUgPSAkKGA8ZGl2IGlkPSJodG1sX2Y0NjMxMTFiNTRjOTQxYjA5MjA0NjI5ZGFlNjBlYjQ1IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7svITsi7HthLTsoJzso7ztmLjthZTsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfMWYxNmZjNTA1ZjU3NDczODhjZGNlYTNiYTkyMWY4Yjcuc2V0Q29udGVudChodG1sX2Y0NjMxMTFiNTRjOTQxYjA5MjA0NjI5ZGFlNjBlYjQ1KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzFjNTNlNzEzYjIzYTQwMGM4N2ZmMjc0ZmExM2VmNjUzLmJpbmRQb3B1cChwb3B1cF8xZjE2ZmM1MDVmNTc0NzM4OGNkY2VhM2JhOTIxZjhiNykKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl82OWZkM2I4MGUxYjQ0ODE1ODUzZTkwM2QwZTcxM2QwNCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0OTA0LCAxMjYuNDA3NjddLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fNWMyNTNiM2U1ZDdlNDljZjgwNjJhNDgxYTBkMmMwZDkgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl82OWZkM2I4MGUxYjQ0ODE1ODUzZTkwM2QwZTcxM2QwNC5zZXRJY29uKGljb25fNWMyNTNiM2U1ZDdlNDljZjgwNjJhNDgxYTBkMmMwZDkpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzRlOWRmM2ViNTM1YTRlMmJiMTA4OTRmMDI4MTg1OGNlID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8wNGIxNGNjOWFhY2E0ODQwYjAzN2E3Y2RiZTBlZmE5NiA9ICQoYDxkaXYgaWQ9Imh0bWxfMDRiMTRjYzlhYWNhNDg0MGIwMzdhN2NkYmUwZWZhOTYiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyKpOychO2KuO2YuO2FlDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF80ZTlkZjNlYjUzNWE0ZTJiYjEwODk0ZjAyODE4NThjZS5zZXRDb250ZW50KGh0bWxfMDRiMTRjYzlhYWNhNDg0MGIwMzdhN2NkYmUwZWZhOTYpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNjlmZDNiODBlMWI0NDgxNTg1M2U5MDNkMGU3MTNkMDQuYmluZFBvcHVwKHBvcHVwXzRlOWRmM2ViNTM1YTRlMmJiMTA4OTRmMDI4MTg1OGNlKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzA0YTRhZTlhMGZiMDQxZmE4ODY4ZTc3ZTdjZTFkOTM0ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMzA5NTgsIDEyNi4zNDA4MzAwMDAwMDAwMV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81N2M2OTc4ZWZiMDA0NzVhYTI4NjcyYzAwZmM2ZTYxMSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzA0YTRhZTlhMGZiMDQxZmE4ODY4ZTc3ZTdjZTFkOTM0LnNldEljb24oaWNvbl81N2M2OTc4ZWZiMDA0NzVhYTI4NjcyYzAwZmM2ZTYxMSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNmE4ZGExYTQ2ZmQ4NGIxMTk1Y2RiMmY3ZmY4ZDE0ZTIgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzk2NTRmMDYxMmI3ZjRiMWE4OTVmOTcyMTFiM2NlMjA0ID0gJChgPGRpdiBpZD0iaHRtbF85NjU0ZjA2MTJiN2Y0YjFhODk1Zjk3MjExYjNjZTIwNCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+64+Z6rSR7ZmY7Iq57KCV66WY7J6lNSjshJzqt4DrsKnrqbQpPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzZhOGRhMWE0NmZkODRiMTE5NWNkYjJmN2ZmOGQxNGUyLnNldENvbnRlbnQoaHRtbF85NjU0ZjA2MTJiN2Y0YjFhODk1Zjk3MjExYjNjZTIwNCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl8wNGE0YWU5YTBmYjA0MWZhODg2OGU3N2U3Y2UxZDkzNC5iaW5kUG9wdXAocG9wdXBfNmE4ZGExYTQ2ZmQ4NGIxMTk1Y2RiMmY3ZmY4ZDE0ZTIpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZTg2MjU4OTk4NjgwNDBmZWE3OWI1OTk4YTA2MmM1YTIgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yMzk3NDAwMDAwMDAwMDUsIDEyNi40Mzc3M10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl82NDQ0ODdjNGVhZDE0NWE5YTRmZjI4ZmQxYjU1ZmJmYiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2U4NjI1ODk5ODY4MDQwZmVhNzliNTk5OGEwNjJjNWEyLnNldEljb24oaWNvbl82NDQ0ODdjNGVhZDE0NWE5YTRmZjI4ZmQxYjU1ZmJmYik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNGM3MTM4ZTJlMTdkNDBlMDkxNWM4YmNiY2UzYmNlYzAgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2NhZmM4NmRmMDU0NzRmZDlhMzEwY2E3MzNlNTU0MjVlID0gJChgPGRpdiBpZD0iaHRtbF9jYWZjODZkZjA1NDc0ZmQ5YTMxMGNhNzMzZTU1NDI1ZSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+64yA7Y+s7ZWtPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzRjNzEzOGUyZTE3ZDQwZTA5MTVjOGJjYmNlM2JjZWMwLnNldENvbnRlbnQoaHRtbF9jYWZjODZkZjA1NDc0ZmQ5YTMxMGNhNzMzZTU1NDI1ZSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9lODYyNTg5OTg2ODA0MGZlYTc5YjU5OThhMDYyYzVhMi5iaW5kUG9wdXAocG9wdXBfNGM3MTM4ZTJlMTdkNDBlMDkxNWM4YmNiY2UzYmNlYzApCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMjlkNWZmMThhM2E2NGJmMmE4YzBkNGFmNTJkMTkzMmYgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNDI4OSwgMTI2LjQ1MDgzOTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2QyN2FmY2Q1MzJmNDRhY2Y5NDFkYWQzYjJhN2IzMDI3ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfMjlkNWZmMThhM2E2NGJmMmE4YzBkNGFmNTJkMTkzMmYuc2V0SWNvbihpY29uX2QyN2FmY2Q1MzJmNDRhY2Y5NDFkYWQzYjJhN2IzMDI3KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9lNWM5YTdhZTVhZDY0N2IxYWMwZTBlOTk0YjI3NDkwYiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfNTQzNTg0OTZhZWYxNGVkYmIwNmU4NTdkOTU1NTY1NjIgPSAkKGA8ZGl2IGlkPSJodG1sXzU0MzU4NDk2YWVmMTRlZGJiMDZlODU3ZDk1NTU2NTYyIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7slb3sspzsgqw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfZTVjOWE3YWU1YWQ2NDdiMWFjMGUwZTk5NGIyNzQ5MGIuc2V0Q29udGVudChodG1sXzU0MzU4NDk2YWVmMTRlZGJiMDZlODU3ZDk1NTU2NTYyKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzI5ZDVmZjE4YTNhNjRiZjJhOGMwZDRhZjUyZDE5MzJmLmJpbmRQb3B1cChwb3B1cF9lNWM5YTdhZTVhZDY0N2IxYWMwZTBlOTk0YjI3NDkwYikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9lYTE3MzExYzkxMTI0NTNlOTBlOGIyZWRjNzk1MTg0NCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1MjE0MDAwMDAwMDAwNCwgMTI2LjQxMjY4MDAwMDAwMDAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2M4NTZjY2E1MjdhNjQyYWQ5MzRiZGUzZDk4N2FjYWI0ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZWExNzMxMWM5MTEyNDUzZTkwZThiMmVkYzc5NTE4NDQuc2V0SWNvbihpY29uX2M4NTZjY2E1MjdhNjQyYWQ5MzRiZGUzZDk4N2FjYWI0KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8xMjI3NDNjODIyNjg0NTMyYjNmOTVhMTdhYWQ1OTM2NiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfNDlhZmEwMTRkMTI5NGJlZjkzNzgxMWEyOGJiODYwMzcgPSAkKGA8ZGl2IGlkPSJodG1sXzQ5YWZhMDE0ZDEyOTRiZWY5Mzc4MTFhMjhiYjg2MDM3IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7spJHrrLjqtIDqtJHri6jsp4Dsl6zrr7jsp4Dsi53rrLzsm5DsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfMTIyNzQzYzgyMjY4NDUzMmIzZjk1YTE3YWFkNTkzNjYuc2V0Q29udGVudChodG1sXzQ5YWZhMDE0ZDEyOTRiZWY5Mzc4MTFhMjhiYjg2MDM3KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2VhMTczMTFjOTExMjQ1M2U5MGU4YjJlZGM3OTUxODQ0LmJpbmRQb3B1cChwb3B1cF8xMjI3NDNjODIyNjg0NTMyYjNmOTVhMTdhYWQ1OTM2NikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl81OWU2M2I5MTczZDE0YTYyODkzMTRkNTA2MGJiZDQ0ZiA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0OTEwOTk5OTk5OTk5NSwgMTI2LjUwOTA3XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzI4NjllM2RkOGRiZTQxNDNhNDlhMWQyYmNiNjJjZTRiID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNTllNjNiOTE3M2QxNGE2Mjg5MzE0ZDUwNjBiYmQ0NGYuc2V0SWNvbihpY29uXzI4NjllM2RkOGRiZTQxNDNhNDlhMWQyYmNiNjJjZTRiKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF83Yzc1YjAzZmY5MGM0Y2IzOTdlMWZhODVkMTcyYzM2ZCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMGEwMGExYTUwNzY5NDA0YmEyYjA5NjYwYWNiNjFhMDEgPSAkKGA8ZGl2IGlkPSJodG1sXzBhMDBhMWE1MDc2OTQwNGJhMmIwOTY2MGFjYjYxYTAxIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7soJzso7zsm5Trk5zsu7Xqsr3quLDsnqUoNjAw67KIKTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF83Yzc1YjAzZmY5MGM0Y2IzOTdlMWZhODVkMTcyYzM2ZC5zZXRDb250ZW50KGh0bWxfMGEwMGExYTUwNzY5NDA0YmEyYjA5NjYwYWNiNjFhMDEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNTllNjNiOTE3M2QxNGE2Mjg5MzE0ZDUwNjBiYmQ0NGYuYmluZFBvcHVwKHBvcHVwXzdjNzViMDNmZjkwYzRjYjM5N2UxZmE4NWQxNzJjMzZkKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2EzMzRkOTUyOThlZTRiODU4Mzk2OGNkODI0OWMzOWI2ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQyNzMsIDEyNi40NjA5NjAwMDAwMDAwMV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8wODQ5OTZiMjViN2Q0MmNhYjE5Y2ZhMTNhMzk4Mzc3MiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2EzMzRkOTUyOThlZTRiODU4Mzk2OGNkODI0OWMzOWI2LnNldEljb24oaWNvbl8wODQ5OTZiMjViN2Q0MmNhYjE5Y2ZhMTNhMzk4Mzc3Mik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNzRhMDgzNWU3YWM2NDM0YjlmNTEyYTcxOWQzNjM0MjkgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzY3YzNjMjM3YzQ5OTQzYTI5MzJjOTdjMTE4OTM3OWIwID0gJChgPGRpdiBpZD0iaHRtbF82N2MzYzIzN2M0OTk0M2EyOTMyYzk3YzExODkzNzliMCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7JuU7Y+J66eI7J2EPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzc0YTA4MzVlN2FjNjQzNGI5ZjUxMmE3MTlkMzYzNDI5LnNldENvbnRlbnQoaHRtbF82N2MzYzIzN2M0OTk0M2EyOTMyYzk3YzExODkzNzliMCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9hMzM0ZDk1Mjk4ZWU0Yjg1ODM5NjhjZDgyNDljMzliNi5iaW5kUG9wdXAocG9wdXBfNzRhMDgzNWU3YWM2NDM0YjlmNTEyYTcxOWQzNjM0MjkpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfM2M3MDY3YzZkNDc0NDZmOGE1ODkzNjExZWE4YjA0MDAgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40OTAwMiwgMTI2LjQ4ODU2XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzAyZjZjZWFmODJiOTQxM2VhMzdiM2Q4YjNlYjg2MjgxID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfM2M3MDY3YzZkNDc0NDZmOGE1ODkzNjExZWE4YjA0MDAuc2V0SWNvbihpY29uXzAyZjZjZWFmODJiOTQxM2VhMzdiM2Q4YjNlYjg2MjgxKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8wZDM4NTc4YzFjODY0YzQwYjA3NWI0ZTNlZGMwNzEyMSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOGVlNTdjMzA4YjI2NDA0OGI4MzA0NDlkMDhlZDYyOWUgPSAkKGA8ZGl2IGlkPSJodG1sXzhlZTU3YzMwOGIyNjQwNDhiODMwNDQ5ZDA4ZWQ2MjllIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7roa/rjbDsi5zti7DtmLjthZQoNjAw67KIKTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8wZDM4NTc4YzFjODY0YzQwYjA3NWI0ZTNlZGMwNzEyMS5zZXRDb250ZW50KGh0bWxfOGVlNTdjMzA4YjI2NDA0OGI4MzA0NDlkMDhlZDYyOWUpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfM2M3MDY3YzZkNDc0NDZmOGE1ODkzNjExZWE4YjA0MDAuYmluZFBvcHVwKHBvcHVwXzBkMzg1NzhjMWM4NjRjNDBiMDc1YjRlM2VkYzA3MTIxKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzFkMTc5OWEzYzA0ZjQwZjdhZTM0OGQ3ZDkyOWVjZmQyID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQ3MDA5OTk5OTk5OTk2LCAxMjYuNTgwNzhdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fN2Q2ZTE4ZDJkNGUwNDNlMDk4ZjlhZWRkNGI3YWIyYTYgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8xZDE3OTlhM2MwNGY0MGY3YWUzNDhkN2Q5MjllY2ZkMi5zZXRJY29uKGljb25fN2Q2ZTE4ZDJkNGUwNDNlMDk4ZjlhZWRkNGI3YWIyYTYpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2E0ZmRkZTMwZDFkNzQ3YzBiYTJkN2FkODdlZjI1MTFjID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF81NzJlZDUxZTc2MzU0ZDI0OTA3MWMxM2MzYWQwYTA5YSA9ICQoYDxkaXYgaWQ9Imh0bWxfNTcyZWQ1MWU3NjM1NGQyNDkwNzFjMTNjM2FkMGEwOWEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyEnOq3gO2PrOy5vO2YuO2FlCjsooXsoJApPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2E0ZmRkZTMwZDFkNzQ3YzBiYTJkN2FkODdlZjI1MTFjLnNldENvbnRlbnQoaHRtbF81NzJlZDUxZTc2MzU0ZDI0OTA3MWMxM2MzYWQwYTA5YSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl8xZDE3OTlhM2MwNGY0MGY3YWUzNDhkN2Q5MjllY2ZkMi5iaW5kUG9wdXAocG9wdXBfYTRmZGRlMzBkMWQ3NDdjMGJhMmQ3YWQ4N2VmMjUxMWMpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMzkyNGU3YjBkMGQ5NGIzODlkZjBkMGJiZDczYWE1OGMgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yMzQ2NSwgMTI2LjQ4MjQxMDAwMDAwMDAyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzY2ZjQzNGU5N2I3NDQ4Y2I4NzhhNTgzZjdhZWUxYjE2ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfMzkyNGU3YjBkMGQ5NGIzODlkZjBkMGJiZDczYWE1OGMuc2V0SWNvbihpY29uXzY2ZjQzNGU5N2I3NDQ4Y2I4NzhhNTgzZjdhZWUxYjE2KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF82NTkyMDk5YWY1NzY0M2IwYTBlYjc2ZTk5NWE1MWE2OCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMDcwY2FlZTExN2EyNGM2MzgwZDBiNmU5MGU3NDAwOGMgPSAkKGA8ZGl2IGlkPSJodG1sXzA3MGNhZWUxMTdhMjRjNjM4MGQwYjZlOTBlNzQwMDhjIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7smZXrjIDsmZM8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNjU5MjA5OWFmNTc2NDNiMGEwZWI3NmU5OTVhNTFhNjguc2V0Q29udGVudChodG1sXzA3MGNhZWUxMTdhMjRjNjM4MGQwYjZlOTBlNzQwMDhjKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzM5MjRlN2IwZDBkOTRiMzg5ZGYwZDBiYmQ3M2FhNThjLmJpbmRQb3B1cChwb3B1cF82NTkyMDk5YWY1NzY0M2IwYTBlYjc2ZTk5NWE1MWE2OCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9mYmRkNTA4YzZhZTg0NDY0YTUyODEzOTcxYWIyNGM3OSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4OTcyLCAxMjYuNDkzN10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9kYWU5NzVkNDg0Zjc0OTgxYTUyNTAzN2MwZmY1YmViYSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2ZiZGQ1MDhjNmFlODQ0NjRhNTI4MTM5NzFhYjI0Yzc5LnNldEljb24oaWNvbl9kYWU5NzVkNDg0Zjc0OTgxYTUyNTAzN2MwZmY1YmViYSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfMjExMDg2MjliNGU1NGEwYmFmNDE5MDdhODI3MTQ0NTcgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2E3ODE2ZTI2M2ZiYTQ0MTY4ZTc2MTJjM2M4NDBiNTU5ID0gJChgPGRpdiBpZD0iaHRtbF9hNzgxNmUyNjNmYmE0NDE2OGU3NjEyYzNjODQwYjU1OSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO87I2s7Zi47YWUPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzIxMTA4NjI5YjRlNTRhMGJhZjQxOTA3YTgyNzE0NDU3LnNldENvbnRlbnQoaHRtbF9hNzgxNmUyNjNmYmE0NDE2OGU3NjEyYzNjODQwYjU1OSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9mYmRkNTA4YzZhZTg0NDY0YTUyODEzOTcxYWIyNGM3OS5iaW5kUG9wdXAocG9wdXBfMjExMDg2MjliNGU1NGEwYmFmNDE5MDdhODI3MTQ0NTcpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMGRhZmVlODIwODA2NDJjZGFjZGMxNjM4Yjg3NjBkYWEgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40ODk2MywgMTI2LjQ4Nl0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9hYTFiMGFhMmQ2Mjc0YjQ0YmRhYjkzNzY4ZjRlYTg0MSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzBkYWZlZTgyMDgwNjQyY2RhY2RjMTYzOGI4NzYwZGFhLnNldEljb24oaWNvbl9hYTFiMGFhMmQ2Mjc0YjQ0YmRhYjkzNzY4ZjRlYTg0MSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfM2Y0YTJjZjVjZjdiNGY2ZWJmMDA3NjI1ZGU2MWUzNTAgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzliNmUzODI1YjQ1ODRkNDhhYTI4MjE5ZDA0YWQ1M2FjID0gJChgPGRpdiBpZD0iaHRtbF85YjZlMzgyNWI0NTg0ZDQ4YWEyODIxOWQwNGFkNTNhYyIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ZWc652867OR7JuQPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzNmNGEyY2Y1Y2Y3YjRmNmViZjAwNzYyNWRlNjFlMzUwLnNldENvbnRlbnQoaHRtbF85YjZlMzgyNWI0NTg0ZDQ4YWEyODIxOWQwNGFkNTNhYyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl8wZGFmZWU4MjA4MDY0MmNkYWNkYzE2MzhiODc2MGRhYS5iaW5kUG9wdXAocG9wdXBfM2Y0YTJjZjVjZjdiNGY2ZWJmMDA3NjI1ZGU2MWUzNTApCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfOTgyZWJkYzM5NjUxNDhlYmE3ZmJmMWU3YzRhY2I2MzQgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40ODEzMjAwMDAwMDAwMDQsIDEyNi40NzMzXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzI4OGMxYzZmMzA4YTRkNDk5Y2YwYmVlYmEyZWVmMjFkID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfOTgyZWJkYzM5NjUxNDhlYmE3ZmJmMWU3YzRhY2I2MzQuc2V0SWNvbihpY29uXzI4OGMxYzZmMzA4YTRkNDk5Y2YwYmVlYmEyZWVmMjFkKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF80NjZmMTFiYzIxMTA0NThkYTc2Y2I0Njc3YjkxOTNiMSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMmQzMGJiNzhhMmY3NGM1M2IzZTZiYmU5ZjRmODk4Y2IgPSAkKGA8ZGl2IGlkPSJodG1sXzJkMzBiYjc4YTJmNzRjNTNiM2U2YmJlOWY0Zjg5OGNiIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7soJXsobTrp4jsnYQ8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNDY2ZjExYmMyMTEwNDU4ZGE3NmNiNDY3N2I5MTkzYjEuc2V0Q29udGVudChodG1sXzJkMzBiYjc4YTJmNzRjNTNiM2U2YmJlOWY0Zjg5OGNiKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzk4MmViZGMzOTY1MTQ4ZWJhN2ZiZjFlN2M0YWNiNjM0LmJpbmRQb3B1cChwb3B1cF80NjZmMTFiYzIxMTA0NThkYTc2Y2I0Njc3YjkxOTNiMSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9kMjQxYjAwYmQ2NDc0OTIwYWY2OGQ4YjNmZjY4YjQyMCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0ODcyLCAxMjYuNDEwMzJdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fYTVhZGNhMjMyMDVmNGRhNmE0YzMwOTU5MTY4NzRmMjcgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9kMjQxYjAwYmQ2NDc0OTIwYWY2OGQ4YjNmZjY4YjQyMC5zZXRJY29uKGljb25fYTVhZGNhMjMyMDVmNGRhNmE0YzMwOTU5MTY4NzRmMjcpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzJhMjNiYzRlZGJmODQwYWE5NTlmZjE1MGQ3N2ExY2E3ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF83YTRkOTk5NDc2YTM0YWJiYjU4YzNlZTg1OGNlMjBkMiA9ICQoYDxkaXYgaWQ9Imh0bWxfN2E0ZDk5OTQ3NmEzNGFiYmI1OGMzZWU4NThjZTIwZDIiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuhr+uNsO2YuO2FlDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8yYTIzYmM0ZWRiZjg0MGFhOTU5ZmYxNTBkNzdhMWNhNy5zZXRDb250ZW50KGh0bWxfN2E0ZDk5OTQ3NmEzNGFiYmI1OGMzZWU4NThjZTIwZDIpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfZDI0MWIwMGJkNjQ3NDkyMGFmNjhkOGIzZmY2OGI0MjAuYmluZFBvcHVwKHBvcHVwXzJhMjNiYzRlZGJmODQwYWE5NTlmZjE1MGQ3N2ExY2E3KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2Q0Y2RmZjhmMGM2MzRkNTc4YjI5MjZkODA1ZWQxNTg1ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjU1OTMsIDEyNi40MTI2MTk5OTk5OTk5OV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81MzBjNDMyNWRkODc0NWQ4YWI1NzRkOTQxYzE0Zjk4NSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2Q0Y2RmZjhmMGM2MzRkNTc4YjI5MjZkODA1ZWQxNTg1LnNldEljb24oaWNvbl81MzBjNDMyNWRkODc0NWQ4YWI1NzRkOTQxYzE0Zjk4NSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNjYyN2RiMWY4NjQxNDUzZTgxNDA5MjNmMTYxNzRhMjkgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzZmNzY1ODEwMDY1NjRkNTRhMDc4ODkxYjAzZGI4NzU1ID0gJChgPGRpdiBpZD0iaHRtbF82Zjc2NTgxMDA2NTY0ZDU0YTA3ODg5MWIwM2RiODc1NSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KSR66y46rSA6rSR64uo7KeA7J6F6rWsPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzY2MjdkYjFmODY0MTQ1M2U4MTQwOTIzZjE2MTc0YTI5LnNldENvbnRlbnQoaHRtbF82Zjc2NTgxMDA2NTY0ZDU0YTA3ODg5MWIwM2RiODc1NSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9kNGNkZmY4ZjBjNjM0ZDU3OGIyOTI2ZDgwNWVkMTU4NS5iaW5kUG9wdXAocG9wdXBfNjYyN2RiMWY4NjQxNDUzZTgxNDA5MjNmMTYxNzRhMjkpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZmM4NjIwY2YwZTBlNGVlYjgxZGY4NmMwMjhjYWUzYTggPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNTg2OSwgMTI2LjQwNDYzOTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2UxMzU3MGZkNjY2MTQ2ZmRiYmMyMDQ3M2MwNDgyYzA4ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZmM4NjIwY2YwZTBlNGVlYjgxZGY4NmMwMjhjYWUzYTguc2V0SWNvbihpY29uX2UxMzU3MGZkNjY2MTQ2ZmRiYmMyMDQ3M2MwNDgyYzA4KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF83NDNiMWM1ZWNmNDI0MDdjODg3MzhiZTYyYzQ0MTFjNiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOGNjYjMwNzhkZjljNDBhYTkxM2IxZjhkZjJhNGZmZTEgPSAkKGA8ZGl2IGlkPSJodG1sXzhjY2IzMDc4ZGY5YzQwYWE5MTNiMWY4ZGYyYTRmZmUxIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7smIjrnpjsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNzQzYjFjNWVjZjQyNDA3Yzg4NzM4YmU2MmM0NDExYzYuc2V0Q29udGVudChodG1sXzhjY2IzMDc4ZGY5YzQwYWE5MTNiMWY4ZGYyYTRmZmUxKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2ZjODYyMGNmMGUwZTRlZWI4MWRmODZjMDI4Y2FlM2E4LmJpbmRQb3B1cChwb3B1cF83NDNiMWM1ZWNmNDI0MDdjODg3MzhiZTYyYzQ0MTFjNikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9kNzliNDI5ZjgwY2E0NWQ4YTcyOTAyZGU4YjVmMjVkMSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0Mzg1LCAxMjYuNDIwMzNdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fODMwOGM5YWU5MDNiNDM0ODg3MDhkMWI5NDNmMTRiZDggPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9kNzliNDI5ZjgwY2E0NWQ4YTcyOTAyZGU4YjVmMjVkMS5zZXRJY29uKGljb25fODMwOGM5YWU5MDNiNDM0ODg3MDhkMWI5NDNmMTRiZDgpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzg3M2IxZmExYmQ5YTQ0NmU4MWZmZDM2YzJkZjRjMmY1ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF81N2FjYmFmYmEzMDM0ZTBjYjFiMjc0Yjc4OGI2NGMzMiA9ICQoYDxkaXYgaWQ9Imh0bWxfNTdhY2JhZmJhMzAzNGUwY2IxYjI3NGI3ODhiNjRjMzIiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyUqOyXkOyKpO2YuO2FlDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF84NzNiMWZhMWJkOWE0NDZlODFmZmQzNmMyZGY0YzJmNS5zZXRDb250ZW50KGh0bWxfNTdhY2JhZmJhMzAzNGUwY2IxYjI3NGI3ODhiNjRjMzIpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfZDc5YjQyOWY4MGNhNDVkOGE3MjkwMmRlOGI1ZjI1ZDEuYmluZFBvcHVwKHBvcHVwXzg3M2IxZmExYmQ5YTQ0NmU4MWZmZDM2YzJkZjRjMmY1KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzIxMDM4ZDBkZjRjZDQwYTZiZDEyYzg1YzdkZjc3ZTdkID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjY1NDA5OTk5OTk5OTk2LCAxMjYuMzcxNTNdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fMmJkYTZmODA1YjFkNDdhYWFiYmJjMDM3YTliNWJlMmYgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8yMTAzOGQwZGY0Y2Q0MGE2YmQxMmM4NWM3ZGY3N2U3ZC5zZXRJY29uKGljb25fMmJkYTZmODA1YjFkNDdhYWFiYmJjMDM3YTliNWJlMmYpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzk3N2QyN2RkOTc5ZDRhMzVhNWI4NjkwMGI3NDJiNzkxID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9jYzk5MGM4NDMxNzA0MmIwOTU3MTY1NzMzOTQwNzMzYyA9ICQoYDxkaXYgaWQ9Imh0bWxfY2M5OTBjODQzMTcwNDJiMDk1NzE2NTczMzk0MDczM2MiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuywveyynOumrDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF85NzdkMjdkZDk3OWQ0YTM1YTViODY5MDBiNzQyYjc5MS5zZXRDb250ZW50KGh0bWxfY2M5OTBjODQzMTcwNDJiMDk1NzE2NTczMzk0MDczM2MpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMjEwMzhkMGRmNGNkNDBhNmJkMTJjODVjN2RmNzdlN2QuYmluZFBvcHVwKHBvcHVwXzk3N2QyN2RkOTc5ZDRhMzVhNWI4NjkwMGI3NDJiNzkxKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2M1YTU1ZWY4OGQwMzRkMzFhYWE3NTVlYTUwNjg3ZjJkID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjUwMDcsIDEyNi40MTQxNV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8zZWQ5Y2QxYzQ3YTg0MTI5YTFhMmEyYzBiYzdjZjMxZSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2M1YTU1ZWY4OGQwMzRkMzFhYWE3NTVlYTUwNjg3ZjJkLnNldEljb24oaWNvbl8zZWQ5Y2QxYzQ3YTg0MTI5YTFhMmEyYzBiYzdjZjMxZSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNzg1MDc1MzlkZGI3NGEwNTk4OWY3YTEwZjQ0MmU4ODggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2YzZjM3Mjk1MDkxNjQyODZiODQxMzY1OWFkOTJiYzM3ID0gJChgPGRpdiBpZD0iaHRtbF9mM2YzNzI5NTA5MTY0Mjg2Yjg0MTM2NTlhZDkyYmMzNyIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ZSM66CI7J207LyA7J207Yyd67CV66y86rSAPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzc4NTA3NTM5ZGRiNzRhMDU5ODlmN2ExMGY0NDJlODg4LnNldENvbnRlbnQoaHRtbF9mM2YzNzI5NTA5MTY0Mjg2Yjg0MTM2NTlhZDkyYmMzNyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9jNWE1NWVmODhkMDM0ZDMxYWFhNzU1ZWE1MDY4N2YyZC5iaW5kUG9wdXAocG9wdXBfNzg1MDc1MzlkZGI3NGEwNTk4OWY3YTEwZjQ0MmU4ODgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfYTJmNzRjNGEwM2VlNDU3ZWE2MDliNTc5NzE3MGY3NTYgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yMzU2NDAwMDAwMDAwMDQsIDEyNi40ODAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzQyNjA2NzE2ZDM3MTQ1MjI5NGU2NjY4YjgzYWY1NDYwID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfYTJmNzRjNGEwM2VlNDU3ZWE2MDliNTc5NzE3MGY3NTYuc2V0SWNvbihpY29uXzQyNjA2NzE2ZDM3MTQ1MjI5NGU2NjY4YjgzYWY1NDYwKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF80M2YxM2E2MWFkMWI0NmM3YWIyNzViYzM5ODI2YWE0NSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOTI5ZTFjZWYwMDk4NDAzZjhkZGFjZDUzZWZkYmIzODcgPSAkKGA8ZGl2IGlkPSJodG1sXzkyOWUxY2VmMDA5ODQwM2Y4ZGRhY2Q1M2VmZGJiMzg3IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7qsJXsoJXstIjrk7HtlZnqtZA8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNDNmMTNhNjFhZDFiNDZjN2FiMjc1YmMzOTgyNmFhNDUuc2V0Q29udGVudChodG1sXzkyOWUxY2VmMDA5ODQwM2Y4ZGRhY2Q1M2VmZGJiMzg3KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2EyZjc0YzRhMDNlZTQ1N2VhNjA5YjU3OTcxNzBmNzU2LmJpbmRQb3B1cChwb3B1cF80M2YxM2E2MWFkMWI0NmM3YWIyNzViYzM5ODI2YWE0NSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9jMDU5M2Q0NTgyNDY0NWMzYWYyOGFlNGU1ZWFmNWExNCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjIzNDYyLCAxMjYuNDkwODJdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fMDBjMjgyMWVlNDUzNGM1YzliNDcyNGM3MGNkM2JjNmMgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9jMDU5M2Q0NTgyNDY0NWMzYWYyOGFlNGU1ZWFmNWExNC5zZXRJY29uKGljb25fMDBjMjgyMWVlNDUzNGM1YzliNDcyNGM3MGNkM2JjNmMpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzFiZmRiMWIyMzc0ZTQzYjA5OGUzNjRkZTFlM2QwN2QxID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8yYTc4ZDdhY2ZiZDg0NDRhODIzNjJkNWJlMDFhNjFhYSA9ICQoYDxkaXYgaWQ9Imh0bWxfMmE3OGQ3YWNmYmQ4NDQ0YTgyMzYyZDViZTAxYTYxYWEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuy8hOyLse2EtOumrOyhsO2KuOyVheq3vOyynDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8xYmZkYjFiMjM3NGU0M2IwOThlMzY0ZGUxZTNkMDdkMS5zZXRDb250ZW50KGh0bWxfMmE3OGQ3YWNmYmQ4NDQ0YTgyMzYyZDViZTAxYTYxYWEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfYzA1OTNkNDU4MjQ2NDVjM2FmMjhhZTRlNWVhZjVhMTQuYmluZFBvcHVwKHBvcHVwXzFiZmRiMWIyMzc0ZTQzYjA5OGUzNjRkZTFlM2QwN2QxKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzYzMDlkMWJkNzMxYzQwYjE5Yzk5NTIxODFmNGU3MDlmID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQ3NTMsIDEyNi41NzY5Ml0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9jM2MzNDVkNTc5ZDE0MGVkYjdjYjc2N2QxNWM5Y2M1NiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzYzMDlkMWJkNzMxYzQwYjE5Yzk5NTIxODFmNGU3MDlmLnNldEljb24oaWNvbl9jM2MzNDVkNTc5ZDE0MGVkYjdjYjc2N2QxNWM5Y2M1Nik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfYTViYmJiYzY3OTgzNDJiNDk5MTFkYTcwMzViMDk0YTMgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzRlNzQ0MWI5N2QwYTQ1MDlhZDFlOTJlNDA2Y2Y5YzE0ID0gJChgPGRpdiBpZD0iaHRtbF80ZTc0NDFiOTdkMGE0NTA5YWQxZTkyZTQwNmNmOWMxNCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7YyM652864uk7J207Iqk7Zi47YWU7J6F6rWsPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2E1YmJiYmM2Nzk4MzQyYjQ5OTExZGE3MDM1YjA5NGEzLnNldENvbnRlbnQoaHRtbF80ZTc0NDFiOTdkMGE0NTA5YWQxZTkyZTQwNmNmOWMxNCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl82MzA5ZDFiZDczMWM0MGIxOWM5OTUyMTgxZjRlNzA5Zi5iaW5kUG9wdXAocG9wdXBfYTViYmJiYzY3OTgzNDJiNDk5MTFkYTcwMzViMDk0YTMpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMzEzYTcyNjM0ZTBmNDNlOGI5NWUzNTFjZDAyZTdjNzAgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNTAyLCAxMjYuNDA4NDMwMDAwMDAwMDFdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZmRjNWE5NTA2ZWRjNGJmODhhNTk4MzY3M2ZhNTE0YTcgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8zMTNhNzI2MzRlMGY0M2U4Yjk1ZTM1MWNkMDJlN2M3MC5zZXRJY29uKGljb25fZmRjNWE5NTA2ZWRjNGJmODhhNTk4MzY3M2ZhNTE0YTcpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzA5NTA0MmQ0ODFmZTQwZWM5YzUwYmQ5MmVkNWQ3NGUyID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9jZDMxOTMyMDNjMDc0ZjQ4OTdhZWI2YmZhMzhmYTk1ZSA9ICQoYDxkaXYgaWQ9Imh0bWxfY2QzMTkzMjAzYzA3NGY0ODk3YWViNmJmYTM4ZmE5NWUiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPu2VmOuCmO2YuO2FlO2VnOq1req0gOq0keqzteyCrDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8wOTUwNDJkNDgxZmU0MGVjOWM1MGJkOTJlZDVkNzRlMi5zZXRDb250ZW50KGh0bWxfY2QzMTkzMjAzYzA3NGY0ODk3YWViNmJmYTM4ZmE5NWUpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMzEzYTcyNjM0ZTBmNDNlOGI5NWUzNTFjZDAyZTdjNzAuYmluZFBvcHVwKHBvcHVwXzA5NTA0MmQ0ODFmZTQwZWM5YzUwYmQ5MmVkNWQ3NGUyKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzllZDRiZWZjMjZmYjRlYTlhN2JlMjgyNWMzODYzNzc5ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQzNCwgMTI2LjQyNDY2XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2MxOGIzZWM5YjM4MTRlYzE4Mjg3MmM0MWJkMDk0ZGY5ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfOWVkNGJlZmMyNmZiNGVhOWE3YmUyODI1YzM4NjM3Nzkuc2V0SWNvbihpY29uX2MxOGIzZWM5YjM4MTRlYzE4Mjg3MmM0MWJkMDk0ZGY5KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9kNDM4ZmNmY2FiNGE0NjM0YjNlMmEzNGI2ZjhmNTkwYiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfYzAzZGQ0OWJlOWM0NDMwZThmYzdlMThkMmQxYjdiZjAgPSAkKGA8ZGl2IGlkPSJodG1sX2MwM2RkNDliZTljNDQzMGU4ZmM3ZTE4ZDJkMWI3YmYwIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7soJzso7zqta3soJzsu6jrsqTshZjshLzthLA8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfZDQzOGZjZmNhYjRhNDYzNGIzZTJhMzRiNmY4ZjU5MGIuc2V0Q29udGVudChodG1sX2MwM2RkNDliZTljNDQzMGU4ZmM3ZTE4ZDJkMWI3YmYwKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzllZDRiZWZjMjZmYjRlYTlhN2JlMjgyNWMzODYzNzc5LmJpbmRQb3B1cChwb3B1cF9kNDM4ZmNmY2FiNGE0NjM0YjNlMmEzNGI2ZjhmNTkwYikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9iY2Q0NDQxNWQ3YzI0MzI3YjJiZjdhMzQ5NGUxMTA0NSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0NjcxLCAxMjYuNTU4MjVdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fMjRjN2FiYjlhNTQ3NDM4ODk1YmJjOTRmNzUyZTlhZTMgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9iY2Q0NDQxNWQ3YzI0MzI3YjJiZjdhMzQ5NGUxMTA0NS5zZXRJY29uKGljb25fMjRjN2FiYjlhNTQ3NDM4ODk1YmJjOTRmNzUyZTlhZTMpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2JlN2FhYWY4ODFmMjQ1NDA4ZGFhYmUwZTVkYjEzNmNhID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9kNzQ1NmMwMjk1N2U0YzY3OTZiMTQyNGY5ZTg3NDMxZCA9ICQoYDxkaXYgaWQ9Imh0bWxfZDc0NTZjMDI5NTdlNGM2Nzk2YjE0MjRmOWU4NzQzMWQiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuJtOqyveuCqO2YuO2FlDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9iZTdhYWFmODgxZjI0NTQwOGRhYWJlMGU1ZGIxMzZjYS5zZXRDb250ZW50KGh0bWxfZDc0NTZjMDI5NTdlNGM2Nzk2YjE0MjRmOWU4NzQzMWQpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfYmNkNDQ0MTVkN2MyNDMyN2IyYmY3YTM0OTRlMTEwNDUuYmluZFBvcHVwKHBvcHVwX2JlN2FhYWY4ODFmMjQ1NDA4ZGFhYmUwZTVkYjEzNmNhKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzU0NmRhN2Q2MTM2NTQzNmU4YmIwODRjM2NmOWYzYjVmID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjM5ODgsIDEyNi41NjQyMTk5OTk5OTk5OV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8yYWZjMTA5MTgyNDM0YmY3OWQ1NWNlNmRiYTJjNzNiMiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzU0NmRhN2Q2MTM2NTQzNmU4YmIwODRjM2NmOWYzYjVmLnNldEljb24oaWNvbl8yYWZjMTA5MTgyNDM0YmY3OWQ1NWNlNmRiYTJjNzNiMik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfYmQwMTAwODY2OTJkNGVhNWJkM2I3MjU2YmZlMzhjMWQgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2Y0NzExMmJkYWZlNzQ2MzJiNDJmNzlmNTRiNTNhNTdiID0gJChgPGRpdiBpZD0iaHRtbF9mNDcxMTJiZGFmZTc0NjMyYjQyZjc5ZjU0YjUzYTU3YiIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ISc6reA7Y+s7ZWtPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2JkMDEwMDg2NjkyZDRlYTViZDNiNzI1NmJmZTM4YzFkLnNldENvbnRlbnQoaHRtbF9mNDcxMTJiZGFmZTc0NjMyYjQyZjc5ZjU0YjUzYTU3Yik7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl81NDZkYTdkNjEzNjU0MzZlOGJiMDg0YzNjZjlmM2I1Zi5iaW5kUG9wdXAocG9wdXBfYmQwMTAwODY2OTJkNGVhNWJkM2I3MjU2YmZlMzhjMWQpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfNTA3NTg5OTBhNjUwNDc5MWE3YmQzNzJlNWNlMTNlNTYgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNDY5NCwgMTI2LjU4MTQ4OTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2M0MjI3Njg4YWUzZDQxZTc4OGVkYzkzM2RmOTJiN2Q3ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNTA3NTg5OTBhNjUwNDc5MWE3YmQzNzJlNWNlMTNlNTYuc2V0SWNvbihpY29uX2M0MjI3Njg4YWUzZDQxZTc4OGVkYzkzM2RmOTJiN2Q3KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9hNmU1ZGU1M2VkNmI0ZTcwOTljMzlhNzM0N2EyNzdlYSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOGU3YzliM2YzODU1NGE5OWE3NTNkODU5YjI3MzczNjQgPSAkKGA8ZGl2IGlkPSJodG1sXzhlN2M5YjNmMzg1NTRhOTlhNzUzZDg1OWIyNzM3MzY0IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7shJzqt4Dtj6zsubztmLjthZQ8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfYTZlNWRlNTNlZDZiNGU3MDk5YzM5YTczNDdhMjc3ZWEuc2V0Q29udGVudChodG1sXzhlN2M5YjNmMzg1NTRhOTlhNzUzZDg1OWIyNzM3MzY0KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzUwNzU4OTkwYTY1MDQ3OTFhN2JkMzcyZTVjZTEzZTU2LmJpbmRQb3B1cChwb3B1cF9hNmU1ZGU1M2VkNmI0ZTcwOTljMzlhNzM0N2EyNzdlYSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl80MzhkOTg5MWM2ODM0YTZjYjUwODc5MWUyYjgxMjEyNSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjMxMDQ0LCAxMjYuMzQwOTg5OTk5OTk5OTldLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fYTM3NzRjNWE5ZDY5NDliMWE4NDUzOGFmYzliYzQwNTYgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl80MzhkOTg5MWM2ODM0YTZjYjUwODc5MWUyYjgxMjEyNS5zZXRJY29uKGljb25fYTM3NzRjNWE5ZDY5NDliMWE4NDUzOGFmYzliYzQwNTYpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzRiMzJmZDc3N2I4ZjQxYWZiNzdkNTExMzFhNGEzY2NmID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9lNjdiZThmZmMwYjk0OTk3YTZmY2MzZGRlZmNjNmE3YyA9ICQoYDxkaXYgaWQ9Imh0bWxfZTY3YmU4ZmZjMGI5NDk5N2E2ZmNjM2RkZWZjYzZhN2MiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuPmeq0ke2ZmOyKueygleulmOyepTQo7KCc7KO867Cp66m0KTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF80YjMyZmQ3NzdiOGY0MWFmYjc3ZDUxMTMxYTRhM2NjZi5zZXRDb250ZW50KGh0bWxfZTY3YmU4ZmZjMGI5NDk5N2E2ZmNjM2RkZWZjYzZhN2MpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNDM4ZDk4OTFjNjgzNGE2Y2I1MDg3OTFlMmI4MTIxMjUuYmluZFBvcHVwKHBvcHVwXzRiMzJmZDc3N2I4ZjQxYWZiNzdkNTExMzFhNGEzY2NmKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzU2MDlkNGI1MTM5ZTRiM2ViYjNiMzdmOTU1YTQ3YmZjID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjM5ODcsIDEyNi40Mzc2N10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8yYjNjYmQ4YTc5MTc0ZTE4ODg4ZDc2N2IzNDUxMzRhMyA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzU2MDlkNGI1MTM5ZTRiM2ViYjNiMzdmOTU1YTQ3YmZjLnNldEljb24oaWNvbl8yYjNjYmQ4YTc5MTc0ZTE4ODg4ZDc2N2IzNDUxMzRhMyk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfN2VjYzFhN2M4OWY2NDUxOThhNzdmM2Y5YTBkZTJmZmQgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzAxYzQ0ZmVhYmExZjQ4ZTY4NmVlODgzOGU3ZDg4ZjNiID0gJChgPGRpdiBpZD0iaHRtbF8wMWM0NGZlYWJhMWY0OGU2ODZlZTg4MzhlN2Q4OGYzYiIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+64yA7Y+s7ZWtPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzdlY2MxYTdjODlmNjQ1MTk4YTc3ZjNmOWEwZGUyZmZkLnNldENvbnRlbnQoaHRtbF8wMWM0NGZlYWJhMWY0OGU2ODZlZTg4MzhlN2Q4OGYzYik7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl81NjA5ZDRiNTEzOWU0YjNlYmIzYjM3Zjk1NWE0N2JmYy5iaW5kUG9wdXAocG9wdXBfN2VjYzFhN2M4OWY2NDUxOThhNzdmM2Y5YTBkZTJmZmQpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZTk4ODVlN2ZmOWU1NDU1Y2E4MjNiOWFkY2I3NTgyMDAgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNDMsIDEyNi40NTAzNF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81M2FiOThjM2Y5MDg0NTQ1OTJhNTM3NTgzNjY2ZmU0MSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2U5ODg1ZTdmZjllNTQ1NWNhODIzYjlhZGNiNzU4MjAwLnNldEljb24oaWNvbl81M2FiOThjM2Y5MDg0NTQ1OTJhNTM3NTgzNjY2ZmU0MSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNGJjMDE2MjM2ZmMzNDBjMGE4Y2NjYTkzMDY4OWNjNGUgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2RhNjNlM2ViZWNlYzQ5NzU5NGEzMWJmMzFkY2Y0Mjk5ID0gJChgPGRpdiBpZD0iaHRtbF9kYTYzZTNlYmVjZWM0OTc1OTRhMzFiZjMxZGNmNDI5OSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7JW97LKc7IKsPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzRiYzAxNjIzNmZjMzQwYzBhOGNjY2E5MzA2ODljYzRlLnNldENvbnRlbnQoaHRtbF9kYTYzZTNlYmVjZWM0OTc1OTRhMzFiZjMxZGNmNDI5OSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9lOTg4NWU3ZmY5ZTU0NTVjYTgyM2I5YWRjYjc1ODIwMC5iaW5kUG9wdXAocG9wdXBfNGJjMDE2MjM2ZmMzNDBjMGE4Y2NjYTkzMDY4OWNjNGUpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMTc0NThhYjJiMGE3NDEyZmIxYmQxNTk3ZDdmMzM5NmYgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNTE3LCAxMjYuNDEyNjRdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fOWQ4MjQ1NmVjNDU0NGY5ZjhmNTIzYjZkMzBiY2UxN2UgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8xNzQ1OGFiMmIwYTc0MTJmYjFiZDE1OTdkN2YzMzk2Zi5zZXRJY29uKGljb25fOWQ4MjQ1NmVjNDU0NGY5ZjhmNTIzYjZkMzBiY2UxN2UpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzZjYjA1YjlkM2Y5NTRkMzFiN2I0YjBmM2IyZTE5MzAyID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9iOWQ1MTQ4MWEwOTI0YmUwYmI3NGM1Y2RjNzAxZDMyMyA9ICQoYDxkaXYgaWQ9Imh0bWxfYjlkNTE0ODFhMDkyNGJlMGJiNzRjNWNkYzcwMWQzMjMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuykkeusuOq0gOq0keuLqOyngOyXrOuvuOyngOyLneusvOybkOyeheq1rDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF82Y2IwNWI5ZDNmOTU0ZDMxYjdiNGIwZjNiMmUxOTMwMi5zZXRDb250ZW50KGh0bWxfYjlkNTE0ODFhMDkyNGJlMGJiNzRjNWNkYzcwMWQzMjMpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMTc0NThhYjJiMGE3NDEyZmIxYmQxNTk3ZDdmMzM5NmYuYmluZFBvcHVwKHBvcHVwXzZjYjA1YjlkM2Y5NTRkMzFiN2I0YjBmM2IyZTE5MzAyKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzMyODU4MTA1MjZhNTRjNzhiZmFkOTZhYWQ0N2NiYThlID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQ5MzQwMDAwMDAwMDA0LCAxMjYuNTA5MDM5OTk5OTk5OThdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZTBmYjNhMmIyZDE1NDRhM2E3OWU5NDQ3OGI5YjA4ZGIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8zMjg1ODEwNTI2YTU0Yzc4YmZhZDk2YWFkNDdjYmE4ZS5zZXRJY29uKGljb25fZTBmYjNhMmIyZDE1NDRhM2E3OWU5NDQ3OGI5YjA4ZGIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzA5NGVmNjI1OWMzMzRiNWViOGRmZGE1NTI2YzlmMmIyID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9kMjkxM2Y3NzczMzc0ZWY0YjkxZDA3NDAwOTZiMmI0MyA9ICQoYDxkaXYgaWQ9Imh0bWxfZDI5MTNmNzc3MzM3NGVmNGI5MWQwNzQwMDk2YjJiNDMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuygnOyjvOyblOuTnOy7teqyveq4sOyepSg2MDDrsogpPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzA5NGVmNjI1OWMzMzRiNWViOGRmZGE1NTI2YzlmMmIyLnNldENvbnRlbnQoaHRtbF9kMjkxM2Y3NzczMzc0ZWY0YjkxZDA3NDAwOTZiMmI0Myk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl8zMjg1ODEwNTI2YTU0Yzc4YmZhZDk2YWFkNDdjYmE4ZS5iaW5kUG9wdXAocG9wdXBfMDk0ZWY2MjU5YzMzNGI1ZWI4ZGZkYTU1MjZjOWYyYjIpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfNDUxNmMxYWQyNWQwNDdmODkzMzhjYjVhNjdjN2EwZjEgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yMzYwNSwgMTI2LjUwNDI1XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzAyZTk5YjhhOWEzODQ0OTA4MWNiMTliZWQ0N2IzZjRjID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNDUxNmMxYWQyNWQwNDdmODkzMzhjYjVhNjdjN2EwZjEuc2V0SWNvbihpY29uXzAyZTk5YjhhOWEzODQ0OTA4MWNiMTliZWQ0N2IzZjRjKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9jNTNkYzc4ODJhNTE0MjlhODc4NzM5OTgyY2Q3NjNiOSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfYWFiYzA1YmNhNmQxNDBhZDlhM2Q1ZGNjOTgxNjhkMWIgPSAkKGA8ZGl2IGlkPSJodG1sX2FhYmMwNWJjYTZkMTQwYWQ5YTNkNWRjYzk4MTY4ZDFiIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7shJzqsbTrj4Q8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfYzUzZGM3ODgyYTUxNDI5YTg3ODczOTk4MmNkNzYzYjkuc2V0Q29udGVudChodG1sX2FhYmMwNWJjYTZkMTQwYWQ5YTNkNWRjYzk4MTY4ZDFiKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzQ1MTZjMWFkMjVkMDQ3Zjg5MzM4Y2I1YTY3YzdhMGYxLmJpbmRQb3B1cChwb3B1cF9jNTNkYzc4ODJhNTE0MjlhODc4NzM5OTgyY2Q3NjNiOSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9mNzY2ZTg5Y2E3MzE0Y2MzYTczZmI4ZmZkNGFhZmQ3YSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0MjgyLCAxMjYuNDYwODNdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fYTA4NWQ1YzI0NzkzNDBkNzlhM2FlNjQwNmZlYmI4YzQgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl9mNzY2ZTg5Y2E3MzE0Y2MzYTczZmI4ZmZkNGFhZmQ3YS5zZXRJY29uKGljb25fYTA4NWQ1YzI0NzkzNDBkNzlhM2FlNjQwNmZlYmI4YzQpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzlkOWNlMzhiOTU5ZTQ5ODhiMTY5MDFhZjJmMWM3MGE5ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8zNTI1MTcyMDVkM2E0NGFkODc1YTk2NTc1YzAzMGUxYiA9ICQoYDxkaXYgaWQ9Imh0bWxfMzUyNTE3MjA1ZDNhNDRhZDg3NWE5NjU3NWMwMzBlMWIiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyblO2PieuniOydhDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF85ZDljZTM4Yjk1OWU0OTg4YjE2OTAxYWYyZjFjNzBhOS5zZXRDb250ZW50KGh0bWxfMzUyNTE3MjA1ZDNhNDRhZDg3NWE5NjU3NWMwMzBlMWIpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfZjc2NmU4OWNhNzMxNGNjM2E3M2ZiOGZmZDRhYWZkN2EuYmluZFBvcHVwKHBvcHVwXzlkOWNlMzhiOTU5ZTQ5ODhiMTY5MDFhZjJmMWM3MGE5KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzVkYjI0YzdmZTJmYTQ3YTNhN2U5NzVjYmY0Mzk1N2Y3ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuNDg5OSwgMTI2LjQ4ODkzOTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzE1NmUyNzU0NDQ3OTRiZGE4NWRiNjkxMDc1NWU1YTM5ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNWRiMjRjN2ZlMmZhNDdhM2E3ZTk3NWNiZjQzOTU3Zjcuc2V0SWNvbihpY29uXzE1NmUyNzU0NDQ3OTRiZGE4NWRiNjkxMDc1NWU1YTM5KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8xMzgzMDIwNzdhY2Y0ZDM3YWQ2ZGRiMWIzY2NlYjIwYiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMThmMjdlZjIwYTQ4NDc2ZGI4NjVmZDA3NTlmMDFiZTMgPSAkKGA8ZGl2IGlkPSJodG1sXzE4ZjI3ZWYyMGE0ODQ3NmRiODY1ZmQwNzU5ZjAxYmUzIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7roa/rjbDsi5zti7DtmLjthZQoNjAw67KIKTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8xMzgzMDIwNzdhY2Y0ZDM3YWQ2ZGRiMWIzY2NlYjIwYi5zZXRDb250ZW50KGh0bWxfMThmMjdlZjIwYTQ4NDc2ZGI4NjVmZDA3NTlmMDFiZTMpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNWRiMjRjN2ZlMmZhNDdhM2E3ZTk3NWNiZjQzOTU3ZjcuYmluZFBvcHVwKHBvcHVwXzEzODMwMjA3N2FjZjRkMzdhZDZkZGIxYjNjY2ViMjBiKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzdkMThlMDNkYTNlMjRmYWM5ODhmMjhmM2NiNTg4YzI1ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuNTA1NzEsIDEyNi40OTMxODk5OTk5OTk5OF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8xYmQ5ODgzYmZhM2M0OTA2OTdiZTVlZDVmNGY2ZGQ0YyA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzdkMThlMDNkYTNlMjRmYWM5ODhmMjhmM2NiNTg4YzI1LnNldEljb24oaWNvbl8xYmQ5ODgzYmZhM2M0OTA2OTdiZTVlZDVmNGY2ZGQ0Yyk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfOTQ5YmRkMzE1ZmU3NGJkY2EzMzI2NDZiN2UzM2U4MDggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzgwODBjNzhiODRkOTRmMjdiNWUxZTVjYTBjMDkwYzg1ID0gJChgPGRpdiBpZD0iaHRtbF84MDgwYzc4Yjg0ZDk0ZjI3YjVlMWU1Y2EwYzA5MGM4NSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO86rWt7KCc6rO17ZWtKOyiheygkCk8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfOTQ5YmRkMzE1ZmU3NGJkY2EzMzI2NDZiN2UzM2U4MDguc2V0Q29udGVudChodG1sXzgwODBjNzhiODRkOTRmMjdiNWUxZTVjYTBjMDkwYzg1KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzdkMThlMDNkYTNlMjRmYWM5ODhmMjhmM2NiNTg4YzI1LmJpbmRQb3B1cChwb3B1cF85NDliZGQzMTVmZTc0YmRjYTMzMjY0NmI3ZTMzZTgwOCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8yNGIyYmY5ZGJmM2I0ZDBlODgxODFiOGZjZGQwYzg5ZSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI0NTE5LCAxMjYuNTcwMTgwMDAwMDAwMDFdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fMDY1MjJmZjZiY2JlNGJiMDk5ZmRjYzI2YTZkYzQzYWIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8yNGIyYmY5ZGJmM2I0ZDBlODgxODFiOGZjZGQwYzg5ZS5zZXRJY29uKGljb25fMDY1MjJmZjZiY2JlNGJiMDk5ZmRjYzI2YTZkYzQzYWIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2JmMGFiNDZmMTU1ZTQ2OWI4NjQ4NzMwY2IzZDMzYTUwID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9lMzczMDM0MDE5OWQ0ODk5OTJkNDQ3OGI2YjViNjViYyA9ICQoYDxkaXYgaWQ9Imh0bWxfZTM3MzAzNDAxOTlkNDg5OTkyZDQ0NzhiNmI1YjY1YmMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyEnOuzteyghOyLnOq0gDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9iZjBhYjQ2ZjE1NWU0NjliODY0ODczMGNiM2QzM2E1MC5zZXRDb250ZW50KGh0bWxfZTM3MzAzNDAxOTlkNDg5OTkyZDQ0NzhiNmI1YjY1YmMpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMjRiMmJmOWRiZjNiNGQwZTg4MTgxYjhmY2RkMGM4OWUuYmluZFBvcHVwKHBvcHVwX2JmMGFiNDZmMTU1ZTQ2OWI4NjQ4NzMwY2IzZDMzYTUwKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzRkYzQ1MjNjNDA3MTQxNDI5NTg0M2U2YjRkMzM2MTZhID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQxNTcsIDEyNi40NDM1N10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81YWZmYmMxZjFjY2U0YWVjOTYwM2U2YmEyZDM5ZTNiMCA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzRkYzQ1MjNjNDA3MTQxNDI5NTg0M2U2YjRkMzM2MTZhLnNldEljb24oaWNvbl81YWZmYmMxZjFjY2U0YWVjOTYwM2U2YmEyZDM5ZTNiMCk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfMTlhNjM1NDg3ZDk1NDM1OTg3NmEwZTcxYmI4NGUzYTggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2E3MjIwYzI2ZDk2NDRiNmJhOWQ5ZTZlMWIyZmFkMmUyID0gJChgPGRpdiBpZD0iaHRtbF9hNzIyMGMyNmQ5NjQ0YjZiYTlkOWU2ZTFiMmZhZDJlMiIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+67Cw7Yq86rCc7J6F6rWsPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzE5YTYzNTQ4N2Q5NTQzNTk4NzZhMGU3MWJiODRlM2E4LnNldENvbnRlbnQoaHRtbF9hNzIyMGMyNmQ5NjQ0YjZiYTlkOWU2ZTFiMmZhZDJlMik7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl80ZGM0NTIzYzQwNzE0MTQyOTU4NDNlNmI0ZDMzNjE2YS5iaW5kUG9wdXAocG9wdXBfMTlhNjM1NDg3ZDk1NDM1OTg3NmEwZTcxYmI4NGUzYTgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMWZhMjc0ZDE1N2ZjNDk1ZjkxYjRjY2NlYzg4YjhiYTUgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yMzQzNCwgMTI2LjQ4MzYyXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzI0ZjQzNTUxNjcxNTQ5ODFhNzg2ZjI0OTg2ZGRkNDE0ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfMWZhMjc0ZDE1N2ZjNDk1ZjkxYjRjY2NlYzg4YjhiYTUuc2V0SWNvbihpY29uXzI0ZjQzNTUxNjcxNTQ5ODFhNzg2ZjI0OTg2ZGRkNDE0KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF81YjU2MzI1ZjAwY2U0YmJlYTkwMWFlZGY5OTRjM2JiMSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMjViOGMzNDhhODU0NDBmNGExODk0Nzk3YjAxMGExNDEgPSAkKGA8ZGl2IGlkPSJodG1sXzI1YjhjMzQ4YTg1NDQwZjRhMTg5NDc5N2IwMTBhMTQxIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7smZXrjIDsmZM8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNWI1NjMyNWYwMGNlNGJiZWE5MDFhZWRmOTk0YzNiYjEuc2V0Q29udGVudChodG1sXzI1YjhjMzQ4YTg1NDQwZjRhMTg5NDc5N2IwMTBhMTQxKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzFmYTI3NGQxNTdmYzQ5NWY5MWI0Y2NjZWM4OGI4YmE1LmJpbmRQb3B1cChwb3B1cF81YjU2MzI1ZjAwY2U0YmJlYTkwMWFlZGY5OTRjM2JiMSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl85ZmI3ODhmZTI2MzE0OGY3YThhZjU1ZjFkMjA5Y2Y0ZCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4MjE1LCAxMjYuNDgyNF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl81NmYyYTExZWFiZmI0NjEyODRiNmY2ODNlY2Q5M2E0YyA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzlmYjc4OGZlMjYzMTQ4ZjdhOGFmNTVmMWQyMDljZjRkLnNldEljb24oaWNvbl81NmYyYTExZWFiZmI0NjEyODRiNmY2ODNlY2Q5M2E0Yyk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfZTE3YmI4ODhlZjYwNDMwMjhmOTgyY2JjNjNiNDE2ZTggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2MyYmQxNDgyZDMwYzRkZjJiODQxN2I5MTY2NjhjOGQxID0gJChgPGRpdiBpZD0iaHRtbF9jMmJkMTQ4MmQzMGM0ZGYyYjg0MTdiOTE2NjY4YzhkMSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+66Gv642w66eI7Yq4PC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2UxN2JiODg4ZWY2MDQzMDI4Zjk4MmNiYzYzYjQxNmU4LnNldENvbnRlbnQoaHRtbF9jMmJkMTQ4MmQzMGM0ZGYyYjg0MTdiOTE2NjY4YzhkMSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl85ZmI3ODhmZTI2MzE0OGY3YThhZjU1ZjFkMjA5Y2Y0ZC5iaW5kUG9wdXAocG9wdXBfZTE3YmI4ODhlZjYwNDMwMjhmOTgyY2JjNjNiNDE2ZTgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMjE5YzJlMjE5ZjI2NGJmMGE0MWZiMGMyMTY5OWY0MTIgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40OTExLCAxMjYuNDk2NDddLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fYTQ3NTYyZjEyMTM5NGY5MWE0MTAwY2FjZmM1ZTgzMzIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8yMTljMmUyMTlmMjY0YmYwYTQxZmIwYzIxNjk5ZjQxMi5zZXRJY29uKGljb25fYTQ3NTYyZjEyMTM5NGY5MWE0MTAwY2FjZmM1ZTgzMzIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzBiNzZlZTAzNjk4OTRlNWI4M2FlMjhmNWFiOGY0ODc2ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8yYzVlMzQ2OWQzMDc0NGE3YjIxMzQ4YmJjZDNjZjFhMSA9ICQoYDxkaXYgaWQ9Imh0bWxfMmM1ZTM0NjlkMzA3NDRhN2IyMTM0OGJiY2QzY2YxYTEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuygnOyjvOuPhOyyreyLoOygnOyjvOuhnO2EsOumrDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF8wYjc2ZWUwMzY5ODk0ZTViODNhZTI4ZjVhYjhmNDg3Ni5zZXRDb250ZW50KGh0bWxfMmM1ZTM0NjlkMzA3NDRhN2IyMTM0OGJiY2QzY2YxYTEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMjE5YzJlMjE5ZjI2NGJmMGE0MWZiMGMyMTY5OWY0MTIuYmluZFBvcHVwKHBvcHVwXzBiNzZlZTAzNjk4OTRlNWI4M2FlMjhmNWFiOGY0ODc2KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzkxNzhmNTRhMDdmZTQ3NGY4YjBjM2JhNDRhMmQ2N2Y3ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuNDk5NDYsIDEyNi41MTQ3ODk5OTk5OTk5OV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9lOTE4OWFiNWZkMGQ0NjY3OTg3MmI2MTVmYjBmOGU1ZiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzkxNzhmNTRhMDdmZTQ3NGY4YjBjM2JhNDRhMmQ2N2Y3LnNldEljb24oaWNvbl9lOTE4OWFiNWZkMGQ0NjY3OTg3MmI2MTVmYjBmOGU1Zik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfYWM0YTBlMDk5OTMxNDZlMDg5MDRhZThkYWRiZjVlZWUgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzY5OTZjNTMyZTY5MjRjMTY5ODU4MmFlMjFiZDlhNjA3ID0gJChgPGRpdiBpZD0iaHRtbF82OTk2YzUzMmU2OTI0YzE2OTg1ODJhZTIxYmQ5YTYwNyIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO87Iuc7Jm467KE7Iqk7YSw66+464SQPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2FjNGEwZTA5OTkzMTQ2ZTA4OTA0YWU4ZGFkYmY1ZWVlLnNldENvbnRlbnQoaHRtbF82OTk2YzUzMmU2OTI0YzE2OTg1ODJhZTIxYmQ5YTYwNyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl85MTc4ZjU0YTA3ZmU0NzRmOGIwYzNiYTQ0YTJkNjdmNy5iaW5kUG9wdXAocG9wdXBfYWM0YTBlMDk5OTMxNDZlMDg5MDRhZThkYWRiZjVlZWUpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfZWZiZjg3NDAxN2I0NDgyOTkxNjM5ZTkxZjQyNWM3N2MgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNjE2MiwgMTI2LjUwMTQ1XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzg1MWI1ZTk1ZWU3ZTQ3NmJhYzI1ZmNkYjFhMDAyYjA0ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfZWZiZjg3NDAxN2I0NDgyOTkxNjM5ZTkxZjQyNWM3N2Muc2V0SWNvbihpY29uXzg1MWI1ZTk1ZWU3ZTQ3NmJhYzI1ZmNkYjFhMDAyYjA0KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF84YjJiYmQ3OTUxMmE0ZTMxODE0ODhhZWRhOWRhNTU1ZiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfOTU3YjIyMjE3Nzk5NDczNGI5MDUzMDdkMmI1YmNhMzIgPSAkKGA8ZGl2IGlkPSJodG1sXzk1N2IyMjIxNzc5OTQ3MzRiOTA1MzA3ZDJiNWJjYTMyIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7qsJXssL3tlZnsooXtlanqsr3quLDsnqU8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfOGIyYmJkNzk1MTJhNGUzMTgxNDg4YWVkYTlkYTU1NWYuc2V0Q29udGVudChodG1sXzk1N2IyMjIxNzc5OTQ3MzRiOTA1MzA3ZDJiNWJjYTMyKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2VmYmY4NzQwMTdiNDQ4Mjk5MTYzOWU5MWY0MjVjNzdjLmJpbmRQb3B1cChwb3B1cF84YjJiYmQ3OTUxMmE0ZTMxODE0ODhhZWRhOWRhNTU1ZikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8wNjVjZGQzZWUzYzg0NTNiYjk2ZDM3NmFjYTk5MGNlZSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1MjY1LCAxMjYuNTA0NTNdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fODk4ZDIyZWYyMGRlNGE1ZmJkNjVjY2RiNzU3N2M2NzggPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8wNjVjZGQzZWUzYzg0NTNiYjk2ZDM3NmFjYTk5MGNlZS5zZXRJY29uKGljb25fODk4ZDIyZWYyMGRlNGE1ZmJkNjVjY2RiNzU3N2M2NzgpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzU0OTg5YjBhYzhjYjQxYmFhNzdjZmI2YzkwZGQwZjY1ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF8zNDNhNzE2ZTRjYjc0ZTBiOTQ3ZjFjMjcyNzE3OWM3ZiA9ICQoYDxkaXYgaWQ9Imh0bWxfMzQzYTcxNmU0Y2I3NGUwYjk0N2YxYzI3MjcxNzljN2YiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuycoOyKue2VnOuCtOuTpOyVhO2MjO2KuDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF81NDk4OWIwYWM4Y2I0MWJhYTc3Y2ZiNmM5MGRkMGY2NS5zZXRDb250ZW50KGh0bWxfMzQzYTcxNmU0Y2I3NGUwYjk0N2YxYzI3MjcxNzljN2YpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMDY1Y2RkM2VlM2M4NDUzYmI5NmQzNzZhY2E5OTBjZWUuYmluZFBvcHVwKHBvcHVwXzU0OTg5YjBhYzhjYjQxYmFhNzdjZmI2YzkwZGQwZjY1KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2ZiMWQ4M2QwYzk5MzQ3ZDY4MjE5NGUxZjQyM2I1N2ExID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuNTA2NTksIDEyNi40OTI4OF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9mMmJmOGM3N2QxYTY0MjIxYTNlMjEzNjJmYjZiYjMwZiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2ZiMWQ4M2QwYzk5MzQ3ZDY4MjE5NGUxZjQyM2I1N2ExLnNldEljb24oaWNvbl9mMmJmOGM3N2QxYTY0MjIxYTNlMjEzNjJmYjZiYjMwZik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfZjZhNGI3MWFhYjc5NDI4YWE1Y2IzYWI2YWIyMGI5OTYgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2VkY2ZmY2U1ZDZmYjRlMWY4MTA0ODQzZjA4N2ZjNjNhID0gJChgPGRpdiBpZD0iaHRtbF9lZGNmZmNlNWQ2ZmI0ZTFmODEwNDg0M2YwODdmYzYzYSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO86rWt7KCc6rO17ZWtKO2Pie2ZlOuhnCwgODAw67KIKTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9mNmE0YjcxYWFiNzk0MjhhYTVjYjNhYjZhYjIwYjk5Ni5zZXRDb250ZW50KGh0bWxfZWRjZmZjZTVkNmZiNGUxZjgxMDQ4NDNmMDg3ZmM2M2EpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfZmIxZDgzZDBjOTkzNDdkNjgyMTk0ZTFmNDIzYjU3YTEuYmluZFBvcHVwKHBvcHVwX2Y2YTRiNzFhYWI3OTQyOGFhNWNiM2FiNmFiMjBiOTk2KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2ZlOTlkOWRjYTY3MzRkODdiNmI2NGYyNjUzOTkxODVlID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjU0MzcsIDEyNi41MTc5OTk5OTk5OTk5OV0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl80YTg0MTQwNDY0OGE0ZGYwYWU0MGM5YTQ5ZGY0NjhhNCA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2ZlOTlkOWRjYTY3MzRkODdiNmI2NGYyNjUzOTkxODVlLnNldEljb24oaWNvbl80YTg0MTQwNDY0OGE0ZGYwYWU0MGM5YTQ5ZGY0NjhhNCk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNDNmN2JkMWE0YmY2NGI2NTk3YjllMjA1MmVjMjA2ODYgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzQ3MDhkZjIyMjc5MjQwMmE5ODQzMjlkZDYyNTA5ZmFiID0gJChgPGRpdiBpZD0iaHRtbF80NzA4ZGYyMjI3OTI0MDJhOTg0MzI5ZGQ2MjUwOWZhYiIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+6rWt7IS46rO166y07JuQ6rWQ7Jyh7JuQ6rO166y07JuQ7Jew6riI6rO164uoPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzQzZjdiZDFhNGJmNjRiNjU5N2I5ZTIwNTJlYzIwNjg2LnNldENvbnRlbnQoaHRtbF80NzA4ZGYyMjI3OTI0MDJhOTg0MzI5ZGQ2MjUwOWZhYik7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9mZTk5ZDlkY2E2NzM0ZDg3YjZiNjRmMjY1Mzk5MTg1ZS5iaW5kUG9wdXAocG9wdXBfNDNmN2JkMWE0YmY2NGI2NTk3YjllMjA1MmVjMjA2ODYpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfNTczZTc4ZmQwMDMyNDk2Nzk0ODc1NGE5NDc2NDRhMzkgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNDg3MywgMTI2LjUwNzk4OTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2RmM2FjNGY5YmFmNjQzZTBiYjM4NmFiMzFkMDVkMzNiID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNTczZTc4ZmQwMDMyNDk2Nzk0ODc1NGE5NDc2NDRhMzkuc2V0SWNvbihpY29uX2RmM2FjNGY5YmFmNjQzZTBiYjM4NmFiMzFkMDVkMzNiKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9hYTU2ZDc4OWY0MzQ0NjAxYmNmMzA4MmQ4ZjEwNjJiNiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfYzBiODVmZWRlZGFiNGFkZWFlOWU0MzgxNWQ3NDI1MmIgPSAkKGA8ZGl2IGlkPSJodG1sX2MwYjg1ZmVkZWRhYjRhZGVhZTllNDM4MTVkNzQyNTJiIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7shJzqt4Dtj6zsi5zsmbjrsoTsiqTthLDrr7jrhJA8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfYWE1NmQ3ODlmNDM0NDYwMWJjZjMwODJkOGYxMDYyYjYuc2V0Q29udGVudChodG1sX2MwYjg1ZmVkZWRhYjRhZGVhZTllNDM4MTVkNzQyNTJiKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzU3M2U3OGZkMDAzMjQ5Njc5NDg3NTRhOTQ3NjQ0YTM5LmJpbmRQb3B1cChwb3B1cF9hYTU2ZDc4OWY0MzQ0NjAxYmNmMzA4MmQ4ZjEwNjJiNikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl83MTljNGY4OTE2NzU0ODllOGJiNjc0ZTQ4NWU5ODFkNSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4MTksIDEyNi40ODIxOF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9iMzA5Njg3NjE5ZDg0M2Q5OGNiNDJlMzcwNmU3OTliNCA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzcxOWM0Zjg5MTY3NTQ4OWU4YmI2NzRlNDg1ZTk4MWQ1LnNldEljb24oaWNvbl9iMzA5Njg3NjE5ZDg0M2Q5OGNiNDJlMzcwNmU3OTliNCk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfMDFkNmM4NjkxMzM2NGJjMGEwNjFjMzdiZjliY2M0ODggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2ZmODc2Nzg4Mjc3MTRiNzlhYWY2MTljNzk2ZGY5Njc4ID0gJChgPGRpdiBpZD0iaHRtbF9mZjg3Njc4ODI3NzE0Yjc5YWFmNjE5Yzc5NmRmOTY3OCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+66Gv642w66eI7Yq4PC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzAxZDZjODY5MTMzNjRiYzBhMDYxYzM3YmY5YmNjNDg4LnNldENvbnRlbnQoaHRtbF9mZjg3Njc4ODI3NzE0Yjc5YWFmNjE5Yzc5NmRmOTY3OCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl83MTljNGY4OTE2NzU0ODllOGJiNjc0ZTQ4NWU5ODFkNS5iaW5kUG9wdXAocG9wdXBfMDFkNmM4NjkxMzM2NGJjMGEwNjFjMzdiZjliY2M0ODgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfODE2ZmYyMmZkY2I1NGNjNmJiNmU3NTFhMjM0MWVlMWEgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy40OTE0MywgMTI2LjQ5Njc4XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzM4MmMyMGI0MmIyNDRmNjdhMmM2YzM4ZGUzOTIzYWM0ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfODE2ZmYyMmZkY2I1NGNjNmJiNmU3NTFhMjM0MWVlMWEuc2V0SWNvbihpY29uXzM4MmMyMGI0MmIyNDRmNjdhMmM2YzM4ZGUzOTIzYWM0KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8xOTI4MzliZmFmYzI0MjE1OWViZWFhODZhMGQ0YjMxMiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMjk0YzViMTEzNGM4NGQxZDkyOGNlZTc5YzI3NjdhNGYgPSAkKGA8ZGl2IGlkPSJodG1sXzI5NGM1YjExMzRjODRkMWQ5MjhjZWU3OWMyNzY3YTRmIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7soJzso7zrj4Tssq3si6DsoJzso7zroZzthLDrpqw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfMTkyODM5YmZhZmMyNDIxNTllYmVhYTg2YTBkNGIzMTIuc2V0Q29udGVudChodG1sXzI5NGM1YjExMzRjODRkMWQ5MjhjZWU3OWMyNzY3YTRmKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzgxNmZmMjJmZGNiNTRjYzZiYjZlNzUxYTIzNDFlZTFhLmJpbmRQb3B1cChwb3B1cF8xOTI4MzliZmFmYzI0MjE1OWViZWFhODZhMGQ0YjMxMikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl82M2RlZmE2NTIyZmI0M2UxYmJkZTM3MmZjNDUyODU3ZCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI2MDkwOTk5OTk5OTk5NiwgMTI2LjQ4NjYxMDAwMDAwMDAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2QzMDhlNzA3MjllNzQyYWU5MzA1ZmY3ZWNlNzBkODhjID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNjNkZWZhNjUyMmZiNDNlMWJiZGUzNzJmYzQ1Mjg1N2Quc2V0SWNvbihpY29uX2QzMDhlNzA3MjllNzQyYWU5MzA1ZmY3ZWNlNzBkODhjKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8wM2NjOWU2Mjg3Mjc0ZTg5YTVkMDgyM2UwZTliZTUzZCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMzQyM2I2YTFjMDlkNDc2OWE4MGU4OTk1OTgwZjFkNmYgPSAkKGA8ZGl2IGlkPSJodG1sXzM0MjNiNmExYzA5ZDQ3NjlhODBlODk5NTk4MGYxZDZmIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7rho3sl4XquLDsiKDsm5A8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfMDNjYzllNjI4NzI3NGU4OWE1ZDA4MjNlMGU5YmU1M2Quc2V0Q29udGVudChodG1sXzM0MjNiNmExYzA5ZDQ3NjlhODBlODk5NTk4MGYxZDZmKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzYzZGVmYTY1MjJmYjQzZTFiYmRlMzcyZmM0NTI4NTdkLmJpbmRQb3B1cChwb3B1cF8wM2NjOWU2Mjg3Mjc0ZTg5YTVkMDgyM2UwZTliZTUzZCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8yYjU0MGJiYjM3MWI0YTE2YjIwZGM3Y2Q2NzBkODQ3YSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1NTA3LCAxMjYuNTEwMDddLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZGZiNDM4MGM4YTYzNDk5OThlNjA4ZTM1MDNmYmY0ZDEgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8yYjU0MGJiYjM3MWI0YTE2YjIwZGM3Y2Q2NzBkODQ3YS5zZXRJY29uKGljb25fZGZiNDM4MGM4YTYzNDk5OThlNjA4ZTM1MDNmYmY0ZDEpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzViZmYzMGQ5M2M0YzQyYWZhZjIzZGQxNmRkNGY0ZTRmID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF83MDMwYzcwMmM4MGY0ZmNmYTczNmMzYzcyNjNmM2YwMSA9ICQoYDxkaXYgaWQ9Imh0bWxfNzAzMGM3MDJjODBmNGZjZmE3MzZjM2M3MjYzZjNmMDEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyEnOq3gO2PrOyasOyytOq1reyEnOq3gO2PrOyLnOyyreygnDLssq3sgqw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNWJmZjMwZDkzYzRjNDJhZmFmMjNkZDE2ZGQ0ZjRlNGYuc2V0Q29udGVudChodG1sXzcwMzBjNzAyYzgwZjRmY2ZhNzM2YzNjNzI2M2YzZjAxKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzJiNTQwYmJiMzcxYjRhMTZiMjBkYzdjZDY3MGQ4NDdhLmJpbmRQb3B1cChwb3B1cF81YmZmMzBkOTNjNGM0MmFmYWYyM2RkMTZkZDRmNGU0ZikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8yMGQ3NWVlZTNjYmI0YjUxOWVlOWI1NGFiZjhmZWUxZCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI2MTc4LCAxMjYuNTAxNDYwMDAwMDAwMDFdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZmQwOTMwYWZiOTYzNDI0MWE2MTM3MDA5MjdhY2JjMWYgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl8yMGQ3NWVlZTNjYmI0YjUxOWVlOWI1NGFiZjhmZWUxZC5zZXRJY29uKGljb25fZmQwOTMwYWZiOTYzNDI0MWE2MTM3MDA5MjdhY2JjMWYpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2Q2OTc1YWJhYzBjZDQ3NTJhMjViNjg3ZjUzYjE0MzMzID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9kOTY5OGY3ODcxYjc0MGVmYTI5N2QzZDhjODgwMmFiYSA9ICQoYDxkaXYgaWQ9Imh0bWxfZDk2OThmNzg3MWI3NDBlZmEyOTdkM2Q4Yzg4MDJhYmEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuqwleywve2Vmeyihe2Vqeqyveq4sOyepTwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9kNjk3NWFiYWMwY2Q0NzUyYTI1YjY4N2Y1M2IxNDMzMy5zZXRDb250ZW50KGh0bWxfZDk2OThmNzg3MWI3NDBlZmEyOTdkM2Q4Yzg4MDJhYmEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfMjBkNzVlZWUzY2JiNGI1MTllZTliNTRhYmY4ZmVlMWQuYmluZFBvcHVwKHBvcHVwX2Q2OTc1YWJhYzBjZDQ3NTJhMjViNjg3ZjUzYjE0MzMzKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2IwMGU5ZTc2NzRhMTQ2ZGFhY2YzMjQ1YjZjYWZmYmM5ID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjQ5ODUsIDEyNi41MDcyM10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9kODlmYWVlNzRhYmM0OTliOTI3NmZkMzlhZjQwMmNkOCA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2IwMGU5ZTc2NzRhMTQ2ZGFhY2YzMjQ1YjZjYWZmYmM5LnNldEljb24oaWNvbl9kODlmYWVlNzRhYmM0OTliOTI3NmZkMzlhZjQwMmNkOCk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfN2U4MzkzMzIxMmY5NGYzMThmZDI2MWMzNGNjMTlhNGUgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2YyZWIyODA2ZjUzYzRmOTk5YWMxMDQyNDgwN2Y1NjAwID0gJChgPGRpdiBpZD0iaHRtbF9mMmViMjgwNmY1M2M0Zjk5OWFjMTA0MjQ4MDdmNTYwMCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ISc6reA7Y+s7Iuc7Jm467KE7Iqk7YSw66+464SQKOqwgOyDgeygleulmOyGjCk8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfN2U4MzkzMzIxMmY5NGYzMThmZDI2MWMzNGNjMTlhNGUuc2V0Q29udGVudChodG1sX2YyZWIyODA2ZjUzYzRmOTk5YWMxMDQyNDgwN2Y1NjAwKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2IwMGU5ZTc2NzRhMTQ2ZGFhY2YzMjQ1YjZjYWZmYmM5LmJpbmRQb3B1cChwb3B1cF83ZTgzOTMzMjEyZjk0ZjMxOGZkMjYxYzM0Y2MxOWE0ZSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl80NzM1ODZiMTdhMzE0YzRmYjQzZTA4YmFjYTk1NzAxOCA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjI1MTU4LCAxMjYuNTE4ODg5OTk5OTk5OThdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fYTZjZWE5NDc1ODBkNDRhOGI4OTk0ZTBiNjg5OGYzNDYgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl80NzM1ODZiMTdhMzE0YzRmYjQzZTA4YmFjYTk1NzAxOC5zZXRJY29uKGljb25fYTZjZWE5NDc1ODBkNDRhOGI4OTk0ZTBiNjg5OGYzNDYpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzY3ZGZkMjIxMzM2NTRmMjE5NzU5ZGI0MGZmODZhNDdjID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF9mNmI5MTM1NTBlNDk0NzJmYTJiNzZkYWM0YTFlOWUwYyA9ICQoYDxkaXYgaWQ9Imh0bWxfZjZiOTEzNTUwZTQ5NDcyZmEyYjc2ZGFjNGExZTllMGMiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuyCvOuLpOyytOycoeqzteybkOyeheq1rDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF82N2RmZDIyMTMzNjU0ZjIxOTc1OWRiNDBmZjg2YTQ3Yy5zZXRDb250ZW50KGh0bWxfZjZiOTEzNTUwZTQ5NDcyZmEyYjc2ZGFjNGExZTllMGMpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNDczNTg2YjE3YTMxNGM0ZmI0M2UwOGJhY2E5NTcwMTguYmluZFBvcHVwKHBvcHVwXzY3ZGZkMjIxMzM2NTRmMjE5NzU5ZGI0MGZmODZhNDdjKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzk3Yjg4YTYzMmYxZDRkMmRiOWJjN2U1MTRhYTU4NTQwID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjYzMDU5OTk5OTk5OTk2LCAxMjYuNDU5NDZdLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fNjAwZDZkNTgyZTcyNDI4M2I0NTAyYzM5NTZkNTUxNDIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl85N2I4OGE2MzJmMWQ0ZDJkYjliYzdlNTE0YWE1ODU0MC5zZXRJY29uKGljb25fNjAwZDZkNTgyZTcyNDI4M2I0NTAyYzM5NTZkNTUxNDIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzVlYzYyMDMwZGM5ZDRmOGQ5OGY5MWE3MGRiOWQ3N2NkID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF82ZGVhNzRkODA3NTk0NDIzOTYyZGQyYWUzYzRjOGRiYSA9ICQoYDxkaXYgaWQ9Imh0bWxfNmRlYTc0ZDgwNzU5NDQyMzk2MmRkMmFlM2M0YzhkYmEiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuyle2ZlOyCrOyCrOqxsOumrDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF81ZWM2MjAzMGRjOWQ0ZjhkOThmOTFhNzBkYjlkNzdjZC5zZXRDb250ZW50KGh0bWxfNmRlYTc0ZDgwNzU5NDQyMzk2MmRkMmFlM2M0YzhkYmEpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfOTdiODhhNjMyZjFkNGQyZGI5YmM3ZTUxNGFhNTg1NDAuYmluZFBvcHVwKHBvcHVwXzVlYzYyMDMwZGM5ZDRmOGQ5OGY5MWE3MGRiOWQ3N2NkKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzRjYjI1YWFmOWQzNzRlMDg4ZmZlZGU5ZTZkZGE5OGNjID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuMjUyNDYsIDEyNi41MDQ0M10sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl8yNDgyNGQ2YzY4NWU0ZjEzYWI1ZGRmMTA2YzQwYWY2MiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzRjYjI1YWFmOWQzNzRlMDg4ZmZlZGU5ZTZkZGE5OGNjLnNldEljb24oaWNvbl8yNDgyNGQ2YzY4NWU0ZjEzYWI1ZGRmMTA2YzQwYWY2Mik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfYWEwOGE4MzBlYTc4NDUxOGFlZTljZTNlNTVmZDNkZGQgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzUzNzc0N2ExYjMxNDRkNzU5YTRmNGQwNzk5ODBmYjljID0gJChgPGRpdiBpZD0iaHRtbF81Mzc3NDdhMWIzMTQ0ZDc1OWE0ZjRkMDc5OTgwZmI5YyIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7Jyg7Iq57ZWc64K065Ok7JWE7YyM7Yq4PC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwX2FhMDhhODMwZWE3ODQ1MThhZWU5Y2UzZTU1ZmQzZGRkLnNldENvbnRlbnQoaHRtbF81Mzc3NDdhMWIzMTQ0ZDc1OWE0ZjRkMDc5OTgwZmI5Yyk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl80Y2IyNWFhZjlkMzc0ZTA4OGZmZWRlOWU2ZGRhOThjYy5iaW5kUG9wdXAocG9wdXBfYWEwOGE4MzBlYTc4NDUxOGFlZTljZTNlNTVmZDNkZGQpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfYjMyNjc1ZjkwOWUyNGZlOTliNGQ0Mjc3NjI5NzcyYWEgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy4yNTQ2MywgMTI2LjUxNzc4OTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzZmNmY4ZWVhZmJjMDQ4MTA5ODY4MWQ3NmRlZTViN2NjID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfYjMyNjc1ZjkwOWUyNGZlOTliNGQ0Mjc3NjI5NzcyYWEuc2V0SWNvbihpY29uXzZmNmY4ZWVhZmJjMDQ4MTA5ODY4MWQ3NmRlZTViN2NjKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8zYzYwZDk1OTNkYTk0MDFkYmUzODhkOGJjMGRmMmQxMiA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfZjE2Y2I4MTYzNWM0NGU3OTk2OTVmYjIyZDg4YTg5YzkgPSAkKGA8ZGl2IGlkPSJodG1sX2YxNmNiODE2MzVjNDRlNzk5Njk1ZmIyMmQ4OGE4OWM5IiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7qta3shLjqs7XrrLTsm5DqtZDsnKHsm5Dqs7XrrLTsm5Dsl7DquIjqs7Xri6g8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfM2M2MGQ5NTkzZGE5NDAxZGJlMzg4ZDhiYzBkZjJkMTIuc2V0Q29udGVudChodG1sX2YxNmNiODE2MzVjNDRlNzk5Njk1ZmIyMmQ4OGE4OWM5KTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2IzMjY3NWY5MDllMjRmZTk5YjRkNDI3NzYyOTc3MmFhLmJpbmRQb3B1cChwb3B1cF8zYzYwZDk1OTNkYTk0MDFkYmUzODhkOGJjMGRmMmQxMikKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl9lYzA5N2MxZmU0MjU0NDE0YTE3ZmQ0YmFlYzAzOGNiYSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjQ4NjU0OSwgMTI2LjQ5OTE1Ml0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl9kNjdiMjcwMDE1YmI0MGU2ODVlZWJmNGY2ODBhNDI0OSA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2VjMDk3YzFmZTQyNTQ0MTRhMTdmZDRiYWVjMDM4Y2JhLnNldEljb24oaWNvbl9kNjdiMjcwMDE1YmI0MGU2ODVlZWJmNGY2ODBhNDI0OSk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfODYxZmI3ZTUwMjE2NDViMzg1N2RiNzhlMzljYjQwNTIgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzQ3YTQxMDc5YjljMzQ3YTRiNGIxMzQ5MmU1MjkyMTc4ID0gJChgPGRpdiBpZD0iaHRtbF80N2E0MTA3OWI5YzM0N2E0YjRiMTM0OTJlNTI5MjE3OCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7KCc7KO87Juw7Lu07IS87YSwPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzg2MWZiN2U1MDIxNjQ1YjM4NTdkYjc4ZTM5Y2I0MDUyLnNldENvbnRlbnQoaHRtbF80N2E0MTA3OWI5YzM0N2E0YjRiMTM0OTJlNTI5MjE3OCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9lYzA5N2MxZmU0MjU0NDE0YTE3ZmQ0YmFlYzAzOGNiYS5iaW5kUG9wdXAocG9wdXBfODYxZmI3ZTUwMjE2NDViMzg1N2RiNzhlMzljYjQwNTIpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfNjAzN2YzZWI5ZmYyNGUwMWE5N2Q1NmE0YTEyNWY1MmYgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy45NjI2OSwgMTI2LjI5NzYxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzQyMzQzNDZjYjEzYjQ0YWFhYWRkYWMxZDY1MDQ3ODJiID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfNjAzN2YzZWI5ZmYyNGUwMWE5N2Q1NmE0YTEyNWY1MmYuc2V0SWNvbihpY29uXzQyMzQzNDZjYjEzYjQ0YWFhYWRkYWMxZDY1MDQ3ODJiKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF8yY2NiYmZiY2UzYTk0YWY5YWI3MTFmODAyM2QxOWEyMSA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfMDQ3NWVmYTZlOTVlNGFiNjkyMjE1MmFjZjE5OTgxNzIgPSAkKGA8ZGl2IGlkPSJodG1sXzA0NzVlZmE2ZTk1ZTRhYjY5MjIxNTJhY2YxOTk4MTcyIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7sl6zqsJ3shKDrjIDtlansi6Q8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfMmNjYmJmYmNlM2E5NGFmOWFiNzExZjgwMjNkMTlhMjEuc2V0Q29udGVudChodG1sXzA0NzVlZmE2ZTk1ZTRhYjY5MjIxNTJhY2YxOTk4MTcyKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzYwMzdmM2ViOWZmMjRlMDFhOTdkNTZhNGExMjVmNTJmLmJpbmRQb3B1cChwb3B1cF8yY2NiYmZiY2UzYTk0YWY5YWI3MTFmODAyM2QxOWEyMSkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl8zNjU3NzI3OGU2ZDY0MzA4OTY0NjRjMWJlZjkzZWJlNiA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjk2MzY0MDAwMDAwMDAwNSwgMTI2LjI5NjgxMDAwMDAwMDAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2NhOWM3ODM4NmVkMjQ0ZmJiMzVkOWJjMDRhZGM0MDBjID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfMzY1NzcyNzhlNmQ2NDMwODk2NDY0YzFiZWY5M2ViZTYuc2V0SWNvbihpY29uX2NhOWM3ODM4NmVkMjQ0ZmJiMzVkOWJjMDRhZGM0MDBjKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF82NWM2ZGFiMGMwMmY0MDgzYWQ2YWM4YzQ0NjdhY2JmYyA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfYWFmMDkzNGU1NDE0NDc0NTg1MTA2YmFmOTQ1MDQxOGQgPSAkKGA8ZGl2IGlkPSJodG1sX2FhZjA5MzRlNTQxNDQ3NDU4NTEwNmJhZjk0NTA0MThkIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7stpTsnpDrqbTsnpDsuZjshLzthLA8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfNjVjNmRhYjBjMDJmNDA4M2FkNmFjOGM0NDY3YWNiZmMuc2V0Q29udGVudChodG1sX2FhZjA5MzRlNTQxNDQ3NDU4NTEwNmJhZjk0NTA0MThkKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyXzM2NTc3Mjc4ZTZkNjQzMDg5NjQ2NGMxYmVmOTNlYmU2LmJpbmRQb3B1cChwb3B1cF82NWM2ZGFiMGMwMmY0MDgzYWQ2YWM4YzQ0NjdhY2JmYykKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl82ZWEwZTllM2M0NWE0YTMzYTIyN2NmZDNmNTI3OTQ5YSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjk2Mjg0LCAxMjYuMjk1NjM5OTk5OTk5OTldLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fZDg4NDgzNmIzYzdiNDZiNmFlNTVlMjhlMGM1MmIxMDMgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl82ZWEwZTllM2M0NWE0YTMzYTIyN2NmZDNmNTI3OTQ5YS5zZXRJY29uKGljb25fZDg4NDgzNmIzYzdiNDZiNmFlNTVlMjhlMGM1MmIxMDMpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwXzk2OGRkNmY1MTExOTQ1YjA4YzA4MWNiOGRjY2ViNjQ1ID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF80YTBjYzY3YzNlZjY0MDE2OTczNzE1YzExODc2ZjJiMCA9ICQoYDxkaXYgaWQ9Imh0bWxfNGEwY2M2N2MzZWY2NDAxNjk3MzcxNWMxMTg3NmYyYjAiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuuMgOyEnOumrOyCrOustOyGjDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF85NjhkZDZmNTExMTk0NWIwOGMwODFjYjhkY2NlYjY0NS5zZXRDb250ZW50KGh0bWxfNGEwY2M2N2MzZWY2NDAxNjk3MzcxNWMxMTg3NmYyYjApOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfNmVhMGU5ZTNjNDVhNGEzM2EyMjdjZmQzZjUyNzk0OWEuYmluZFBvcHVwKHBvcHVwXzk2OGRkNmY1MTExOTQ1YjA4YzA4MWNiOGRjY2ViNjQ1KQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyX2NkNjgzMzVjNDcwZTQxMmE5ZWJhMTdhMTI1ZGIxMjZjID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuOTYyMzIsIDEyNi4yOTQxNl0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl84Y2UwOWI1NDMxODU0ODY3Yjg2NzcxM2M5YjViYWY1MCA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyX2NkNjgzMzVjNDcwZTQxMmE5ZWJhMTdhMTI1ZGIxMjZjLnNldEljb24oaWNvbl84Y2UwOWI1NDMxODU0ODY3Yjg2NzcxM2M5YjViYWY1MCk7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfOTIyMGU1ZGE2Njc5NDY4MWJjYjM3Y2YzYWMyNDA2NDcgPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sX2Y0MzIzMjEzODc2NzQ3MDc4YjczYzE2OTVjN2I4M2U1ID0gJChgPGRpdiBpZD0iaHRtbF9mNDMyMzIxMzg3Njc0NzA3OGI3M2MxNjk1YzdiODNlNSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ZWc7J2Y7JuQPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzkyMjBlNWRhNjY3OTQ2ODFiY2IzN2NmM2FjMjQwNjQ3LnNldENvbnRlbnQoaHRtbF9mNDMyMzIxMzg3Njc0NzA3OGI3M2MxNjk1YzdiODNlNSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl9jZDY4MzM1YzQ3MGU0MTJhOWViYTE3YTEyNWRiMTI2Yy5iaW5kUG9wdXAocG9wdXBfOTIyMGU1ZGE2Njc5NDY4MWJjYjM3Y2YzYWMyNDA2NDcpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfYTMzZjA4NWQ3YWQxNGMyNmFkOWE2ZDdlMjE3NzhkMjcgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy45NjE0MSwgMTI2LjI5NDUxOTk5OTk5OTk5XSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uX2U0NTc2ZmE0YzM5MjQ1OGY5YTM4Y2RjYzg3OTJjMjU4ID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfYTMzZjA4NWQ3YWQxNGMyNmFkOWE2ZDdlMjE3NzhkMjcuc2V0SWNvbihpY29uX2U0NTc2ZmE0YzM5MjQ1OGY5YTM4Y2RjYzg3OTJjMjU4KTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF9kOWVkNjU4ODMyYzI0MWY5YWQ4YmIxYmNhNTljNjcxOCA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfNjNiYTJkMGM5YTg2NDhlNmFkYWQwNDYxYzkzYjk2MWMgPSAkKGA8ZGl2IGlkPSJodG1sXzYzYmEyZDBjOWE4NjQ4ZTZhZGFkMDQ2MWM5M2I5NjFjIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7sl5jsp4Drp4jtirg8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfZDllZDY1ODgzMmMyNDFmOWFkOGJiMWJjYTU5YzY3MTguc2V0Q29udGVudChodG1sXzYzYmEyZDBjOWE4NjQ4ZTZhZGFkMDQ2MWM5M2I5NjFjKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2EzM2YwODVkN2FkMTRjMjZhZDlhNmQ3ZTIxNzc4ZDI3LmJpbmRQb3B1cChwb3B1cF9kOWVkNjU4ODMyYzI0MWY5YWQ4YmIxYmNhNTljNjcxOCkKICAgICAgICA7CgogICAgICAgIAogICAgCiAgICAKICAgICAgICAgICAgdmFyIG1hcmtlcl85MDYzM2YxYTcxYzQ0N2Q4YjQxNGQyZTkwZjAzNTlkMSA9IEwubWFya2VyKAogICAgICAgICAgICAgICAgWzMzLjk0Mzg0LCAxMjYuMzI1NzY5OTk5OTk5OTldLAogICAgICAgICAgICAgICAge30KICAgICAgICAgICAgKS5hZGRUbyhtYXJrZXJfY2x1c3Rlcl82Nzg5OTM1ZDg5ODA0ZGY5OTNmNGM5NGIyNTNjNDRmOCk7CiAgICAgICAgCiAgICAKICAgICAgICAgICAgdmFyIGljb25fM2JhODE1ZjczNDZiNDY4ZGFkZjMyYmU3NmJkMWNmMmIgPSBMLkF3ZXNvbWVNYXJrZXJzLmljb24oCiAgICAgICAgICAgICAgICB7ImV4dHJhQ2xhc3NlcyI6ICJmYS1yb3RhdGUtMCIsICJpY29uIjogInN0YXIiLCAiaWNvbkNvbG9yIjogIndoaXRlIiwgIm1hcmtlckNvbG9yIjogImJsdWUiLCAicHJlZml4IjogImdseXBoaWNvbiJ9CiAgICAgICAgICAgICk7CiAgICAgICAgICAgIG1hcmtlcl85MDYzM2YxYTcxYzQ0N2Q4YjQxNGQyZTkwZjAzNTlkMS5zZXRJY29uKGljb25fM2JhODE1ZjczNDZiNDY4ZGFkZjMyYmU3NmJkMWNmMmIpOwogICAgICAgIAogICAgCiAgICAgICAgdmFyIHBvcHVwX2U0MGI1NDdhY2NmZjRhMDhiNmJkZWMxZjY5MTY5NDRjID0gTC5wb3B1cCh7Im1heFdpZHRoIjogIjEwMCUifSk7CgogICAgICAgIAogICAgICAgICAgICB2YXIgaHRtbF81MzRhOGVjMzJiY2M0NTk0YWIxOTAyZjFmMWY5ZjA0NiA9ICQoYDxkaXYgaWQ9Imh0bWxfNTM0YThlYzMyYmNjNDU5NGFiMTkwMmYxZjFmOWYwNDYiIHN0eWxlPSJ3aWR0aDogMTAwLjAlOyBoZWlnaHQ6IDEwMC4wJTsiPuy2lOyekOykke2Vmeq1kDwvZGl2PmApWzBdOwogICAgICAgICAgICBwb3B1cF9lNDBiNTQ3YWNjZmY0YTA4YjZiZGVjMWY2OTE2OTQ0Yy5zZXRDb250ZW50KGh0bWxfNTM0YThlYzMyYmNjNDU5NGFiMTkwMmYxZjFmOWYwNDYpOwogICAgICAgIAoKICAgICAgICBtYXJrZXJfOTA2MzNmMWE3MWM0NDdkOGI0MTRkMmU5MGYwMzU5ZDEuYmluZFBvcHVwKHBvcHVwX2U0MGI1NDdhY2NmZjRhMDhiNmJkZWMxZjY5MTY5NDRjKQogICAgICAgIDsKCiAgICAgICAgCiAgICAKICAgIAogICAgICAgICAgICB2YXIgbWFya2VyXzk2M2ZiZjgxNWNkNzQxOTBhMDNlMDhlNDQ3Mzg4N2EyID0gTC5tYXJrZXIoCiAgICAgICAgICAgICAgICBbMzMuOTQ2MDMsIDEyNi4zMjg4Nl0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl83OGE3ZTgzMTU5ZDM0YWZmOTlmMzcwZjE1NWE5ZDBlYiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzk2M2ZiZjgxNWNkNzQxOTBhMDNlMDhlNDQ3Mzg4N2EyLnNldEljb24oaWNvbl83OGE3ZTgzMTU5ZDM0YWZmOTlmMzcwZjE1NWE5ZDBlYik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfM2Q5ZTc3NGVlOThmNDExZTk0OTQ0OTg2ZmUxODQwMTggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzJhMDcxODE3YzkxNjQ1YjBhMzAzYzczNTEzZTBhYzQ1ID0gJChgPGRpdiBpZD0iaHRtbF8yYTA3MTgxN2M5MTY0NWIwYTMwM2M3MzUxM2UwYWM0NSIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7ZWY7LaU7J6Q67O06rG07IaMPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzNkOWU3NzRlZTk4ZjQxMWU5NDk0NDk4NmZlMTg0MDE4LnNldENvbnRlbnQoaHRtbF8yYTA3MTgxN2M5MTY0NWIwYTMwM2M3MzUxM2UwYWM0NSk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl85NjNmYmY4MTVjZDc0MTkwYTAzZTA4ZTQ0NzM4ODdhMi5iaW5kUG9wdXAocG9wdXBfM2Q5ZTc3NGVlOThmNDExZTk0OTQ0OTg2ZmUxODQwMTgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfMDdjYzViZTE5NDNkNGNkYzk3YmFlY2QxYjc1NDFmNTggPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy45NTM1OTAwMDAwMDAwMDUsIDEyNi4zMzEzNF0sCiAgICAgICAgICAgICAgICB7fQogICAgICAgICAgICApLmFkZFRvKG1hcmtlcl9jbHVzdGVyXzY3ODk5MzVkODk4MDRkZjk5M2Y0Yzk0YjI1M2M0NGY4KTsKICAgICAgICAKICAgIAogICAgICAgICAgICB2YXIgaWNvbl83MTg0NGJhMTc0YTg0ZjcxYWRjYTZhNjBkMjI0NGIwNiA9IEwuQXdlc29tZU1hcmtlcnMuaWNvbigKICAgICAgICAgICAgICAgIHsiZXh0cmFDbGFzc2VzIjogImZhLXJvdGF0ZS0wIiwgImljb24iOiAic3RhciIsICJpY29uQ29sb3IiOiAid2hpdGUiLCAibWFya2VyQ29sb3IiOiAiYmx1ZSIsICJwcmVmaXgiOiAiZ2x5cGhpY29uIn0KICAgICAgICAgICAgKTsKICAgICAgICAgICAgbWFya2VyXzA3Y2M1YmUxOTQzZDRjZGM5N2JhZWNkMWI3NTQxZjU4LnNldEljb24oaWNvbl83MTg0NGJhMTc0YTg0ZjcxYWRjYTZhNjBkMjI0NGIwNik7CiAgICAgICAgCiAgICAKICAgICAgICB2YXIgcG9wdXBfNGY5NjRlMWM4ZDRlNDExMDliZmU1MTgyNzAzNWM2NjggPSBMLnBvcHVwKHsibWF4V2lkdGgiOiAiMTAwJSJ9KTsKCiAgICAgICAgCiAgICAgICAgICAgIHZhciBodG1sXzhkZTU3NTlkY2ZjYjQyMDU5ZGEzMjMwZTZmZGVlN2EwID0gJChgPGRpdiBpZD0iaHRtbF84ZGU1NzU5ZGNmY2I0MjA1OWRhMzIzMGU2ZmRlZTdhMCIgc3R5bGU9IndpZHRoOiAxMDAuMCU7IGhlaWdodDogMTAwLjAlOyI+7JiI7LSIPC9kaXY+YClbMF07CiAgICAgICAgICAgIHBvcHVwXzRmOTY0ZTFjOGQ0ZTQxMTA5YmZlNTE4MjcwMzVjNjY4LnNldENvbnRlbnQoaHRtbF84ZGU1NzU5ZGNmY2I0MjA1OWRhMzIzMGU2ZmRlZTdhMCk7CiAgICAgICAgCgogICAgICAgIG1hcmtlcl8wN2NjNWJlMTk0M2Q0Y2RjOTdiYWVjZDFiNzU0MWY1OC5iaW5kUG9wdXAocG9wdXBfNGY5NjRlMWM4ZDRlNDExMDliZmU1MTgyNzAzNWM2NjgpCiAgICAgICAgOwoKICAgICAgICAKICAgIAogICAgCiAgICAgICAgICAgIHZhciBtYXJrZXJfYmQ0MzBkNDVjOGY2NDg0MzhiZDY2NTU3NTU0OWZjNzUgPSBMLm1hcmtlcigKICAgICAgICAgICAgICAgIFszMy45NTEzNCwgMTI2LjMyNzcxMDAwMDAwMDAxXSwKICAgICAgICAgICAgICAgIHt9CiAgICAgICAgICAgICkuYWRkVG8obWFya2VyX2NsdXN0ZXJfNjc4OTkzNWQ4OTgwNGRmOTkzZjRjOTRiMjUzYzQ0ZjgpOwogICAgICAgIAogICAgCiAgICAgICAgICAgIHZhciBpY29uXzE1ZTRlY2Y1NzgyNDRmZGViNjc0ODFhMzhiNTlmNDJlID0gTC5Bd2Vzb21lTWFya2Vycy5pY29uKAogICAgICAgICAgICAgICAgeyJleHRyYUNsYXNzZXMiOiAiZmEtcm90YXRlLTAiLCAiaWNvbiI6ICJzdGFyIiwgImljb25Db2xvciI6ICJ3aGl0ZSIsICJtYXJrZXJDb2xvciI6ICJibHVlIiwgInByZWZpeCI6ICJnbHlwaGljb24ifQogICAgICAgICAgICApOwogICAgICAgICAgICBtYXJrZXJfYmQ0MzBkNDVjOGY2NDg0MzhiZDY2NTU3NTU0OWZjNzUuc2V0SWNvbihpY29uXzE1ZTRlY2Y1NzgyNDRmZGViNjc0ODFhMzhiNTlmNDJlKTsKICAgICAgICAKICAgIAogICAgICAgIHZhciBwb3B1cF85NGIyZmQ0ZWY0YzQ0MjAzYmY3NDk3NmI5ZmJlNWY2NyA9IEwucG9wdXAoeyJtYXhXaWR0aCI6ICIxMDAlIn0pOwoKICAgICAgICAKICAgICAgICAgICAgdmFyIGh0bWxfYzUzZjk2NTJiYjIyNDc2NTk4OGU5MWY0Nzk3ZTY2YWEgPSAkKGA8ZGl2IGlkPSJodG1sX2M1M2Y5NjUyYmIyMjQ3NjU5ODhlOTFmNDc5N2U2NmFhIiBzdHlsZT0id2lkdGg6IDEwMC4wJTsgaGVpZ2h0OiAxMDAuMCU7Ij7rj4jrjIDsgrDsnoXqtaw8L2Rpdj5gKVswXTsKICAgICAgICAgICAgcG9wdXBfOTRiMmZkNGVmNGM0NDIwM2JmNzQ5NzZiOWZiZTVmNjcuc2V0Q29udGVudChodG1sX2M1M2Y5NjUyYmIyMjQ3NjU5ODhlOTFmNDc5N2U2NmFhKTsKICAgICAgICAKCiAgICAgICAgbWFya2VyX2JkNDMwZDQ1YzhmNjQ4NDM4YmQ2NjU1NzU1NDlmYzc1LmJpbmRQb3B1cChwb3B1cF85NGIyZmQ0ZWY0YzQ0MjAzYmY3NDk3NmI5ZmJlNWY2NykKICAgICAgICA7CgogICAgICAgIAogICAgCjwvc2NyaXB0Pg==" onload="this.contentDocument.open();this.contentDocument.write(atob(this.getAttribute('data-html')));this.contentDocument.close();" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen=""></iframe></div>
</div>



- 시외버스만 folium으로 확인해보기  

# 3. 상관관계(Correlation)  


```python
plt.figure(figsize=(16,7))
ax = plt.subplot(1,2,1)
plt.title("train", fontsize=15)
sns.heatmap(data = train[col_t + ["18~20_ride"]].corr(),
            annot=True,
            fmt = '.2f',
            linewidths=.5,
            cmap='coolwarm',
            vmin = -1, vmax = 1,
            ax=ax)
ax = plt.subplot(1,2,2)
plt.title("date_sum_", fontsize=15)
sns.heatmap(data = date_sum_.corr(),
            annot=True,
            fmt = '.2f',
            linewidths=.5,
            cmap='coolwarm',
            vmin = -1, vmax = 1,
            ax=ax)
plt.show()
```


![png](/assets/images/dacon/bus_in_out/eda_6.png)


- 데이터 자체가 일별, 시간대별, 버스노선별 승차인원 수에 대한 데이터이기 때문에 위에서 확인했던 것 처럼 대부분의 값이 0~1의 값이다.  
- 이 점을 고려해서 시간대를 통합(sum)해서 활용하거나, 노선 또는 일별의 파생변수를 생성하는 것도 중요할 것으로 보인다.  

# 정리      

**1. 파생변수**  

- 요일, 공휴일, 주말에 대한 파생변수 필요  
- 제주도는 많은 섬으로 이루어져 있으므로(특히 추자도), 고립된 정류장과 아닌 정류장을 구분할 필요가 있음  
- 노선별 정류장의 분포, 개별 user card id에 대한 OD matrix를 활용한 분석(network analysis)  
- 비대칭 데이터 처리 : 시간별 승하차 인원 수의 75%가 0~1값이며, 왜곡된 분포로 시간대별 병합 또는 스케일링이 필요함  

**2. 외부데이터 활용**  

- 기상데이터 : 비가 오는지 여부에 따른 버스이용률 차이  
- 인구통계학적 데이터 : 행정구역 단위, 실거주 인구 / 직장인구 , 연령대 등
- 개별 장소에 대한 위치정보 : 수요가 많을 것 같은 정류장(정류장 명에서 추출, 고등학교, 대학교, 환승 등등), 또는 주요 지점(like 랜드마크)과의 거리  
