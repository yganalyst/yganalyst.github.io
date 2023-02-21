---
title:  "[GIS] 도로 네트워크 데이터를 활용한 도시의 공간단위 분할"
excerpt: "서울시 도로 네트워크를 활용하여 도시의 공간단위 분할을 통해 공간 데이터 분석에 유용한 집계공간을 생성해보자."
toc: true
toc_sticky: true
header:
  teaser: /assets/images/gis/road_area/road_area_logo.png

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
  - buffer
  - road network
  - 도로명주소 전자지도
  - 도로 네트워크
  - 도로망
  - linemerge
  - topology
  - topological error
  - 도로 위계
  - 도로폭
  - undershoot
  - line crossing
  - node
  - link
  - edge
  - cap_style
  - join_style
  - linestring
  - multilinestring
  - explode
  - 



last_modified_at: 2022-11-02T20:00-21:00
---

# 개요  

![png](/assets/images/gis/road_area/road_area_logo.png){: .align-center}{: width="80%" height="80%"}  

이번 포스팅은 **도로 네트워크를 기반으로 도시의 공간 단위를 분할**하는 과정을 다룬다.  
위 그림과 같이 도로에 의해 분할된 공간 단위들을 도출하는 방법 뿐 아니라, 진행 중 겪었던 **시행착오**들도 포함되어 있다.  
도로 네트워크를 전처리하는 것처럼 공간 데이터를 처리하는 작업은 빈번하게 발생하는 것에 비해, 정리되어 있는 자료가 많지 않아서 어려움을 겪었다. 누군가 나와 비슷한 task를 하게 된다면, 조금이라도 방황하는 시간을 줄이고 도움이 되길 바라는 마음으로 글을 적는다.  
  
