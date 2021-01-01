---
title:  "[GIS] 공간 데이터 결합(Spatial Join)"
excerpt: "geopandas를 이용해서 공간데이터를 결합해보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/gis_logo.jpg

categories:
  - spatial_analysis

tags:
  - python
  - gis
  - qgis
  - 데이터 분석
  - 파이썬 독학
  - geopandas
  - 공간분석
  - 공간데이터
  - spatial analysis
  - geodataframe
  - sjoin
  - overlay
  - merge
  - within
  - intersects
  - contains
  - buffer
  - how
  - geometry


last_modified_at: 2020-12-29T19:00-19:30
---

# 개요  

![png](/assets/images/gis_logo.jpg){: .align-center}{: width="60%" height="60%"} 

이번 포스팅에서는 공간 데이터간의 결합에 대해서 배워보자.  
공간결합(spatial join)이란, 두 공간 데이터프레임을 결합(merge)하는데, key값이 아닌 위치정보에 따라 결합(overlay)해 주는 방식이다.  
예전에 포스팅했던 [Geopandas의 overlay함수](https://yganalyst.github.io/spatial_analysis/spatial_analysis_2/#overlay)과 [Pandas의 merge함수](https://yganalyst.github.io/data_handling/Pd_12/#2-%EB%8D%B0%EC%9D%B4%ED%84%B0%ED%94%84%EB%A0%88%EC%9E%84-%EB%B3%91%ED%95%A9--pdmerge) 두가지 모두 의미를 담고 있고 함수 자체는 `merge`함수와 거의 유사하다.

- `gpd.overlay` : 두 공간데이터의 위치정보(geometry)를 연산  
- `pd.merge` : 두 데이터프레임을 동일한 key값에 대하여 결합  

예제는 [이전 포스팅](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/)의 소방서 데이터와 도로명주소 전자지도의 서울특별시 법정동, 시군구 경계 데이터를 활용하자.  

서울시의 법정동, 시군구 경계 데이터는 [github](https://github.com/yganalyst/spatial_analysis/tree/master/data)에 올려두었다.  


- 법정동 경계 : Polygon  
- 시군구 경계 : Polygon  
- 소방서 위치 : Point  


```python
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point, Polygon, LineString
from fiona.crs import from_string
epsg4326 = from_string("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
epsg5179 = from_string("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")

seoul_bjd = gpd.GeoDataFrame.from_file('data/TL_SCCO_EMD.shp', encoding='cp949')
seoul_bjd.crs = epsg5179
seoul_sig = gpd.GeoDataFrame.from_file('data/TL_SCCO_SIG.shp', encoding='cp949')
seoul_sig.crs = epsg5179
pt_119 = pd.read_csv('data/서울시 안전센터관할 위치정보 (좌표계_ WGS1984).csv', encoding='cp949', dtype=str)
pt_119['경도'] = pt_119['경도'].astype(float)
pt_119['위도'] = pt_119['위도'].astype(float)
pt_119['geometry'] = pt_119.apply(lambda row : Point([row['경도'], row['위도']]), axis=1)
pt_119 = gpd.GeoDataFrame(pt_119, geometry='geometry', crs = epsg4326)
pt_119 = pt_119.to_crs(epsg5179)
```

  
<br/>
# 공간결합(gpd.sjoin)  

공간 결합은 Geopandas의 `sjoin`함수를 활용하며 입력값들은 다음과 같다.  

`gpd.sjoin(left_df, right_df, how='inner', op='intersects')`

- `left_df`, `right_df` : 결합할 두 공간데이터프레임 객체  
- `how` : 결합할 데이터 프레임의 기준(`left`, `right`, `inner`,`outer`)  
- `op` : 결합할 공간연산 방식(`within`, `intersects`, `contains`)

다른 것은 Pandas의 `merge`와 동일하지만 key값으로 매칭하던 `on` 대신 공간 결합을 위한 연산방법으로 `op`를 활용한다.  

3가지 방식을 제공하는데 내부에 있는지(`within`,`contains`), 교차하는지(`intersects`)로 사용할 수 있다.  
`within`과 `contain`은 [이전 포스팅](https://yganalyst.github.io/spatial_analysis/spatial_analysis_2/#within%EA%B3%BC-contain)에서도 설명했지만 동일한 연산이며 기준이 다를 뿐이다.  

`a.contains(b) == b.within(a)`로 표현할 수 있다.  


## Point와 Polygon 결합  

먼저 Point와 Polygon 객체를 담고 있는 두 공간데이터를 결합해보자.  



```python
result = gpd.sjoin(seoul_sig, pt_119, how='left', op="intersects")
result.head()
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
      <th>SIG_CD</th>
      <th>SIG_ENG_NM</th>
      <th>SIG_KOR_NM</th>
      <th>geometry</th>
      <th>index_right</th>
      <th>고유번호</th>
      <th>센터ID</th>
      <th>센터명</th>
      <th>위도</th>
      <th>경도</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>98</td>
      <td>92</td>
      <td>1103109</td>
      <td>숭인119안전센터</td>
      <td>37.575989</td>
      <td>127.013191</td>
    </tr>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>6</td>
      <td>6</td>
      <td>1103108</td>
      <td>종로119안전센터</td>
      <td>37.579479</td>
      <td>126.991009</td>
    </tr>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>5</td>
      <td>5</td>
      <td>1103104</td>
      <td>신교119안전센터</td>
      <td>37.580398</td>
      <td>126.964577</td>
    </tr>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>8</td>
      <td>8</td>
      <td>1103105</td>
      <td>연건119안전센터</td>
      <td>37.580569</td>
      <td>126.998178</td>
    </tr>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>7</td>
      <td>7</td>
      <td>1103102</td>
      <td>세종로119안전센터</td>
      <td>37.581958</td>
      <td>126.976747</td>
    </tr>
  </tbody>
</table>
</div>


결과는 **N(Polyogon) : 1(Point)** (시군구 별 포함된 소방안전센터들) 일 것이다. 결국 Point는 어떤 한 위치이기 때문에(교차한다는 의미가 없음), `op`의 어떤 공간연산 방법을 활용하나 동일하다.  
`sjoin`은 이렇게 Polygon에 포함된 Point객체들을 매칭하는 용도로 가장 많이 활용된다.  

그런데 여기서 주의할 점으로 `contain`과 `within`의 차이를 다시 설명하자면,  

```python
result_test = gpd.sjoin(seoul_sig, pt_119, how='left', op="within")
result_test.head()
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
      <th>SIG_CD</th>
      <th>SIG_ENG_NM</th>
      <th>SIG_KOR_NM</th>
      <th>geometry</th>
      <th>index_right</th>
      <th>고유번호</th>
      <th>센터ID</th>
      <th>센터명</th>
      <th>위도</th>
      <th>경도</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>11110</td>
      <td>Jongno-gu</td>
      <td>종로구</td>
      <td>POLYGON ((956615.4532424484 1953567.198968612,...</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1</th>
      <td>11140</td>
      <td>Jung-gu</td>
      <td>중구</td>
      <td>POLYGON ((957890.3856818088 1952616.745568171,...</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2</th>
      <td>11170</td>
      <td>Yongsan-gu</td>
      <td>용산구</td>
      <td>POLYGON ((953115.7610894071 1950834.083634671,...</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3</th>
      <td>11200</td>
      <td>Seongdong-gu</td>
      <td>성동구</td>
      <td>POLYGON ((959681.109391748 1952649.604797923, ...</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>4</th>
      <td>11215</td>
      <td>Gwangjin-gu</td>
      <td>광진구</td>
      <td>POLYGON ((964825.0579498123 1952633.249624572,...</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



`op='within'`으로 주면 매칭이 하나도 되지 않는다. 그 이유는 위에서 설명한 것처럼 기준이 다르기 때문인데, 아래와 같이 변경하면 된다.  

- `gpd.sjoin(pt_119, seoul_sig, how='left', op="within")` : 두 데이터의 위치를 바꾸거나  
- `gpd.sjoin(seoul_sig, pt_119, how='right', op="within")` : 기준을 바꾸거나  

크게 중요한 내용은 아니지만 정확히 알지 못하면 나중에 혼란이 될수도 있다.  

## Polygon과 Polygon 결합  

Polygon끼리도 결합방식은 동일하지만 주의해야할 경우를 얘기하려고 한다.  

Polygon자체가 이빨이 딱 안맞는 경우가 많아서, Polygon끼리 `sjoin`을 할때 포함(within, contains)여부나 교차하는지(intersects)를 정확하게 판단하기가 어렵다.  

서울시 시군구 경계와 법정동 경계를 결합한다고 했을때 포함(contains)되는 경우와 교차(intersects)되는 경우를 비교해보자. 시군구 경계에 법정동 경계를 공간결합 하였으며, 종로구(11110)만 필터링하여 결과를 시각화한 것이다.  

**1. 포함(contains)**


```python
result1 = gpd.sjoin(seoul_sig, seoul_bjd, how='left', op='contains')
bjd_list = result1[result1["SIG_KOR_NM"]=="종로구"]["EMD_CD"].tolist()

ax = seoul_sig[seoul_sig["SIG_CD"]=="11110"].boundary.plot(color='red')
seoul_bjd[seoul_bjd["EMD_CD"].str.startswith("11110")].plot(ax=ax,color='black', alpha=0.2)
seoul_bjd[seoul_bjd["EMD_CD"].isin(bjd_list)].plot(ax=ax)
plt.show()
```


![png](/assets/images/gis/sjoin/output_12_0.png)


**2. 교차(intersects)**  


```python
result2 = gpd.sjoin(seoul_sig, seoul_bjd, how='left', op='intersects')
bjd_list = result2[result2["SIG_KOR_NM"]=="종로구"]["EMD_CD"].tolist()

ax = seoul_sig[seoul_sig["SIG_CD"]=="11110"].boundary.plot(color='red')
seoul_bjd[seoul_bjd["EMD_CD"].str.startswith("11110")].plot(ax=ax,color='black', alpha=0.2)
seoul_bjd[seoul_bjd["EMD_CD"].isin(bjd_list)].plot(ax=ax)
plt.show()
```


![png](/assets/images/gis/sjoin/output_14_0.png)


- 빨강 : 종로구의 시군구 경계  
- 파랑 : 결합된 종로구의 법정동 경계  
- 회색 : 원래 종로구의 법정동 경계  

위 그림과 같이 종로구(Polygon) 내의 법정동(Polygon)을 공간결합을 통해 매칭하려고 했을때, 경계가 정확히 일치하지 않기 때문에 발생하는 오차들이다.  

> 즉, 이 경우는 공간결합이 아닌 시군구코드(SIG_CD)를 key값으로 merge하는 것이 적절하다.  

하지만 이 경우도 시군구경계에 buffer를 줘서 경계를 살짝 넓힌 다음 포함(contains) 결합을 통해 추출해낼 순 있다.   

**3. buffer를 통해 수정**

```python
seoul_sig["geometry"] = seoul_sig["geometry"].buffer(5)
result2 = gpd.sjoin(seoul_sig, seoul_bjd, how='left', op='contains')
bjd_list = result2[result2["SIG_KOR_NM"]=="종로구"]["EMD_CD"].tolist()

ax = seoul_sig[seoul_sig["SIG_CD"]=="11110"].boundary.plot(color='red')
seoul_bjd[seoul_bjd["EMD_CD"].str.startswith("11110")].plot(ax=ax,color='black', alpha=0.2)
seoul_bjd[seoul_bjd["EMD_CD"].isin(bjd_list)].plot(ax=ax)
plt.show()
```


![png](/assets/images/gis/sjoin/output_19_0.png)


이렇게 공간 정보 데이터는 단순히 값(value)만 확인하는 것이 아니라, 공간 객체(geometry)간의 관계와 오류를 세부적으로 파악할 수 있고 적절하게 변형하거나 조합해야 하는 경우가 많다.  
