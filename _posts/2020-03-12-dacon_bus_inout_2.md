---
title:  "[Dacon] 제주 퇴근시간 버스 승하차 인원 예측 2 - feature engineering"
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
  - feature engineering
  - 프로젝트
  - 데이콘
  - 제주도
  - 버스승하차
  - 예측
  - correlation
  - 상관관계
  - 파생변수
  - 머신러닝 프로젝트
  - dataset

last_modified_at: 2020-03-12T19:00-19:30
---

# 개요  

이번 포스팅에서는 지난 [EDA 포스팅](https://yganalyst.github.io/competition/dacon_bus_inout_1/)에 이어서 내부데이터와 외부데이터를 이용해서 여러가지 파생변수들을 생성하고, 기계학습이 가능한 형태로 Dataset을 구성해보기로 한다.  
  
   
   

# Feature engineering  


```python
import pandas as pd 
import numpy as np
import os 
import geopandas as gpd
import sys
from shapely.geometry import *
from shapely.ops import *
import warnings
warnings.filterwarnings(action='ignore')
from fiona.crs import from_string
epsg4326 = from_string("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
epsg5179 = from_string("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")

from tqdm import tqdm
from tqdm._tqdm_notebook import tqdm_notebook
tqdm_notebook.pandas()

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
    


```python
col_t = [str(j)+"~"+ str(j+1) + "_" + str(i) for i in ("ride","takeoff") for j in range(6,12)]
train['date_dt'] = pd.to_datetime(train['date'])
train[col_t + ['18~20_ride']] = train[col_t + ['18~20_ride']].astype(float)
test['date_dt'] = pd.to_datetime(test['date'])
test[col_t] = test[col_t].astype(float)
bus_bts['geton_datetime'] = pd.to_datetime(bus_bts['geton_date'] + ' ' + bus_bts['geton_time'])
bus_bts['getoff_datetime'] = pd.to_datetime(bus_bts['getoff_date'] + ' ' + bus_bts['getoff_time'])
bus_bts['user_category'] = bus_bts['user_category'].astype(int)
bus_bts['user_count'] = bus_bts['user_count'].astype(float)
```

# 파생변수 구성(내부데이터 활용)   

## 1. 시내, 시외 재구분  


```python
st_col = ['station_code','station_name','in_out','longitude','latitude']
station_loc = pd.concat([train[st_col], test[st_col]], ignore_index=True).drop_duplicates().reset_index(drop=True)
station_loc[['longitude','latitude']] = station_loc[['longitude','latitude']].astype(float)
station_loc['geometry'] = station_loc.apply(lambda x : Point(x.longitude, x.latitude), axis=1)
station_loc = gpd.GeoDataFrame(station_loc, geometry='geometry', crs=epsg4326)
station_loc = station_loc.to_crs(epsg5179)
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
      <td>POINT (906519.4860620159 1500237.409276767)</td>
    </tr>
    <tr>
      <td>1</td>
      <td>357</td>
      <td>한라병원</td>
      <td>시외</td>
      <td>126.48508</td>
      <td>33.48944</td>
      <td>POINT (905715.3864293153 1500194.228393832)</td>
    </tr>
    <tr>
      <td>2</td>
      <td>432</td>
      <td>정존마을</td>
      <td>시외</td>
      <td>126.47352</td>
      <td>33.48181</td>
      <td>POINT (904633.0709735792 1499358.804023984)</td>
    </tr>
    <tr>
      <td>3</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>시내</td>
      <td>126.49252</td>
      <td>33.50577</td>
      <td>POINT (906424.1528704709 1501998.097362769)</td>
    </tr>
    <tr>
      <td>4</td>
      <td>1646</td>
      <td>중문관광단지입구</td>
      <td>시내</td>
      <td>126.41260</td>
      <td>33.25579</td>
      <td>POINT (898711.3044004028 1474356.529871264)</td>
    </tr>
  </tbody>
</table>
</div>




```python
jeju_bjd = gpd.GeoDataFrame.from_file('LSMD_ADM_SECT_UMD_50.shp',encoding='cp949')
if jeju_bjd.crs is None:
    jeju_bjd.crs = epsg5179
```


```python
jeju_main = jeju_bjd.explode().unary_union
jeju_main = jeju_main[np.argmax([i.area for i in jeju_main])].buffer(10).buffer(-10)
#gpd.GeoDataFrame({'geometry':[jeju_main]}, geometry='geometry', crs=epsg5179).to_file("test.shp")
station_loc['in_out_new'] = np.where(station_loc.within(jeju_main), 
                                     1,
                                     0)
```


```python
station_loc['in_out_new'].value_counts()
```




    1    3546
    0      55
    Name: in_out_new, dtype: int64



- 기본으로 제공되는 시내, 시외 변수가 아닌 제주도 내륙(1)과 이외의 섬들에 위치한 정류장들(0)로 구분  

## 2. 요일 특성(요일별, 주말여부, 공휴일여부)    


```python
def get_dayattr(df):
    # 0(Monday) ~ 6(Sunday)
    df_t = df.copy()
    df_t['dayofweek'] = df_t['date_dt'].dt.dayofweek
    # 추석, 한글날, 개천절
    holiday=['2019-09-12', '2019-09-13', '2019-09-14','2019-10-03','2019-10-09']
    df_t['weekends'] = np.where(df_t['dayofweek'] >= 5, 1,0) # 주말여부
    df_t['holiday'] = np.where(df_t['date'].isin(holiday), 1,0) # 공휴일여부
    return df_t
```

  
  
## 3. 시간대 통합  


```python
def merged_time_col(df, interval=2):
    global col_t
    df_t = df.copy()
    split_n= 6 / interval
    n1 = 0 
    for i in list(map(list,np.array_split(col_t[:6],split_n))):
        n1+=1
        df_t['ride_' + str(n1)] = df_t[i].sum(axis=1)
    n2 = 0
    for i in list(map(list,np.array_split(col_t[6:],split_n))):
        n2+=1
        df_t['takeoff_' + str(n2)] = df_t[i].sum(axis=1)    
    return df_t
```

- 기존 1시간 단위 승하차 인원수를 2 또는 3시간 단위로 합쳐서 생성할 수 있도록 구성  

## 4. 버스통행시간(travel time)    


```python
delta_ = (bus_bts['getoff_datetime'] - bus_bts['geton_datetime'])
if delta_.dt.days.max() == 0:  
    bus_bts['travel_time'] = delta_.dt.seconds / 60 # minutes
```


```python
f_tr_time = bus_bts.groupby(['geton_date','bus_route_id','geton_station_code'])['travel_time'].mean().reset_index()
f_tr_time
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
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th>travel_time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>1</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115000</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>2</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115001</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>3</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115002</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>4</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115003</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>484381</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3074</td>
      <td>46.716667</td>
    </tr>
    <tr>
      <td>484382</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3081</td>
      <td>58.792157</td>
    </tr>
    <tr>
      <td>484383</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3372</td>
      <td>53.031667</td>
    </tr>
    <tr>
      <td>484384</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>431</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>484385</td>
      <td>2019-10-16</td>
      <td>8880000</td>
      <td>1579</td>
      <td>17.371429</td>
    </tr>
  </tbody>
</table>
<p>484386 rows × 4 columns</p>
</div>




```python
f_tr_time['travel_time'].isnull().sum()
```




    79775



  
  
## 5. 노선별, 정류소별 배차간격  

버스카드 정보 데이터(bus_bts)의 기록을 활용해서, 버스노선별 각 정류장에 도착하는 간격(interval)을 계산하고자 했다.  


```python
t_date = "2019-09-02"
test = bus_bts.copy()
test = test[(test['geton_date']==t_date)]
route_ls = test['bus_route_id'].unique().tolist()

import matplotlib.dates as mdates
plot_thresh_hold = 12
row_num = 4
col_num = plot_thresh_hold/row_num

route = route_ls[15]
i=0
plt.figure(figsize=(16,12))
test = test[test['bus_route_id']==route]
for station_ in test['geton_station_code'].unique().tolist():
    i+=1
    test1 = test[test['geton_station_code']==station_].\
            sort_values(by='geton_datetime').\
            reset_index(drop=True)
    ax = plt.subplot(row_num,col_num,i)
    plt.title("route : " + route + " - " + "station : " + str(station_))
    ax.plot(range(len(test1)), test1['geton_datetime'], "b.")
    ax.yaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
    plt.grid()
    if i == plot_thresh_hold:
        plt.tight_layout()
        plt.show()
        break
        
```


![png](/assets/images/dacon/bus_in_out/feat_1.png)


특정 날에 대한 버스 1개노선이 도착한 몇몇 정류장에 승차카드를 태그한 기록들은 위와 같다.  
기본 아이디어는 승차태그를 한 시간별로 sorting해서, 바로 이전에 태그한 시간과의 차이를 각각 계산하면 다음번에 버스는 몇분안에 다시 올까? 라는 생각으로 진행했다.  
아래는 샘플 test이다.  


```python
test1 = test[test['geton_station_code']=='2816'].\
        sort_values(by='geton_datetime').\
        reset_index(drop=True)
a = test1['geton_datetime'].diff().dt.seconds / 60
a = a.reset_index()

plt.figure(figsize=(9,5))
plt.title("time difference, before geton time", fontsize=15)
plt.plot(a['index'], a['geton_datetime'], "s-")
plt.axhline(y=120, color='r', linewidth=1)
plt.axhline(y=60, color='g', linewidth=1)
plt.axhline(y=3, color='r', linewidth=1)
plt.show()
```


![png](/assets/images/dacon/bus_in_out/feat_2.png)


**배차간격 계산 방식(rule)**  
- **일별, 노선별, 정류장별** 승차정보에 대하여 **승차시간 차이(이전 대비 다음 승차 시간의 차이)의 평균(또는 최소)** 값   
- 승차시간의 차이가 5분 이상 2시간 이하의 값들에 대해서만 계산(동일버스 승차, 특수한 스케줄을 가진 경우 제외)  
- ~결과 값 중 **일별 승차정보 count가 가장 많은 날짜**로 **최종 노선별 정류장별 배차간격 결정**~  
- 처음에 최대 1시간으로 했는데, 제주도에는 배차간격이 긴 버스(일명 공기수송)가 꽤 있어서 변경   
- max 2시간 잡고 결측은 999 표시  

> 즉 위 그래프에서 두 빨간선(0~120) 사이의 데이터의 평균값(또는 최소값) 계산을 통해 일별,버스노선별,정류소별 배차간격을 구하였다.  


```python
def get_bus_interval(gr):
    stat = gr.sort_values(by='geton_datetime')['geton_datetime'].diff().dt.seconds / 60
    stat = stat[(stat >= 5) & (stat <= 120)]
    dict_ = {
             'all_cnt':len(gr),
             'rule_cnt':len(stat),
             'min_interval_m' :stat.min(),
             'mean_interval_m':stat.mean()
            }
    return pd.Series(dict_)
```


```python
result_df = bus_bts.groupby(['geton_date','bus_route_id','geton_station_code']).progress_apply(lambda gr : get_bus_interval(gr))
# result_df.reset_index().to_csv(r'D:\dacon_project1\result\\' + "result_interval_5_120.csv", sep='|', index=False, encoding='cp949') 
# result_df = pd.read_csv(r'D:\dacon_project1\result\\' + "result_interval_5_120.csv", sep='|',dtype=str, encoding='cp949')
```


    HBox(children=(IntProgress(value=0, max=484386), HTML(value='')))


    
    


```python
result_df[result_df.columns[3:]] = result_df[result_df.columns[3:]].astype(float)
result_df.head()
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
      <th></th>
      <th></th>
      <th>all_cnt</th>
      <th>rule_cnt</th>
      <th>min_interval_m</th>
      <th>mean_interval_m</th>
    </tr>
    <tr>
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="5" valign="top">2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>5.0</td>
      <td>1.0</td>
      <td>51.066667</td>
      <td>51.066667</td>
    </tr>
    <tr>
      <td rowspan="4" valign="top">20010000</td>
      <td>6115000</td>
      <td>8.0</td>
      <td>3.0</td>
      <td>49.750000</td>
      <td>57.883333</td>
    </tr>
    <tr>
      <td>6115001</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>6115002</td>
      <td>4.0</td>
      <td>1.0</td>
      <td>59.816667</td>
      <td>59.816667</td>
    </tr>
    <tr>
      <td>6115003</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>




```python
result_df.isnull().sum()
```




    all_cnt                 0
    rule_cnt                0
    min_interval_m     288142
    mean_interval_m    288142
    dtype: int64




```python
result_df = result_df.fillna(999)
```

  
  
## 6. 시간대별 승차 인원 (bus_bts)  


```python
bus_bts['ride_slot'] = bus_bts['geton_datetime'].dt.hour.astype(str) + "~" + (bus_bts['geton_datetime'].dt.hour + 1).astype(str) + "_ride"
ride_slot_pv = pd.pivot_table(bus_bts,
                              index=['geton_date','bus_route_id', 'geton_station_code'],
                              columns='ride_slot',
                              values='user_count',
                              aggfunc=np.sum).reset_index().fillna(0)
ride_slot_pv = ride_slot_pv[['geton_date','bus_route_id','geton_station_code','6~7_ride','7~8_ride','8~9_ride','9~10_ride','10~11_ride','11~12_ride']]
ride_slot_pv['geton_date'] = pd.to_datetime(ride_slot_pv['geton_date'])
print(str(ride_slot_pv['geton_date'].min().date()) + " ~ " + str(ride_slot_pv['geton_date'].max().date()))
print("%s 건" % len(ride_slot_pv))
ride_slot_pv.head()
```

    2019-09-01 ~ 2019-10-16
    484386 건
    




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
      <th>ride_slot</th>
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th>6~7_ride</th>
      <th>7~8_ride</th>
      <th>8~9_ride</th>
      <th>9~10_ride</th>
      <th>10~11_ride</th>
      <th>11~12_ride</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>3.0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115000</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>6.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115001</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115002</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>4.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115003</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
    </tr>
  </tbody>
</table>
</div>



- bus_bts 데이터를 피벗해서 train, test셋과 동일하게 구성했을때, 값에 차이가 있음  
- train과 test의 버스카드 승차 정보가 전수 존재하는 것은 아닌 것으로 판단됨    
- 따라서 일별,버스노선별,정류소를 key로 변수를 구성할때 결측값이 존재  

## 7. 승객 유형별 승차 인원   


```python
user_dict_ = {
             1:'일반',
             2:'어린이',
             4:'청소년',
             6:'경로',
             27:'장애일반',
             28:'장애동반',
             29:'유공일반',
             30:'유공동반'
             }
cat_group = bus_bts.groupby(['geton_date','bus_route_id','geton_station_code','user_category'])['user_count'].sum().reset_index(name='sum_cnt')
```


```python
cat_group_pv = pd.pivot_table(cat_group,
                              values='sum_cnt',
                              index=['geton_date','bus_route_id','geton_station_code'],
                              columns='user_category',fill_value=0).rename(user_dict_, axis=1).\
                              reset_index()
cat_group_pv.head()
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
      <th>user_category</th>
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th>일반</th>
      <th>어린이</th>
      <th>청소년</th>
      <th>경로</th>
      <th>장애일반</th>
      <th>장애동반</th>
      <th>유공일반</th>
      <th>유공동반</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>5</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115000</td>
      <td>6</td>
      <td>0</td>
      <td>0</td>
      <td>4</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115001</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115002</td>
      <td>1</td>
      <td>0</td>
      <td>3</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115003</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>



- 일별, 노선별, 승차 정류소별, 승객 유형별(cols) 승차인원수    

# 외부 데이터(날씨) 활용  

기상청 날씨데이터는 제주도의 4개 측정소(제주, 고산, 성산, 서귀포)를 기준으로 기상을 관측한다.  
따라서 각 버스정류소와 관측소의 좌표정보를 활용하여, 정류소와 가장 가까운 관측소의 기상정보를 대입시켰다.  
그리고 시간대는 오전과 오후로만 구분하여 기상정보의 평균값을 활용했다.  


```python
weather = pd.read_csv('weather.csv', encoding='cp949', dtype=str)
weather_t = weather[['지점','일시','기온(°C)','강수량(mm)','풍속(m/s)','습도(%)','지면온도(°C)']].copy()
weather_t['일시'] = pd.to_datetime(weather_t['일시'])
weather_t[weather_t.columns[2:]] = weather_t[weather_t.columns[2:]].astype(float)
```


```python
weather_t['지점'].unique()
```




    array(['184', '185', '188', '189'], dtype=object)




```python
loc_df = pd.DataFrame([['184', '제주', 126.52969, 33.51411],
                       ['185', '고산', 126.16283, 33.29382],
                       ['188', '성산' , 126.8802 , 33.38677],
                       ['189', '서귀포', 126.5653, 33.24616]],
                      columns=['지점','지점명','lng','lat'])
loc_df['geometry'] = loc_df.apply(lambda row : Point(row.lng,row.lat), axis=1)
loc_df = gpd.GeoDataFrame(loc_df, geometry='geometry', crs=epsg4326)
loc_df = loc_df.to_crs(epsg5179)
loc_df
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
      <th>지점</th>
      <th>지점명</th>
      <th>lng</th>
      <th>lat</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>184</td>
      <td>제주</td>
      <td>126.52969</td>
      <td>33.51411</td>
      <td>POINT (909885.3220605524 1502889.901162671)</td>
    </tr>
    <tr>
      <td>1</td>
      <td>185</td>
      <td>고산</td>
      <td>126.16283</td>
      <td>33.29382</td>
      <td>POINT (875498.2929588766 1478843.189456649)</td>
    </tr>
    <tr>
      <td>2</td>
      <td>188</td>
      <td>성산</td>
      <td>126.88020</td>
      <td>33.38677</td>
      <td>POINT (942354.3571456469 1488522.195599749)</td>
    </tr>
    <tr>
      <td>3</td>
      <td>189</td>
      <td>서귀포</td>
      <td>126.56530</td>
      <td>33.24616</td>
      <td>POINT (912925.9395493728 1473151.188443196)</td>
    </tr>
  </tbody>
</table>
</div>




```python
weather_t['지점'] = weather_t['지점'].replace(loc_df.set_index('지점').to_dict()['지점명'])
weather_t['cat'] = np.where(weather_t['일시'].dt.hour <= 12, "오전", "오후")
weather_t['date'] = weather_t['일시'].dt.date.astype(str)
weather_t
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
      <th>지점</th>
      <th>일시</th>
      <th>기온(°C)</th>
      <th>강수량(mm)</th>
      <th>풍속(m/s)</th>
      <th>습도(%)</th>
      <th>지면온도(°C)</th>
      <th>cat</th>
      <th>date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>제주</td>
      <td>2019-09-01 00:00:00</td>
      <td>23.7</td>
      <td>NaN</td>
      <td>2.0</td>
      <td>67.0</td>
      <td>23.1</td>
      <td>오전</td>
      <td>2019-09-01</td>
    </tr>
    <tr>
      <td>1</td>
      <td>제주</td>
      <td>2019-09-01 01:00:00</td>
      <td>23.7</td>
      <td>NaN</td>
      <td>2.1</td>
      <td>67.0</td>
      <td>23.0</td>
      <td>오전</td>
      <td>2019-09-01</td>
    </tr>
    <tr>
      <td>2</td>
      <td>제주</td>
      <td>2019-09-01 02:00:00</td>
      <td>23.5</td>
      <td>NaN</td>
      <td>1.4</td>
      <td>70.0</td>
      <td>22.9</td>
      <td>오전</td>
      <td>2019-09-01</td>
    </tr>
    <tr>
      <td>3</td>
      <td>제주</td>
      <td>2019-09-01 03:00:00</td>
      <td>23.4</td>
      <td>NaN</td>
      <td>1.1</td>
      <td>68.0</td>
      <td>22.6</td>
      <td>오전</td>
      <td>2019-09-01</td>
    </tr>
    <tr>
      <td>4</td>
      <td>제주</td>
      <td>2019-09-01 04:00:00</td>
      <td>23.4</td>
      <td>NaN</td>
      <td>1.6</td>
      <td>69.0</td>
      <td>22.6</td>
      <td>오전</td>
      <td>2019-09-01</td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>5759</td>
      <td>서귀포</td>
      <td>2019-10-30 20:00:00</td>
      <td>16.4</td>
      <td>NaN</td>
      <td>1.5</td>
      <td>77.0</td>
      <td>14.1</td>
      <td>오후</td>
      <td>2019-10-30</td>
    </tr>
    <tr>
      <td>5760</td>
      <td>서귀포</td>
      <td>2019-10-30 21:00:00</td>
      <td>16.2</td>
      <td>NaN</td>
      <td>1.3</td>
      <td>80.0</td>
      <td>13.3</td>
      <td>오후</td>
      <td>2019-10-30</td>
    </tr>
    <tr>
      <td>5761</td>
      <td>서귀포</td>
      <td>2019-10-30 22:00:00</td>
      <td>15.6</td>
      <td>NaN</td>
      <td>1.6</td>
      <td>82.0</td>
      <td>13.3</td>
      <td>오후</td>
      <td>2019-10-30</td>
    </tr>
    <tr>
      <td>5762</td>
      <td>서귀포</td>
      <td>2019-10-30 23:00:00</td>
      <td>15.3</td>
      <td>NaN</td>
      <td>1.3</td>
      <td>84.0</td>
      <td>12.6</td>
      <td>오후</td>
      <td>2019-10-30</td>
    </tr>
    <tr>
      <td>5763</td>
      <td>서귀포</td>
      <td>2019-10-31 00:00:00</td>
      <td>15.0</td>
      <td>NaN</td>
      <td>1.5</td>
      <td>84.0</td>
      <td>12.8</td>
      <td>오전</td>
      <td>2019-10-31</td>
    </tr>
  </tbody>
</table>
<p>5764 rows × 9 columns</p>
</div>




```python
weather_gr = weather_t.groupby(['지점','date','cat']).mean().reset_index()
weather_pv = pd.pivot_table(weather_gr,
                          index=['지점','date'],
                          columns='cat',
                          values=['기온(°C)','강수량(mm)', '풍속(m/s)', '습도(%)', '지면온도(°C)']).reset_index().fillna(0)
weather_pv.columns = ['지점명','date',
                      '강수_mn','강수_ev',
                      '기온_mn','기온_ev',
                      '습도_mn','습도_ev',
                      '지면온도_mn','지면온도_ev',
                      '풍속_mn','풍속_ev']
weather_pv.head()
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
      <th>지점명</th>
      <th>date</th>
      <th>강수_mn</th>
      <th>강수_ev</th>
      <th>기온_mn</th>
      <th>기온_ev</th>
      <th>습도_mn</th>
      <th>습도_ev</th>
      <th>지면온도_mn</th>
      <th>지면온도_ev</th>
      <th>풍속_mn</th>
      <th>풍속_ev</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>고산</td>
      <td>2019-09-01</td>
      <td>0.000000</td>
      <td>0.800000</td>
      <td>23.400000</td>
      <td>22.018182</td>
      <td>79.230769</td>
      <td>90.727273</td>
      <td>23.915385</td>
      <td>24.454545</td>
      <td>2.307692</td>
      <td>2.972727</td>
    </tr>
    <tr>
      <td>1</td>
      <td>고산</td>
      <td>2019-09-02</td>
      <td>6.600000</td>
      <td>0.700000</td>
      <td>23.284615</td>
      <td>26.145455</td>
      <td>96.769231</td>
      <td>95.545455</td>
      <td>23.900000</td>
      <td>27.881818</td>
      <td>3.715385</td>
      <td>3.745455</td>
    </tr>
    <tr>
      <td>2</td>
      <td>고산</td>
      <td>2019-09-03</td>
      <td>3.462500</td>
      <td>3.866667</td>
      <td>24.007692</td>
      <td>25.254545</td>
      <td>99.461538</td>
      <td>98.272727</td>
      <td>25.023077</td>
      <td>26.700000</td>
      <td>3.492308</td>
      <td>2.736364</td>
    </tr>
    <tr>
      <td>3</td>
      <td>고산</td>
      <td>2019-09-04</td>
      <td>9.585714</td>
      <td>0.266667</td>
      <td>24.169231</td>
      <td>24.463636</td>
      <td>99.461538</td>
      <td>91.636364</td>
      <td>24.346154</td>
      <td>24.436364</td>
      <td>4.507692</td>
      <td>4.936364</td>
    </tr>
    <tr>
      <td>4</td>
      <td>고산</td>
      <td>2019-09-05</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>25.746154</td>
      <td>27.136364</td>
      <td>95.230769</td>
      <td>91.909091</td>
      <td>25.092308</td>
      <td>28.345455</td>
      <td>4.584615</td>
      <td>4.690909</td>
    </tr>
  </tbody>
</table>
</div>




```python
tt_ = pd.DataFrame()
loc_ = ['제주','고산','성산','서귀포']
for i in range(len(loc_)):
    sr = station_loc.distance(loc_df.geometry[i]).T
    sr.name = loc_[i]
    tt_ = tt_.append(sr)
tt_ = tt_.T
station_loc['지점명'] = tt_.idxmin(axis=1)
station_loc['loc_distance'] = tt_.min(axis=1)
```


```python
station_loc.head()
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
      <th>station_code</th>
      <th>station_name</th>
      <th>in_out</th>
      <th>longitude</th>
      <th>latitude</th>
      <th>geometry</th>
      <th>in_out_new</th>
      <th>지점명</th>
      <th>loc_distance</th>
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
      <td>POINT (906519.4860620159 1500237.409276767)</td>
      <td>1</td>
      <td>제주</td>
      <td>4285.389734</td>
    </tr>
    <tr>
      <td>1</td>
      <td>357</td>
      <td>한라병원</td>
      <td>시외</td>
      <td>126.48508</td>
      <td>33.48944</td>
      <td>POINT (905715.3864293153 1500194.228393832)</td>
      <td>1</td>
      <td>제주</td>
      <td>4965.381641</td>
    </tr>
    <tr>
      <td>2</td>
      <td>432</td>
      <td>정존마을</td>
      <td>시외</td>
      <td>126.47352</td>
      <td>33.48181</td>
      <td>POINT (904633.0709735792 1499358.804023984)</td>
      <td>1</td>
      <td>제주</td>
      <td>6328.885248</td>
    </tr>
    <tr>
      <td>3</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>시내</td>
      <td>126.49252</td>
      <td>33.50577</td>
      <td>POINT (906424.1528704709 1501998.097362769)</td>
      <td>1</td>
      <td>제주</td>
      <td>3574.214065</td>
    </tr>
    <tr>
      <td>4</td>
      <td>1646</td>
      <td>중문관광단지입구</td>
      <td>시내</td>
      <td>126.41260</td>
      <td>33.25579</td>
      <td>POINT (898711.3044004028 1474356.529871264)</td>
      <td>1</td>
      <td>서귀포</td>
      <td>14265.647562</td>
    </tr>
  </tbody>
</table>
</div>



# 정리  

**1. 내부데이터**  

- 시내, 시외 재구분  
- 요일특성(요일별, 주말여부, 공휴일 여부)  
- 시간대 통합  
- 평균 버스통행시간(하차시간 - 승차시간)  
-  배차간격  
- 승객유형별 승차인원  
 
**2. 외부데이터**  

- 가까운 날씨 측정소 및 거리    
- 평균 강수량, 기온, 습도, 지면온도, 풍속 (오전 오후 각각)  

## view  

- 시내, 시외 재구분  
- 요일특성(요일별, 주말여부, 공휴일 여부)  
- 시간대 통합  


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
      <th>10~11_ride</th>
      <th>11~12_ride</th>
      <th>6~7_takeoff</th>
      <th>7~8_takeoff</th>
      <th>8~9_takeoff</th>
      <th>9~10_takeoff</th>
      <th>10~11_takeoff</th>
      <th>11~12_takeoff</th>
      <th>18~20_ride</th>
      <th>date_dt</th>
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
      <td>2.0</td>
      <td>6.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2019-09-01</td>
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
      <td>5.0</td>
      <td>6.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>5.0</td>
      <td>2019-09-01</td>
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
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>2019-09-01</td>
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
      <td>14.0</td>
      <td>16.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>53.0</td>
      <td>2019-09-01</td>
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
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2019-09-01</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 22 columns</p>
</div>



- 평균 버스통행시간(하차시간 - 승차시간)  


```python
f_tr_time.tail()
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
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th>travel_time</th>
      <th>key1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>484381</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3074</td>
      <td>46.716667</td>
      <td>2019-10-16_8180000_3074</td>
    </tr>
    <tr>
      <td>484382</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3081</td>
      <td>58.792157</td>
      <td>2019-10-16_8180000_3081</td>
    </tr>
    <tr>
      <td>484383</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>3372</td>
      <td>53.031667</td>
      <td>2019-10-16_8180000_3372</td>
    </tr>
    <tr>
      <td>484384</td>
      <td>2019-10-16</td>
      <td>8180000</td>
      <td>431</td>
      <td>NaN</td>
      <td>2019-10-16_8180000_431</td>
    </tr>
    <tr>
      <td>484385</td>
      <td>2019-10-16</td>
      <td>8880000</td>
      <td>1579</td>
      <td>17.371429</td>
      <td>2019-10-16_8880000_1579</td>
    </tr>
  </tbody>
</table>
</div>



- 배차간격  


```python
result_df.head()
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
      <th></th>
      <th></th>
      <th>all_cnt</th>
      <th>rule_cnt</th>
      <th>min_interval_m</th>
      <th>mean_interval_m</th>
    </tr>
    <tr>
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="5" valign="top">2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>5.0</td>
      <td>1.0</td>
      <td>51.066667</td>
      <td>51.066667</td>
    </tr>
    <tr>
      <td rowspan="4" valign="top">20010000</td>
      <td>6115000</td>
      <td>8.0</td>
      <td>3.0</td>
      <td>49.750000</td>
      <td>57.883333</td>
    </tr>
    <tr>
      <td>6115001</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>999.000000</td>
      <td>999.000000</td>
    </tr>
    <tr>
      <td>6115002</td>
      <td>4.0</td>
      <td>1.0</td>
      <td>59.816667</td>
      <td>59.816667</td>
    </tr>
    <tr>
      <td>6115003</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>999.000000</td>
      <td>999.000000</td>
    </tr>
  </tbody>
</table>
</div>



- 승객유형별 승차인원  


```python
cat_group_pv.head()
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
      <th>user_category</th>
      <th>geton_date</th>
      <th>bus_route_id</th>
      <th>geton_station_code</th>
      <th>일반</th>
      <th>어린이</th>
      <th>청소년</th>
      <th>경로</th>
      <th>장애일반</th>
      <th>장애동반</th>
      <th>유공일반</th>
      <th>유공동반</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>2019-09-01</td>
      <td>17010000</td>
      <td>6000027</td>
      <td>5</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115000</td>
      <td>6</td>
      <td>0</td>
      <td>0</td>
      <td>4</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115001</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115002</td>
      <td>1</td>
      <td>0</td>
      <td>3</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>2019-09-01</td>
      <td>20010000</td>
      <td>6115003</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>



- 가까운 날씨 측정소 및 거리  


```python
station_loc.head()
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
      <th>station_code</th>
      <th>station_name</th>
      <th>in_out</th>
      <th>longitude</th>
      <th>latitude</th>
      <th>geometry</th>
      <th>in_out_new</th>
      <th>지점명</th>
      <th>loc_distance</th>
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
      <td>POINT (906519.4860620159 1500237.409276767)</td>
      <td>1</td>
      <td>제주</td>
      <td>4285.389734</td>
    </tr>
    <tr>
      <td>1</td>
      <td>357</td>
      <td>한라병원</td>
      <td>시외</td>
      <td>126.48508</td>
      <td>33.48944</td>
      <td>POINT (905715.3864293153 1500194.228393832)</td>
      <td>1</td>
      <td>제주</td>
      <td>4965.381641</td>
    </tr>
    <tr>
      <td>2</td>
      <td>432</td>
      <td>정존마을</td>
      <td>시외</td>
      <td>126.47352</td>
      <td>33.48181</td>
      <td>POINT (904633.0709735792 1499358.804023984)</td>
      <td>1</td>
      <td>제주</td>
      <td>6328.885248</td>
    </tr>
    <tr>
      <td>3</td>
      <td>1579</td>
      <td>제주국제공항(600번)</td>
      <td>시내</td>
      <td>126.49252</td>
      <td>33.50577</td>
      <td>POINT (906424.1528704709 1501998.097362769)</td>
      <td>1</td>
      <td>제주</td>
      <td>3574.214065</td>
    </tr>
    <tr>
      <td>4</td>
      <td>1646</td>
      <td>중문관광단지입구</td>
      <td>시내</td>
      <td>126.41260</td>
      <td>33.25579</td>
      <td>POINT (898711.3044004028 1474356.529871264)</td>
      <td>1</td>
      <td>서귀포</td>
      <td>14265.647562</td>
    </tr>
  </tbody>
</table>
</div>



- 평균 강수량, 기온, 습도, 지면온도, 풍속 (오전 오후 각각)  


```python
weather_pv.head()
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
      <th>지점명</th>
      <th>date</th>
      <th>강수_mn</th>
      <th>강수_ev</th>
      <th>기온_mn</th>
      <th>기온_ev</th>
      <th>습도_mn</th>
      <th>습도_ev</th>
      <th>지면온도_mn</th>
      <th>지면온도_ev</th>
      <th>풍속_mn</th>
      <th>풍속_ev</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>고산</td>
      <td>2019-09-01</td>
      <td>0.000000</td>
      <td>0.800000</td>
      <td>23.400000</td>
      <td>22.018182</td>
      <td>79.230769</td>
      <td>90.727273</td>
      <td>23.915385</td>
      <td>24.454545</td>
      <td>2.307692</td>
      <td>2.972727</td>
    </tr>
    <tr>
      <td>1</td>
      <td>고산</td>
      <td>2019-09-02</td>
      <td>6.600000</td>
      <td>0.700000</td>
      <td>23.284615</td>
      <td>26.145455</td>
      <td>96.769231</td>
      <td>95.545455</td>
      <td>23.900000</td>
      <td>27.881818</td>
      <td>3.715385</td>
      <td>3.745455</td>
    </tr>
    <tr>
      <td>2</td>
      <td>고산</td>
      <td>2019-09-03</td>
      <td>3.462500</td>
      <td>3.866667</td>
      <td>24.007692</td>
      <td>25.254545</td>
      <td>99.461538</td>
      <td>98.272727</td>
      <td>25.023077</td>
      <td>26.700000</td>
      <td>3.492308</td>
      <td>2.736364</td>
    </tr>
    <tr>
      <td>3</td>
      <td>고산</td>
      <td>2019-09-04</td>
      <td>9.585714</td>
      <td>0.266667</td>
      <td>24.169231</td>
      <td>24.463636</td>
      <td>99.461538</td>
      <td>91.636364</td>
      <td>24.346154</td>
      <td>24.436364</td>
      <td>4.507692</td>
      <td>4.936364</td>
    </tr>
    <tr>
      <td>4</td>
      <td>고산</td>
      <td>2019-09-05</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>25.746154</td>
      <td>27.136364</td>
      <td>95.230769</td>
      <td>91.909091</td>
      <td>25.092308</td>
      <td>28.345455</td>
      <td>4.584615</td>
      <td>4.690909</td>
    </tr>
  </tbody>
</table>
</div>



---

## 최종 train & test dataset 생성  


```python
train = pd.read_csv("train.csv", dtype=str, encoding='utf-8')
test = pd.read_csv("test.csv", dtype=str, encoding='utf-8')
col_t = [str(j)+"~"+ str(j+1) + "_" + str(i) for i in ("ride","takeoff") for j in range(6,12)]
train['date_dt'] = pd.to_datetime(train['date'])
train[col_t + ['18~20_ride']] = train[col_t + ['18~20_ride']].astype(float)
test['date_dt'] = pd.to_datetime(test['date'])
test[col_t] = test[col_t].astype(float)
bus_bts['geton_datetime'] = pd.to_datetime(bus_bts['geton_date'] + ' ' + bus_bts['geton_time'])
bus_bts['getoff_datetime'] = pd.to_datetime(bus_bts['getoff_date'] + ' ' + bus_bts['getoff_time'])
bus_bts['user_category'] = bus_bts['user_category'].astype(int)
bus_bts['user_count'] = bus_bts['user_count'].astype(float)
```


```python
set_col = ['date','bus_route_id','station_code']
bus_bts_col = ['geton_date','bus_route_id','geton_station_code']
df_dict_ = {'train':train,
           'test':test}
f_tr_time['key1'] = f_tr_time[bus_bts_col].apply(lambda row : "_".join(row), axis=1)
result_df['key1'] = result_df[bus_bts_col].apply(lambda row : "_".join(row), axis=1)
cat_group_pv['key1'] = cat_group_pv[bus_bts_col].apply(lambda row : "_".join(row), axis=1)

for k_ in df_dict_:
    # 요일
    df_dict_[k_] = get_dayattr(df_dict_[k_])
    # 시간대 통합
    df_dict_[k_] = merged_time_col(df_dict_[k_], interval=3)
    
    # merging key1
    df_dict_[k_]['key1'] = df_dict_[k_][set_col].apply(lambda row : "_".join(row), axis=1)
    
    # bus station 정보
    df_dict_[k_] = df_dict_[k_].merge(f_tr_time[['key1','travel_time']], how='left', on='key1')
    df_dict_[k_] = df_dict_[k_].merge(result_df[['key1','all_cnt','rule_cnt','min_interval_m','mean_interval_m']],
                                      how='left', on='key1')
    df_dict_[k_] = df_dict_[k_].merge(cat_group_pv[['key1','일반','어린이','청소년','경로','장애일반','장애동반','유공일반','유공동반']],
                                      how='left', on='key1')
    df_dict_[k_] = df_dict_[k_].merge(station_loc[['station_code','in_out_new','지점명','loc_distance']],
                                      how='left', on='station_code')
    df_dict_[k_] = df_dict_[k_].merge(weather_pv.rename({'날짜':'date'},axis=1),
                                      how='left', on=['지점명','date'])

    # 결측값 대체
    replace_method = 'median'
    ## key2(일별&노선별)
    if not all(df_dict_[k_].isnull().sum() == 0):
        for nan_col_ in df_dict_[k_].columns[df_dict_[k_].isna().any()].tolist():
            replace_nan = df_dict_[k_].groupby(set_col[:2])[nan_col_].transform(replace_method)
            df_dict_[k_][nan_col_] = np.where(df_dict_[k_][nan_col_].isnull(), replace_nan, df_dict_[k_][nan_col_])

    ## key3(일별)
    if not all(df_dict_[k_].isnull().sum() == 0):
        for nan_col_ in df_dict_[k_].columns[df_dict_[k_].isna().any()].tolist():
            replace_nan = df_dict_[k_].groupby(set_col[:1])[nan_col_].transform(replace_method)
            df_dict_[k_][nan_col_] = np.where(df_dict_[k_][nan_col_].isnull(), replace_nan, df_dict_[k_][nan_col_])
    
    df_dict_[k_].to_csv("../result/" + k_ + "_r_set.csv", sep='|', encoding='cp949', index=False)
    print("** " + k_ + " **" + " : " + str(len(df_dict_[k_])))
    print(df_dict_[k_].isnull().sum(), '\n')
```

    ** train ** : 415423
    id                 0
    date               0
    bus_route_id       0
    in_out             0
    station_code       0
    station_name       0
    latitude           0
    longitude          0
    6~7_ride           0
    7~8_ride           0
    8~9_ride           0
    9~10_ride          0
    10~11_ride         0
    11~12_ride         0
    6~7_takeoff        0
    7~8_takeoff        0
    8~9_takeoff        0
    9~10_takeoff       0
    10~11_takeoff      0
    11~12_takeoff      0
    18~20_ride         0
    date_dt            0
    dayofweek          0
    weekends           0
    holiday            0
    ride_1             0
    ride_2             0
    takeoff_1          0
    takeoff_2          0
    key1               0
    travel_time        0
    all_cnt            0
    rule_cnt           0
    min_interval_m     0
    mean_interval_m    0
    일반                 0
    어린이                0
    청소년                0
    경로                 0
    장애일반               0
    장애동반               0
    유공일반               0
    유공동반               0
    in_out_new         0
    지점명                0
    loc_distance       0
    강수_mn              0
    강수_ev              0
    기온_mn              0
    기온_ev              0
    습도_mn              0
    습도_ev              0
    지면온도_mn            0
    지면온도_ev            0
    풍속_mn              0
    풍속_ev              0
    dtype: int64 
    
    ** test ** : 228170
    id                 0
    date               0
    bus_route_id       0
    in_out             0
    station_code       0
    station_name       0
    latitude           0
    longitude          0
    6~7_ride           0
    7~8_ride           0
    8~9_ride           0
    9~10_ride          0
    10~11_ride         0
    11~12_ride         0
    6~7_takeoff        0
    7~8_takeoff        0
    8~9_takeoff        0
    9~10_takeoff       0
    10~11_takeoff      0
    11~12_takeoff      0
    date_dt            0
    dayofweek          0
    weekends           0
    holiday            0
    ride_1             0
    ride_2             0
    takeoff_1          0
    takeoff_2          0
    key1               0
    travel_time        0
    all_cnt            0
    rule_cnt           0
    min_interval_m     0
    mean_interval_m    0
    일반                 0
    어린이                0
    청소년                0
    경로                 0
    장애일반               0
    장애동반               0
    유공일반               0
    유공동반               0
    in_out_new         0
    지점명                0
    loc_distance       0
    강수_mn              0
    강수_ev              0
    기온_mn              0
    기온_ev              0
    습도_mn              0
    습도_ev              0
    지면온도_mn            0
    지면온도_ev            0
    풍속_mn              0
    풍속_ev              0
    dtype: int64 
    
    

- 위 소스코드를 보면 생성했던 변수들을 key(일별,버스노선별,정류소별)로 1차적으로 merge하고, 결측치에 대해서는 key2(일별,버스노선별), key3(일별) 순으로 카테고리를 감소시키며 median 값으로 대체해 주었다.  


```python
import matplotlib
matplotlib.rcParams['axes.unicode_minus'] = False
plt.figure(figsize=(20,20))
plt.title("Correlation", fontsize=15)
sns.heatmap(data = df_dict_['train'].corr(),
            annot=True,
            fmt = '.2f', linewidths=.5, cmap='coolwarm',
           vmin = -1, vmax = 1, center = 0)
plt.show()
```


![png](/assets/images/dacon/bus_in_out/feat_3.png)