작업 전반에 대한 source code는 [github](https://github.com/yganalyst/spatial_analysis/blob/master/road_network_spatial_area.ipynb)에서 볼 수 있으며, [최종 결과물](https://github.com/yganalyst/spatial_analysis/tree/master/result)도 올려놓았다.  

## Why??  

> 행정구역보다 작으면서 도시 구조를 반영할 수 있는 공간 단위를 만들고 싶다.    

위치 기반의 공간 데이터를 다루다 보면 특정한 **공간 단위로 집계(aggregate)할 필요성**을 자주 느낀다. 특히 GPS나 trajactory와 같은 low level의 raw 데이터는 그 자체보다, **공간 단위로 집계할 때 가시적인 통계 값을 도출할 수 있는 경우가 많다.**  
예를 들어, 승객의 택시 호출 위치 좌표를 특정 공간 단위(Grid, 행정구역 등)로 집계하여 **택시 수요를 시각화**하거나, 교통 사고 위치 정보를 기반으로 **사고 다발 지역을 분석**할 수 있다.  
  
이러한 공간 단위는 주어진 **행정구역(동단위, 집계구단위 등)**나 **grid(Hexagonal grid 등)**를 사용할 수 있지만, 연구를 하다보니 **공간 단위가 너무 크거나, 도시 구조를 반영하기 어려운 한계**를 느꼈었다.  
그래서 생각해본 것이 **도로 네트워크에 따라 분할을 해보자는 것(즉, 블록 단위)**이였다. **도시는 결국 접근성에 따라 상권이 형성되고, 이 접근성은 도로 구조에 영향을 받기 때문**이다.  


## 도로 네트워크 데이터  

도로 네트워크는 다양한 기관에서 제공하고 있다. 여기서는 [도로명주소 전자지도 DB](https://business.juso.go.kr/addrlink/elctrnMapProvd/geoDBDwldList.do#this)를 사용하였다. 해당 링크로 들어가 아래와 좌측 탭의 도로명주소 전자지도를 클릭하여 신청하면, 1시간 내외로 승인받아 사용할 수 있다.  
도로명주소 전자지도는 행정경계, 도로, 건물 등 총 11개의 공간 정보를 포함하고 있으며, 월 단위로 최신정보를 제공해준다(일변동 자료도 추가제공).  

![png](/assets/images/gis/road_area/mapDB.png){: .align-center}{: width="70%" height="70%"}  

사용할 데이터는 서울특별시의 **시도 경계**(`TL_SCCO_CTPRVN`)와 **도로구간**(`TL_SPRD_MANAGE`)이며, 간단하게 QGIS로 시각화한 결과는 아래와 같다.  
도로구간 데이터는 **도로 위계**(`ROA_CLS_SE`)별로 분류한 예시이다.  
고속도로 등으로 분류가 되어 있긴 하지만, 기능적 특성에 따라 **주/보조간선도로, 집산도로, 국지도로**로 나눠지는 것을 알 수 있다.  

![png](/assets/images/gis/road_area/road_network.png){: .align-center}{: width="90%" height="90%"}  

참고로 도로명주소 전자지도 데이터들의 **좌표계는 [EPSG5179](https://yganalyst.github.io/spatial_analysis/spatial_analysis_3/#%EC%9E%90%EC%A3%BC%EC%93%B0%EB%8A%94-%EC%A2%8C%ED%91%9C%EC%A0%95%EB%B3%B4)**이며, 정의되어 있지 않기 때문에 **사용 시에 정의하고 사용**해야한다.  


## 아이디어  

작업을 위해 아이디어를 구상하고 정리한 내용들은 아래와 같다.  

**1. 메인 아이디어**  
  
- 서울특별시 boundary polygon을 도로 네트워크로 분할하자(달고나 마냥).  
- boundary가 잘 분할되도록 **도로 네트워크 전처리**  
- 잘 전처리된 도로네트워크와 Boundary간의 [Overlay](https://yganalyst.github.io/spatial_analysis/spatial_analysis_2/#overlay) 수행  

**2. 확장 가능성**  
  
- 연구자가 설정한 기준에 따라 공간 단위를 유동적으로 조정할 수 있도록 하자.  
- **도로 위계(기능적 특성)**, **도로 폭(물리적 특성)**을 parmeter로 설정  

**3. 정성적 평가**  
  
- 잘 분할되었다는 정량적 기준은 없지만, 합리적으로 분할 되었는지 평가가 필요하다.  
- case study를 통해 시각적으로 확인하고 **rule-based 로 점진적으로 보완**하는 작업을 반복  
- 평가에는 interactive하게 공간 데이터를 관찰하는데 유용한 **QGIS** 툴을 이용한다.  


<br/>

# 도로 네트워크 기반의 공간 단위 분할  

## Data 로딩

이제 필요한 python 라이브러리와 공간 데이터를 불러와보자.  
좌표계나 Geopandas 등의 활용 방법은 [이전에 포스팅한 내용](https://yganalyst.github.io/categories/#spatial-analysis)을 참고하자.  

```python
# geospatial
import geopandas as gpd
from shapely.geometry import Point, Polygon
from shapely.ops import linemerge
from fiona.crs import from_string
epsg5179 = from_string("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")

data_dir = '11000'
```

```python
# 행정구역 시도 경계와 도로 네트워크 데이터 불러오기  
sido_bnd = gpd.GeoDataFrame.from_file(data_dir + "/TL_SCCO_CTPRVN.shp", encoding='cp949')
sido_bnd.crs = epsg5179
sido_bnd['geometry'] = sido_bnd.buffer(0)

road = gpd.GeoDataFrame.from_file(data_dir + "/TL_SPRD_MANAGE.shp", encoding='cp949')
road.crs = epsg5179
road['ROA_CLS_SE'] = road['ROA_CLS_SE'].astype(int)
```

사용할 **도로구간의 특성(도로 위계, 도로 폭)**에 따라 사용할 데이터를 필터링한다. 즉, **공간 단위의 크기를 결정**하기 위함이다.  
여기서는 **도로 폭 12m(대략 왕복 4차선)**, **도로 위계가 집산도로(로) 이상**인 도로들을 활용했다.  

```python
road_bt = 12  #도로폭 
road_cls = 3  #도로 위계가 "집산도로 이상"의 도로
road = road[(road['ROAD_BT']>=road_bt) & (road['ROA_CLS_SE']<=road_cls)].reset_index(drop=True)
```

```python
ax = sido_bnd.boundary.plot(color='black', figsize=(8,8))
road.plot(ax=ax)
ax.axis(False)
```

![png](/assets/images/gis/road_area/road_network_filter.png)  


출력해보면 `LINESTRING`와 `MULTILINESTRING` 객체로 geometry가 구성되어 있음을 알 수 있다.  
`MULTILINESTRING`은 공간상으로 분리되어 있는(연결되지 않은) 2개 이상의 `LINESTRING`들을 tuple형태로 묶어서 담고있다.  

```python
# 출력
road[["RN","ROAD_BT","ROAD_LT","ROA_CLS_SE","geometry"]]
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
      <th>RN</th>
      <th>ROAD_BT</th>
      <th>ROAD_LT</th>
      <th>ROA_CLS_SE</th>
      <th>geometry</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>청계천로</td>
      <td>25.0</td>
      <td>5900.0</td>
      <td>3</td>
      <td>LINESTRING (957901.898 1952592.053, 957943.946...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>남부순환로</td>
      <td>40.0</td>
      <td>32620.0</td>
      <td>2</td>
      <td>LINESTRING (954155.800 1942052.021, 954169.217...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>효령로</td>
      <td>30.0</td>
      <td>43.0</td>
      <td>3</td>
      <td>LINESTRING (954961.592 1942339.434, 954947.911...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>동산로</td>
      <td>15.0</td>
      <td>65.0</td>
      <td>3</td>
      <td>LINESTRING (959397.909 1941217.387, 959361.593...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>도구로</td>
      <td>15.0</td>
      <td>28.0</td>
      <td>3</td>
      <td>LINESTRING (954558.854 1943022.237, 954531.591...</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>1527</th>
      <td>서부간선지하도로</td>
      <td>40.0</td>
      <td>27260.0</td>
      <td>3</td>
      <td>MULTILINESTRING ((944543.844 1945148.837, 9445...</td>
    </tr>
    <tr>
      <th>1528</th>
      <td>서부간선지하도로</td>
      <td>40.0</td>
      <td>27260.0</td>
      <td>3</td>
      <td>MULTILINESTRING ((945116.536 1946692.101, 9451...</td>
    </tr>
    <tr>
      <th>1529</th>
      <td>서부간선지하도로</td>
      <td>40.0</td>
      <td>27260.0</td>
      <td>3</td>
      <td>MULTILINESTRING ((944437.714 1943674.613, 9444...</td>
    </tr>
    <tr>
      <th>1530</th>
      <td>서부간선지하도로</td>
      <td>40.0</td>
      <td>27260.0</td>
      <td>3</td>
      <td>MULTILINESTRING ((944853.331 1945955.729, 9448...</td>
    </tr>
    <tr>
      <th>1531</th>
      <td>서부간선지하도로</td>
      <td>40.0</td>
      <td>27260.0</td>
      <td>3</td>
      <td>MULTILINESTRING ((945722.145 1940887.724, 9456...</td>
    </tr>
  </tbody>
</table>
<p>1532 rows × 5 columns</p>
</div>



## Topological Error  

육안상으로는 깔끔하고 잘 정제된 도로 네트워크이지만, 자세히 들여다보면 전처리를 해야할 사항들이 꽤 있다.  
아무래도 가장 처음에는 수동으로 도면을 그려 제작되었기 때문에 오류가 있기 마련이다.  

아래 그림은 `LINESTRING` 객체에서 발생할 수 있는 **Topological Error 유형**을 보여준다.  
**topology**란 통신 네트워크 분야에서도 많이 사용되는 개념으로, 도로 네트워크에서는 **교차로(intersection)와 끝점(end point)은 노드**로, **노드 간의 연결은 링크(edge)**로 표현된 구조를 말한다.  
따라서 **topological error**라는 것은 **이를 만족하지 않는 오류들**을 말한다.  

![png](/assets/images/gis/road_area/topological_error.png){: .align-center}{: width="60%" height="60%"}    

*Source: [gis.humboldt.edu](http://gis.humboldt.edu/olm_2018/Lessons/GIS/04%20CreatingSpatialData/DigitizingUncertainty.html)  

이러한 오류들은 경험적으로 굉장히 많은 삽질(ㅠㅠ)을 통해 발견하게 되었으며, 공간 분할 작업을 하고 다시 QGIS로 점검하는 작업(**정성적 평가**)을 반복하였다.  
(예를 들어, 분명히 분할되어야하는 공간이 분할되지 않았다던지)  
대부분 아래 그림과 같이 **Line crossing(도로 구간별로 관리되기 때문)**과 **Undershoot(진짜 오류)**들이 있었다.  

![png](/assets/images/gis/road_area/error_1.png){: .align-center}{: width="70%" height="70%"}    

또한 조금더 특이한 Case로 3개의 `LINESTRING`이 엇갈려 있는 오류(**Understring & Crossed**로 명명했다)와 행정구역 경계와 딱 맞지 않는 **Line과 Polygon 간의 Undershoot**가 있었다.  

![png](/assets/images/gis/road_area/error_2.png){: .align-center}{: width="70%" height="70%"}    

이러한 오류들을 처리하기 위해 잘 알려지진 않았지만 다양한 연구들이 진행되고 있다(실제로 논문도 나온다).  
QGIS보다 더 다양한 Toolbox를 제공하는 **ArcGIS**에서는 tolerance를 기준으로 묶어주거나 하는 [다양한 방법들](https://desktop.arcgis.com/en/arcmap/10.3/manage-data/topologies/topology-in-arcgis.htm)도 제시하고 있다.  


## Linemerge와 buffer를 이용한 전처리  

본 포스팅의 목적은 **도로 네트워크 자체를 완벽히 전처리하기 보다는 공간단위를 생성하는 것**이다.  
따라서 python으로 간단히 작업 가능한 두가지 방법을 시도했다.  

1. **Line crossing**의 해결  
    - `unary_union`을 통해 모든 `LINESTRING`을 잘게 분리하고 합집합을 도출  
    - `Linemerge`를 이용하여, 교차점에서 도로가 분리되도록 다시 병합    
    - 즉, 교차점과 도로로만 이루어진 노드와 링크 추출
2. **Undershoot**의 해결 (공간 분할과 연결)  
    - `buffer`를 아주 살짝줘서 떨어진 공간을 매워주도록 함  
    - 이 상태로 시도경계와 overlay(polygon 간)를 통해 공간 단위 생성  
    - buffer로 생긴 gap은 공간 단위를 다시 buffer로 키워줌으로써 매워주게됨  
  
  
먼저 **Line crossing**의 해결을 위한 코드는 아래와 같다.  
`unary_union`은 모든 링크를 잘게 나눈 뒤에 하나의 `MULTILINESTRING`으로 묶어줌으로써, 기존의 `MULTILINESTRING`들도 모두 `LINESTRING`으로 정리된다.  
즉, `MULTILINESTRING(LINESTRING,LINESTRING,LINESTRING,..)`와 같은 형태가 된다.  
`MULTILINESTRING`은 `LINESTRING`를 `list`로 묶어놨다고 생각하면 된다.  
`linemerge`는 이 객체를 교차점에서만 분리되도록 다시 병합해주는 역할을 한다.  


```python
road_merged = road.unary_union
print('Road : '+str(len(road_merged))+' segments')
road_merged_broken=linemerge(road_merged)
print('merged Road : '+str(len(road_merged_broken))+' segments')
print(road_merged_broken.type)
```

```
Road : 7191 segments
merged Road : 6833 segments
MultiLineString
```

다음으로 **Undershoot**의 해결을 위해 buffer를 사용했다.  
[buffer](https://yganalyst.github.io/spatial_analysis/spatial_analysis_2/#buffer--envelope)를 활용할 때 parameter인 `cap_style`과 `join_style`을 사용해서 둥글둥글하게 merge되지 않도록 했다.  

buffer함수에서 두 인자는 1값(round)으로 둥글게 확장되도록 되어있는데,  
`buffer(distance, cap_style=1, join_style=1)`   
**cap_style은 End point**를, **join_style은 꺽이는 부분**에 대한 설정값이다.  

![png](/assets/images/gis/road_area/buffer_opt.png){: .align-center}  

따라서 여기서는 아래 예시처럼 사각형으로 잡기위해 **각각 3과 2로 설정**되도록 했다.  

```python
test_line = LineString([(1,1),(3,3),(5,1)])
test_line = gpd.GeoSeries(test_line)

ax = test_line.buffer(1,cap_style=3, join_style=2).boundary.plot(figsize=(6,6),color='red',linewidth=5, label="cap2_join3")
test_line.buffer(1,cap_style=1, join_style=1).boundary.plot(ax=ax,color='blue', linewidth=3,  label="cap3_join2")
test_line.plot(ax=ax, color='black', label="line")
plt.legend()
plt.show()
```

![png](/assets/images/gis/road_area/buffer_opt_ex.png)  

이렇게 buffer를 통해 topological error를 해결하고, **바로 overlay를 할 경우 buffer된 구간만큼 gap** 이 생긴다.  
이 gap을 공간 분할 후에 다시 매워주어야 한다.  
즉, 아래 예시처럼 **overlay를 할때 생기는 gap(3)은 line을 보정했던것과 동일하게 polygon에 buffer를 해줌(4)으로써 매워줄 수 있다.**  

![png](/assets/images/gis/road_area/buffer_opt_ex2.png)  


다시 도로네트워크로 돌아와 위 방법을 적용해보자.  
앞 섹션에서 교차점에서만 분리된 링크들을 가지고 `buffer`를 적용한 뒤에, 다시 `unary_union`으로 합집합을 만든다.  

```python 
# 앞의 MultiLinestring객체를 GeoDataFrame으로 전환  
df = gpd.GeoDataFrame({'geometry':road_merged_broken}, geometry='geometry').reset_index().rename({'index':'id'}, axis=1)
df.crs = epsg5179

# buffer 적용 및 합집합 추출
df['buffer'] = df.buffer(0.1, cap_style=3,join_style=2)
df = df.set_geometry("buffer")
disv = df.unary_union
disv = gpd.GeoDataFrame({'geometry':disv}, geometry='geometry')
disv.crs = epsg5179
```

이제 시도 경계와 overlay를 통해 차집합(difference)을 추출한다.  
다시 gap을 매워줄때 0.1m만큼만 보정하지 않고, 0.15m 이후 다시 0.05m를 빼주는 식으로 진행했다.  
`explode()`는 `GeoDataFrame`을 유지한 상태에서 multipolygon을 풀어 별도의 row로 만들어주는 함수이다.  
마지막으로 면적을 계산하고, 의미 없는 공간 단위는 제외했다.  

```python
result = gpd.overlay(sido_bnd, disv, how='difference')
result = gpd.GeoDataFrame({'geometry':list(result.geometry[0])}, geometry='geometry')
result['geometry'] = result.buffer(0.15, cap_style=3,join_style=2).buffer(-0.05, cap_style=3,join_style=2)
result.crs = epsg5179

# explode MultiPolygon
result = result.explode().reset_index(drop=True)
result['area'] = result.area
result = result[result['area']>=1].reset_index().rename({'index':'id'}, axis=1)

print("Total Areas:",len(result))
```

```
Total Areas: 1238
```

1차적으로 시도해본 결과, 서울특별시는 **약 1,238개의 공간단위**로 분할되었으며, 아래와 같이 비교적 격자형 도로를 가진 강남구를 보면 잘 나누어진 것을 확인할 수 있다.  

```python
ax = result.plot(figsize=(10,10), color='grey')
result.boundary.plot(ax=ax, color='white')
ax.axis(False)
plt.show()

# 강남구 부근만 확대
ax = result.plot(figsize=(5,5), color='grey')
result.boundary.plot(ax=ax, color='white')
plt.ylim([1943000,1946000])
plt.xlim([958000,961000])
plt.show()
```


![png](/assets/images/gis/road_area/ex_result1.png)  

![png](/assets/images/gis/road_area/ex_result2.png)  

## Filling Holes in Polygon  

결과물을 QGIS로 확인하다보니 아래 그림과 같이 특정 공간 단위 내에 구멍(holes) 같은 틈이 있는 것들이 존재했다.  

- 1,2번: 하나는 hole이 있는 polygon이고, hole 역할을 하는 다른 polygon이 존재한다.  
- 3번: hole이 있는 polygon만 존재한다.  

![png](/assets/images/gis/road_area/error_3.png){: .align-center}{: width="70%" height="70%"}  

이런 객체들은 하나의 polygon은 맞기 때문에, Multypolygon으로 식별되지 않는다. 즉, **Linestring으로 식별**해야한다.  
아래와 같이 **boundary**를 통해 Linestring으로 만들면, **내부 Line과 외부 Line으로 이루어진 MultiLinestring**이된다.  

```python
result[result.boundary.geom_type=='MultiLineString']
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
      <th>geometry</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>50</th>
      <td>53</td>
      <td>POLYGON ((967919.376 1941743.219, 967937.161 1...</td>
      <td>7.587746e+05</td>
    </tr>
    <tr>
      <th>274</th>
      <td>277</td>
      <td>POLYGON ((959798.112 1940576.647, 959798.112 1...</td>
      <td>5.008997e+06</td>
    </tr>
    <tr>
      <th>360</th>
      <td>364</td>
      <td>POLYGON ((960078.740 1949128.005, 960078.740 1...</td>
      <td>6.724393e+05</td>
    </tr>
    <tr>
      <th>413</th>
      <td>417</td>
      <td>POLYGON ((949597.545 1958564.584, 949597.545 1...</td>
      <td>4.690768e+07</td>
    </tr>
    <tr>
      <th>540</th>
      <td>544</td>
      <td>POLYGON ((957314.562 1952185.583, 957314.562 1...</td>
      <td>1.950646e+05</td>
    </tr>
  </tbody>
</table>
</div>


이러한 객체들은 5개밖에 존재하지 않으나, 언제 어디서 문제가 될지 모르기 때문에 작업해보자.  
(데이터 하나하나도 소중히 해야한다..)  
아이디어는 아래그림 처럼 식별된 Linestring들 중에 **area가 큰 것만 남기고 나머지는 버리는 간단한 방법**이다.  

![png](/assets/images/gis/road_area/fill_holes.png){: .align-center}{: width="85%" height="85%"}  

다시 도로 네트워크로 돌아와서 아래와 같이 구현했다.  

```python
holes_poly = result[result.boundary.geom_type=="MultiLineString"].reset_index(drop=True)
fine_poly = result[result.boundary.geom_type!="MultiLineString"].reset_index(drop=True)

for i in range(len(holes_poly)):
    bnd = holes_poly.geometry.loc[i].boundary
    ls_area = {}
    for j in list(bnd):
        
        pl = Polygon(j) # boundary를 다시 Polygon으로
        ls_area[Polygon(j).area] = pl
    print("max area in 1 polygon :", max(ls_area))
    final = ls_area[max(ls_area)] # 가장 큰 area 식별
    holes_poly.loc[i, 'geometry'] = final # 교체
result_final = fine_poly.append(holes_poly, ignore_index=True)
```

마지막으로 hole 역할을 했던 polygon은 제외처리 한다(3번 케이스).  

```python
remove_id = []
for i in range(len(result_final)):
    stand_poly = result_final.iloc[i].geometry
    rest_poly = result_final.iloc[result6.index != i]
    ls_ = rest_poly['id'][rest_poly.within(stand_poly)]
    if len(ls_) != 0:
        remove_id += ls_
result_final = result_final[~result_final['id'].isin(remove_id)].reset_index(drop=True)
result_final['id'] = result_final.index

print("Total areas:" ,len(result_final))
```

```
Total areas: 1235
```


최종 결과물 저장...

```python
result_final.to_file("result_final.shp")
```


<br/>

# Summary  

드디어.. 최종 결과물은 아래와 같이 나왔다. color는 의미는 없고 color가 잘 보이도록 id에 따라 random하게 찍은 것이다.  

![png](/assets/images/gis/road_area/final_result.png){: .align-center}{: width="90%" height="90%"}  


나름은 완성도 있다고 생각은 하지만, 들여다보면 여기는 분할되거나 묶여야할 것 같은 공간들이 아직 많이 보인다.  
그러나 실제로 어떻게 묶이고 분할되면 좋을지는 판단하는 사람(Local people)에 따라서도 다를 것이며, 본 포스팅에서는 Error로 판단되는 공간 데이터의 처리에 집중하였다.  
기존의 목표와 부합하고 2가지 측면에서 의미가 있다고 생각한다.  

**1. 정부에서 제공하는 행정구역보다 작은 공간 단위를 가진다.**  
**2. 정량적인 기준(도로 폭, 도로 위계)을 사용하여 논리적인 근거가 뒷받침 될 수 있다.**  


<br/>

# Reference  
