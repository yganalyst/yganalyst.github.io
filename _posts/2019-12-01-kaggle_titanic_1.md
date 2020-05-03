---
title:  "[Kaggle] 타이타닉 생존자 예측모델 1 - EDA"
excerpt: "캐글 compoetition의 가장 기본인 타이타닉 생존자 예측 예제를 공부해보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/kaggle_logo.jpg

categories:
  - competition

tags:
  - python
  - 데이터
  - 기초
  - 데이터 분석
  - 캐글
  - kaggle
  - 프로젝트
  - project
  - machine learning
  - classification
  - titanic
  - prediction
  - eda


last_modified_at: 2019-12-01T19:00-19:30
---

## 1. 데이터 기본정보  

- url : https://www.kaggle.com/c/titanic  
- train set : 891 row
- test set : 418 row
- Classification Problem


```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

mydir = r'D:\Python\kaggle\titanic\\'
df = pd.read_csv(mydir + "train.csv", dtype=str)
```


```python
df.head()
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
      <th>PassengerId</th>
      <th>Survived</th>
      <th>Pclass</th>
      <th>Name</th>
      <th>Sex</th>
      <th>Age</th>
      <th>SibSp</th>
      <th>Parch</th>
      <th>Ticket</th>
      <th>Fare</th>
      <th>Cabin</th>
      <th>Embarked</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>3</td>
      <td>Braund, Mr. Owen Harris</td>
      <td>male</td>
      <td>22</td>
      <td>1</td>
      <td>0</td>
      <td>A/5 21171</td>
      <td>7.25</td>
      <td>NaN</td>
      <td>S</td>
    </tr>
    <tr>
      <td>1</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
      <td>Cumings, Mrs. John Bradley (Florence Briggs Th...</td>
      <td>female</td>
      <td>38</td>
      <td>1</td>
      <td>0</td>
      <td>PC 17599</td>
      <td>71.2833</td>
      <td>C85</td>
      <td>C</td>
    </tr>
    <tr>
      <td>2</td>
      <td>3</td>
      <td>1</td>
      <td>3</td>
      <td>Heikkinen, Miss. Laina</td>
      <td>female</td>
      <td>26</td>
      <td>0</td>
      <td>0</td>
      <td>STON/O2. 3101282</td>
      <td>7.925</td>
      <td>NaN</td>
      <td>S</td>
    </tr>
    <tr>
      <td>3</td>
      <td>4</td>
      <td>1</td>
      <td>1</td>
      <td>Futrelle, Mrs. Jacques Heath (Lily May Peel)</td>
      <td>female</td>
      <td>35</td>
      <td>1</td>
      <td>0</td>
      <td>113803</td>
      <td>53.1</td>
      <td>C123</td>
      <td>S</td>
    </tr>
    <tr>
      <td>4</td>
      <td>5</td>
      <td>0</td>
      <td>3</td>
      <td>Allen, Mr. William Henry</td>
      <td>male</td>
      <td>35</td>
      <td>0</td>
      <td>0</td>
      <td>373450</td>
      <td>8.05</td>
      <td>NaN</td>
      <td>S</td>
    </tr>
  </tbody>
</table>
</div>



변수 설명

| Colname | 설명 | Type |
|:---:|:---:|:---:|
| PassengerId | 승객 번호 | 문자형 |
| Survived | 생존여부(1: 생존, 0 : 사망) | 범주형(이진) |
| Pclass | 승선권 클래스(1 : 1st, 2 : 2nd ,3 : 3rd) | 범주형 |
| Name | 승객 이름 | 문자형 |
| Sex | 승객 성별 | 범주형(이진, 남자 or 여자) |
| Age | 승객 나이 | 연속형 |
| SibSp | 동반한 형제자매, 배우자 수 | 연속형 |
| Parch | 동반한 부모, 자식 수 | 연속형 |
| Ticket | 티켓의 고유 넘버 | 문자형 |
| Fare | 티켓의 요금 | 연속형 |
| Cabin | 객실 번호 | 문자형 |
| Embarked | 승선한 항구명(C : Cherbourg, Q : Queenstown, S : Southampton) | 범주형 |

> 티켓 정보(Ticket)는 활용할 방법이 딱히 떠오르지 않는다.  
> 승객 이름(Name)에서는 Mrs, Mr, Miss 등을 뽑아내서 쓸 수 있을 것 같다.

## 2. 데이터 기초통계

개인적으로는 데이터를 read해 올 때, 처음에는 값들을 있는 그대로 가져오기 위해 `dtype=str`로 모든 값을 문자형으로 불러오는 편이다.  
이제 필요한 컬럼의 타입을 변경하자  


```python
df[['Age','Fare']] = df[['Age','Fare']].astype(float)
df[['Survived','SibSp','Parch']] = df[['Survived','SibSp','Parch']].astype(int)
```


```python
df.describe(include='all')
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
      <th>PassengerId</th>
      <th>Survived</th>
      <th>Pclass</th>
      <th>Name</th>
      <th>Sex</th>
      <th>Age</th>
      <th>SibSp</th>
      <th>Parch</th>
      <th>Ticket</th>
      <th>Fare</th>
      <th>Cabin</th>
      <th>Embarked</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>count</td>
      <td>891</td>
      <td>891.000000</td>
      <td>891</td>
      <td>891</td>
      <td>891</td>
      <td>714.000000</td>
      <td>891.000000</td>
      <td>891.000000</td>
      <td>891</td>
      <td>891.000000</td>
      <td>204</td>
      <td>889</td>
    </tr>
    <tr>
      <td>unique</td>
      <td>891</td>
      <td>NaN</td>
      <td>3</td>
      <td>891</td>
      <td>2</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>681</td>
      <td>NaN</td>
      <td>147</td>
      <td>3</td>
    </tr>
    <tr>
      <td>top</td>
      <td>773</td>
      <td>NaN</td>
      <td>3</td>
      <td>Daly, Mr. Eugene Patrick</td>
      <td>male</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>CA. 2343</td>
      <td>NaN</td>
      <td>G6</td>
      <td>S</td>
    </tr>
    <tr>
      <td>freq</td>
      <td>1</td>
      <td>NaN</td>
      <td>491</td>
      <td>1</td>
      <td>577</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>7</td>
      <td>NaN</td>
      <td>4</td>
      <td>644</td>
    </tr>
    <tr>
      <td>mean</td>
      <td>NaN</td>
      <td>0.383838</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>29.699118</td>
      <td>0.523008</td>
      <td>0.381594</td>
      <td>NaN</td>
      <td>32.204208</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>std</td>
      <td>NaN</td>
      <td>0.486592</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>14.526497</td>
      <td>1.102743</td>
      <td>0.806057</td>
      <td>NaN</td>
      <td>49.693429</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>min</td>
      <td>NaN</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>0.420000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>NaN</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>20.125000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>7.910400</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>50%</td>
      <td>NaN</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>28.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>14.454200</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>75%</td>
      <td>NaN</td>
      <td>1.000000</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>38.000000</td>
      <td>1.000000</td>
      <td>0.000000</td>
      <td>NaN</td>
      <td>31.000000</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <td>max</td>
      <td>NaN</td>
      <td>1.000000</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>80.000000</td>
      <td>8.000000</td>
      <td>6.000000</td>
      <td>NaN</td>
      <td>512.329200</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



