---
title:  "[GIS] 좌표 정의 및 변환 방법, 자주쓰는 좌표계"
excerpt: "공간정보 데이터의 좌표를 정의하고 변환하는 방법을 알아보자."
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
  - crs
  - to_crs
  - fiona
  - shapely
  - 좌표
  - 좌표계
  - coordinate
  - coordinate system
  - 투영
  - 지리좌표계
  - 투영좌표계
  - 위경도
  - wgs84
  - grs80
  - EPSG
  - 5179
  - TM
  - UTM
  - 타원체



last_modified_at: 2020-12-28T19:00-19:30
---

# 개요  

![png](/assets/images/gis_logo.jpg){: .align-center}{: width="60%" height="60%"}  

이번 포스팅에서는 다양한 공공데이터의 좌표정의를 위해 사용되는 좌표계들을 소개하고, 좌표계를 정의하고 변환하는 방법들에 대해서 알아보자.  


앞서 [공간정보데이터의 기본](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/)과 [여러 공간연산 방법](https://yganalyst.github.io/spatial_analysis/spatial_analysis_2/)에 대해 알아봤었다. 하지만 어쩌면 좌표계는 공간데이터를 다루면서 가장 기초가 된다고 할 수 있다.  

좌표계 및 측량 기법과 관련해서는 그 역사(?)와 굉장히 심오하고도 어려운 내용들이 많이 있다.  
하지만 어려운건 모두 배제하고 우리가 공간데이터를 분석하면서 알아두면 될 내용 3가지 정도만 간략하게 배워보자.  

1. 어떤 좌표계가 있는지?
2. 어떻게 좌표를 정의하는지?
3. 어떻게 좌표를 변환하는지?

  
<br/>
# 1. 좌표계의 종류  

좌표계는 크게 **지리좌표계(경도와 위도)**와 **투영좌표계(미터)**로 나누어진다.  

## 1-1. 지리좌표계  

![jpg](/assets/images/gis/crs/earth1.jpg){: .align-center}  

지리좌표계란, 지구상에 위치를 좌표로 표현하기 위해 **3차원의 구면을 이용하는 좌표계**를 의미한다. 한 지점은 **경도(longitude)**와 **위도(latitude)**로 표현되며 이 단위는 **도(degree)**로 표시된다.  


![jpg](/assets/images/gis/crs/earth.jpg){: .align-center}{: width="80%" height="80%"}  

위 그림과 같이 사실 지구는 원이 아니라 타원체인데, 3차원의 지구를 좌표로 표현하기 위해서 지오이드(geoid)라는 방법론도 제안되었으나, 복잡성을 배제하기 위해 결과적으로는 평평한 타원체로 정의가 되있고 이를 지구 타원체(Earth Ellipsoid)라고 한다.  

이 타원체의 중심점(datumn)을 기반으로 측량을 하고 좌표를 통해 표현하게 되는데, 세계적으로 통일성을 유지하기 위해 국제 표준 타원체인 GRS80과 WGS84가 제시되었다.  
(**하지만 위 두 좌표 모두 지구의 중심을 타원체의 원점으로 정의해 차이가 없이 사용된다.**)  
위 좌표계가 바로 우리가 흔히 알고 있는 기본 위경도 좌표로, [공간데이터 기본 이해하기](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/#2-2-%EA%B3%B5%EA%B0%84%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%8B%9C%EA%B0%81%ED%99%94)포스팅에서도 나왔지만 경도(x)와 위도(y)를 갖고 있는 데이터라면 WGS84좌표라고 생각하면 된다.  


## 1-2. 투영좌표계  

투영좌표계란, 위 3차원 위경도 좌표를 2차원 평면 상으로 나타내기 위해 투영(projection)이라는 과정을 거치게 되는데 이 투영된 좌표를 투영좌표계라고 한다.  

이 투영방법에 따라서도 여러가지 체계로 분류가 되는데, 크게 2가지로 분류한다.  

- TM(Transverse meractor) : 횡단원통등각투영법  
- UTM(Universal Transcerse Mercator)

두 투영방법은 같은 계산법을 거치지만 상수가 다를 뿐이다. **우리나라의 경우 TM좌표계를 기반으로 국가 기본도를 제작**하고 있으며, UTM은 군사지도나 단일원점을 사용하는 일부 부처에서 부분적으로 사용한다.  

정리하자면  

> 지리좌표계 : 위경도 좌표계, 3차원, WGS84  
> 투영좌표계 : 미터 좌표계, 2차원, TM또는 UTM  


## EPSG코드  

좌표계를 찾아보면서 위에서 언급한 TM, UTM, WGS, GRS와 같은 명칭 뿐아니라 EPSG로 표기한 명칭도 볼 수가 있다.  
**EPSG는 이렇게 다양한 전세계 좌표계에 대한 고유한 명칭이다.**  

지구를 표현할때, 

- 어떤 타원체(WGS84, GRS80)?  
- 어디를 중심으로(지리좌표계)?
- 어떻게 변환(투영법, TM, UTM)?

할거냐에 따라서 다양한 좌표계가 생겨나기 때문에, 이를 **EPSG라는 표준 고유 코드**를 만들어둔 것이다. 예를 들면, 아래와 같이 각기 다른 좌표계 생성 방식에 따라 구분이 필요하기 때문이다.  

- 지리좌표계 : WGS84 => **EPSG4326**  
- 투영좌표계 : GRS80타원체를 UTM-k로 투영한 좌표계 => **EPSG5179**  

특히 위경도 좌표의 경우에 같은 좌표계지만 WGS84, GRS80, EPSG4326와 같이 표현되면서 혼동할 수가 있다. 따라서 고유 코드인 EPSG코드를 알아두면 헷갈리지 않고 좌표계를 활용할 수 있다.  

각 좌표에 대한 코드별 문자열들은 [여기](https://www.osgeo.kr/17)에 자세하게 정리가 되어 있다.  

  
<br/>
# 2. 좌표계의 정의  

이제 좌표계의 종류에 대해 알아봤으니, 본격적으로 Python을 활용해서 공간데이터의 좌표계를 어떻게 정의하는지 알아보자.  

예제 데이터와 기본 셋팅은 [이전 포스팅](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/#1-%EA%B3%B5%EA%B0%84-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%83%9D%EC%84%B1)을 참고하자.  

```python
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon, LineString

seoul_area = gpd.GeoDataFrame.from_file('data/LARD_ADM_SECT_SGG_11.shp', encoding='cp949')
pt_119 = pd.read_csv('data/서울시 안전센터관할 위치정보 (좌표계_ WGS1984).csv', encoding='cp949', dtype=str)
pt_119['경도'] = pt_119['경도'].astype(float)
pt_119['위도'] = pt_119['위도'].astype(float)
pt_119['geometry'] = pt_119.apply(lambda row : Point([row['경도'], row['위도']]), axis=1)
pt_119 = gpd.GeoDataFrame(pt_119, geometry='geometry')
```


## 2-1. crs  

[이전 포스팅](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/#1-%EA%B3%B5%EA%B0%84-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%83%9D%EC%84%B1)에서도 설명했지만, Geopandas는 shapely(공간객체 담당)와 fiona(좌표담당)를 같이 활용한다.  
좌표계는 `fiona.crs`의 `from_string`을 통해 생성할 수 있다.  

```python
from fiona.crs import from_string
epsg4326 = from_string("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
```

먼저 지리좌표계인 EPSG4326(WGS84)좌표계를 생성했다. function에 들어갈 문자열은 위에 설명했던 EPSG코드 링크에 나와있는 것을 복사해서 사용하면 된다.  

또한 앞서 불러온 공간데이터의 좌표계를 확인할때는 `.crs`메소드를 통해 해당 geodataframe의 좌표계를 확인할 수 있다.  

```python
print(seoul_area.crs)
print(pt_119.crs)
```

```
{'init': 'epsg:5179'}
None
```

서울시 법정동경계(seoul_area)는 좌표계가 이미 정의되어 있는 shp파일을 불러왔으므로 정의된 좌표계를 확인할 수 있고, 소방서 위치(pt_119)는 위경도 컬럼만 존재하던 csv를 공간객체로 직접 만들어서 아직 좌표계가 없다.  

```python
pt_119.crs = epsg4326
print(pt_119.crs)
```

```
{'proj': 'longlat', 'ellps': 'WGS84', 'datum': 'WGS84', 'no_defs': True}
```

이제 좌표계가 정의됐음을 확인할 수 있다!  

> 위경도 좌표계는 일반적으로 EPSG4326(WGS84) 좌표계를 적용하면 되지만, 위 서울특별시 법정동 경계(seoul_area)와 같이 **투영좌표계(TM)**는 구득하려는 사이트나 제공기관에서 어떤 좌표계를 사용해 생성된 공간 데이터인지를 정확하게 인지하고, 그에 맞게 적용해줘야 한다.  

`init`을 통해 내장된 좌표계를 사용할 수도 있지만, `fiona`를 활용해 문자열을 직접 적용해 주는 것이 정확하다.  


  
<br/>
# 3. 좌표계의 변환  

두 데이터의 좌표계를 모두 정의했으니, 이제 공간분석이 가능하도록 하나의 좌표로 통일해야 하는데 이때 변환이 필요하다.  

일반적으로 공간분석은 도(degree)단위가 아닌 미터(meter)단위로 작업을 하기 때문에, 투영좌표계(TM)로 통일시켜주는게 좋다.  

## 3-1. to_crs  

좌표 변환은 `to_crs`함수로 할 수 있으며, 기존 좌표가 정의되어 있어야만 가능하다. EPSG5179로 변환해보자.  

좌표를 먼저 생성하고,  

```python
epsg5179 = from_string("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")
```

변환!  

```python
pt_119 = pt_119.to_crs(epsg5179)
pt_119["geometry"].head()
```

```
0     POINT (944285.707763575 1947726.390537433)
1    POINT (964384.6573976473 1956833.993247274)
2    POINT (957313.2935830182 1943279.262784532)
3     POINT (952138.2406865631 1947752.94696052)
4     POINT (954174.228813116 1949633.598265431)
Name: geometry, dtype: object
```

Geometry를 확인해보면 위경도(127...., 37....)의 단위가 미터단위로 변경된 것을 확인할 수 있다.  



  
<br/>
# 기타  

## 자주쓰는 좌표정보  

이렇게 다양한 공간데이터를 사용할때, 원래 어떤 좌표계가 무엇인지 정확하게 제시가 안되어 있는 경우도 많고 제공기관마다 다른 좌표계를 사용하기 때문에 자주쓰는 것들을 정리해보았다.  

| EPSG code | 좌표종류 | 데이터명 | 제공기관 |
|:---:|:---:|:---:|:---:|
| 4326 | 지리좌표계 |  | 좌표가 도(degree)단위라면 모두! |
| 5174 | 투영좌표계(TM) | 용도지역 | 국가공간정보포털 |
| 5174 | 투영좌표계(TM) | GIS건물통합정보 | 국가공간정보포털 |
| 5174 | 투영좌표계(TM) | 토지이용 | 국가공간정보포털 |
| 5174 | 투영좌표계(TM) | 연속지적도 | 국가공간정보포털 |
| 5174 | 투영좌표계(TM) | 용도지역 | 국가공간정보포털 |
| 5174 | 투영좌표계(TM) | 지방행정인허가 | 행정안전부 |
| 5179 | 투영좌표계(TM) | 도로명주소 전자지도 | 도로명주소 |
| 5179 | 투영좌표계(TM) | 도로명주소 배경지도 | 도로명주소 |
| 5179 | 투영좌표계(TM) | 네이버 지도 | 네이버 |
| 5181 | 투영좌표계(TM) | 카카오맵(다음지도) | 카카오 |
| 5186 | 투영좌표계(TM) | 산림입지토양도 | 산림청 |
| 5186 | 투영좌표계(TM) | 초중고등학교 학군경계 | 한국교원대학교 |
| KOTI-KATEC | KATEC | 국가교통DB | 한국교통연구원(KOTI) |

기본적으로 제공기관이 같다면 좌표계도 동일한 경우가 대다수다.  
위에서 설명한 자주쓰는 좌표들은 [github](https://github.com/yganalyst/spatial_analysis/blob/master/crs_info.py)에 정리를 해두었으니 활용하면 된다.  


## 좌표가 정확히 안맞는 문제  

위 방법처럼 정확하게 좌표를 정의하고, 동일하게 변환해주었음에도 딱 안맞는 경우가 생긴다(삽질의 시작..).  

경험적으로 알게된 사실이지만 통일해야할 좌표계 중 EPSG5174,5186,KOTI-KATEC(그냥 안맞으면 한번 적용해보세요)가 존재하는 경우, 단순하게 좌표변환만 실시하게 되면 약 30m정도의 이격이 발생한다.  

```python
epsg5181_qgis = from_string("+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
```

이럴때 위 좌표계로 통일시켜주면 정확히 맞는다.  

위는 QGIS에서 제공하는 EPSG5181좌표계로 정식 좌표 문자열과 달리 `+towgs84=0,0,0,0,0,0,0`가 추가되어 있다. 정확한 이유는 아직 잘 모르지만 해당 좌표계로 통일시켜주면 맞는다.  



  
<br/>
# Reference  

https://www.biz-gis.com/index.php?mid=pds&document_srl=65754  

https://niceguy1575.tistory.com/entry/GIS%EC%9D%98-%EA%B8%B0%EC%B4%88-%EC%A2%8C%ED%91%9C%EA%B3%84%EC%99%80-%ED%88%AC%EC%98%81%EB%B2%95  

http://www.gisdeveloper.co.kr/?p=8942  