기초 통계표를 통해 다음 사항을 확인할 수 있었다.  

- 결측치는 Age와, Cabin, Embarked 변수에 존재  
- 생존확률은 891명 중 약 38.4%  
- 남성이 577명으로 여성보다 많음  
- 승선 항구는 Southampton이 644명으로 가장 많음
- 티켓 클래스는 3개의 등급으로 3등급이 약 50%를 차지함(491명)
- 티켓요금의 경우 극단치(512)가 존재   

> 승객 연령(Age), 승선항구(Embarked)의 경우 결측값에 대한 처리가 필요할 것 같다.(삭제하거나, 대체하거나)

## 3. 시각화를 통한 탐색 

우선 각 변수별로 생존여부와 어떤 관계가 있는지 간단하게 시각화를 통해 파악을 시작해보자.  

범주형 변수인 **성별(Sex), 클래스(Pclass), 승선 항구(Embarked)별 생존여부에 따른 도수분포표**이다. 


```python
def bar_df(colname):
    global df
    surv = df[df['Survived']==1][colname].value_counts()
    dead = df[df['Survived']==0][colname].value_counts()
    tt = pd.DataFrame([surv,dead], index=['Survived','dead'])
    return tt
```


```python
eda_cols =['Sex','Pclass','Embarked']
fig = plt.figure(figsize=(15,7))
for i in range(len(eda_cols)):
    ax1 = plt.subplot(2,len(eda_cols),i+1)
    df[eda_cols[i]].value_counts().plot(kind='bar', ax=ax1)    
    plt.title(eda_cols[i] + " - Histogram", fontsize=15)
    plt.xticks(rotation=0)
    ax2 = plt.subplot(2,len(eda_cols),i+4)
    bar_df(eda_cols[i]).plot(kind='bar', stacked=True, ax=ax2)
    plt.title(eda_cols[i], fontsize=15)
    plt.xticks(rotation=0)
plt.show()
```


![png](/assets/images/kaggle/titanic_1.png)


feature별로 단순 생존,사망에 대한 빈도수를 관찰해본 결과,
- 남자(male),
- 낮은 클래스의 승객(3등급)이,
- Southampton에서 승선한 승객이,
상대적으로 사망자가 많다. 

하지만 단순히 위의 히스토그램과 같이 관찰했을때, 애초에 탑승자가 더 많기 때문에 사망자가 더 많은 것일 확률도 배제할 수 없다.  

이번엔 **연령대에 따른 생존여부 도수분포표**이다.  


```python
plt.figure(figsize=(15,4))
plt.subplot(131)
df['Age'].hist(bins=10, color='gray')
plt.title("Age-Histogram")
plt.subplot(132)
plt.axis([0,80,0,81])
df[df['Survived']==1]['Age'].hist(bins=15)
plt.title("Age - Survived")
plt.subplot(133)
plt.axis([0,80,0,81])
df[df['Survived']==0]['Age'].hist(bins=15)
plt.title("Age - Dead")
plt.show()
```


![png](/assets/images/kaggle/titanic_2.png)


나이대는 큰 특징은 없는 것 같다.  
탑승객들의 나이 분포와 같이 확인해 봤을때, 

- 고령자들은 상대적으로 생존확률이 적었던 것 같고,
- 어린아이 또는 미성년자들은 상대적으로 생존확률이 높았던 것으로 추측할 수 있을까?  

하지만, Age의 경우 177개의 결측값이 있기 때문에 이를 적절하게 처리하는 것이 선행되어야 할 것이다.  

다음은 **연령별, 티켓 요금 분포를 생존여부에 따른 산점도**이다.  


```python
plt.figure(figsize=(7,5))
for i in range(len(["Dead","Survived"])):
    tt = df[df['Survived']==i]
    plt.plot(tt['Age'],tt['Fare'], ".", label=["Dead","Survived"][i], alpha=0.5, markersize=8)
plt.legend()
plt.show()
```


![png](/assets/images/kaggle/titanic_3.png)


눈에 띄는 특징은 없는 것 같다.  

다음은 **승선한 항구별, 티켓 등급별 승객 수** 이다.  
승선한 지역이 상류층 지역일 경우에 티켓 등급이 상위등급인 사람이 많지 않을까 라는 생각이 들었다.  


```python
plt.figure(figsize=(7,5))
df.groupby(['Embarked','Pclass'])['PassengerId'].count().plot(kind='bar', color="darkgreen")
plt.xticks(rotation=0)
plt.show()
```


![png](/assets/images/kaggle/titanic_4.png)


애초에 Southampton지역에서 탑승한 승객이 가장 많기도 하고, Queenstown에서 탑승한 승객이 대부분 3등급이라는 사실을 제외하고는 판단짓기 어려운 결과인 것 같다.  



우선은 이제 feature engineering 단계로 넘어가서 전처리 및 파생변수 등을 생성하고
그때그때 다시 EDA를 해보기로 한다.  
