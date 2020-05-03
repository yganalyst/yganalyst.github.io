---
title:  "[Kaggle] 타이타닉 생존자 예측모델 3 - modeling"
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
  - feature engineering


last_modified_at: 2019-12-06T19:00-19:30
---


이번 포스팅에서는 기계학습이 가능한 형태로 정제된 데이터셋을 여러가지 모델에 적용하여 캐글 프로젝트에 제출해 보는 시간을 가져보기로 하자.  

## 1. 문제 정의  

- y가 이진변수(생존 or 사망)인 classification 문제  
- 독립변수의 상관성, 다중공선성은 고려하지 않음  
- 독립변수는 모두 categorical 변수(단순 binning만 실시한 상태)  
- 결측처리는 완료  


앞서 전처리한 내용을 압축해서 다시 run  


```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

mydir = r'D:\Python\kaggle\titanic\\'
train = pd.read_csv(mydir + "train.csv")
test = pd.read_csv(mydir + "test.csv")
```


```python
dict_ = {'train':train,'test':test}
sex = {'male':1, 'female':2}
age_bin = {'child':1, 'young':2,'adult':3, 'middle':4, 'senior':5}
fare_bin = {'low':1,'mid':2,'high':3,'exp':4}
embarked = {'C':1,'Q':2,'S':3}
name_fix = {'Mr':1,'Mrs':2,'Miss':3,'Master':4,'Others':5}

for df_nm in dict_:
    df = dict_[df_nm].copy()
    # Name추출
    df['Name_fix'] = df['Name'].str.extract('( [A-Z]+\w*)', expand=False).str.strip()
    df['Name_fix'] = np.where(df['Name_fix'].isin(['Mr','Miss','Mrs','Master']), df['Name_fix'], 'Others')
    # Age결측처리
    df['Age_median'] = df.groupby(['Name_fix'])['Age'].transform('median')
    df['Age'] = np.where(df['Age'].isnull(), df['Age_median'], df['Age'])
    
    if df_nm == 'train':
        # Embarked 결측처리(train set)
        df['Embarked'].fillna("S", inplace=True)
    if df_nm == 'test':
        # Fare 결측처리(test set)
        df['Fare_median'] = df.groupby(['Pclass'])['Fare'].transform('median')
        df['Fare'] = np.where(df['Fare'].isnull(), df['Fare_median'], df['Fare'])

    # Age 범주화
    bins = [0, 16, 32, 48, 64, 81]  # 나이대 경계점
    bin_names = ['child','young','adult','middle','senior'] # 라벨
    df['Age_bin'] = pd.cut(df['Age'],
                              bins = bins,
                              labels=bin_names,
                              include_lowest = True)
    # Fare 범주화
    bins = [0, 17, 25, 100, 600]  # 나이대 경계점
    bin_names = ['low','mid','high','exp'] # 라벨
    df['Fare_bin'] = pd.cut(df['Fare'],
                              bins = bins,
                              labels=bin_names,
                              include_lowest = True)
    
    # 파생변수(가족구성원 수)
    df['Family_cnt'] = df['SibSp'] + df['Parch']
    
    # 숫자형 변환
    df.replace({"Sex": sex}, inplace=True)
    df.replace({"Age_bin": age_bin}, inplace=True)
    df.replace({"Fare_bin": fare_bin}, inplace=True)
    df.replace({"Embarked": embarked}, inplace=True)
    df.replace({"Name_fix": name_fix}, inplace=True)
    
    dict_[df_nm] = df.copy()
```


```python
feature_1 = ['Survived','Pclass','Sex','Age_bin','Family_cnt','Fare_bin','Embarked','Name_fix']

train = dict_['train'][feature_1].copy()
test = dict_['test'][['PassengerId']+feature_1[1:]].copy()
```

train set에서 독립변수, 종속변수 분리  


```python
train_data = train[feature_1[1:]].copy()
target = train[['Survived']].copy()
```

## 2. 모델선택 및 검증   

binary classification 문제에서 공부했었던 대표적인 모델들을 사이킷런 라이브러리를 통해 사용해보자. 
- Support Vector Machines  
- Stochastic Gradient Descent  
- Random Foreset
- Decision Tree
- KNeighborsClassifier





```python
from sklearn.svm import SVC
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier

from sklearn.model_selection import cross_val_score, cross_val_predict
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import StratifiedKFold
from sklearn.model_selection import KFold
from sklearn.model_selection import train_test_split
```


```python
X_train, X_test, y_train, y_test = train_test_split(train_data, target, test_size = 0.2, random_state=42)
```


```python
clf = SVC()
for model in [SVC(),SGDClassifier(),RandomForestClassifier(),DecisionTreeClassifier(),KNeighborsClassifier()]:
    clf = model
    clf.fit(X_train, y_train)
    accuracy = round(clf.score(X_test, y_test) * 100, 2)
    print(type(model).__name__ + " : " + str(accuracy) + "%")
```

    SVC : 82.12%
    SGDClassifier : 81.56%
    RandomForestClassifier : 83.24%
    DecisionTreeClassifier : 81.56%
    KNeighborsClassifier : 80.45%
    

모델의 성능측정을 더 정교하게 하기 위하여 교차검증을 사용한다.  
일반적으로 학습 데이터를 k개로 분리하여 교차 검증을 실시하는 `Kfold` cross validation이 있다.  
또한 이러한 이진 분류 문제에서 레이블이 왜곡되어 있는 경우(생존자가 훨씬 많거나 그 반대의 경우), 계층적 샘플링이 필요하다.  
이를 위한 method로 `StratifiedKFold`를 이용한다.  


```python
skfolds = StratifiedKFold(n_splits=5, random_state=42) 
kfolds = KFold(n_splits=5, shuffle=True, random_state=42)

for model in [SVC(),SGDClassifier(),RandomForestClassifier(),DecisionTreeClassifier(),KNeighborsClassifier()]:
    clf = model
    score = cross_val_score(clf, train_data, target, cv=kfolds, scoring='accuracy')
    avg_score = round(np.mean(score) * 100)
    print(type(model).__name__ + " : " + str(avg_score) + "%")
```


    SVC : 83.0%
    SGDClassifier : 73.0%
    RandomForestClassifier : 82.0%
    DecisionTreeClassifier : 80.0%
    KNeighborsClassifier : 80.0%
    


## 3. Test  

교차검증 모델에서 가장 정확도가 높은 SVC를 선택하여, 이제 드디어 test 데이터셋에 적용해보자.  


```python
svc_clf = SVC()
svc_clf.fit(train_data, target)
predict = svc_clf.predict(test[feature_1[1:]])
submission_df = pd.DataFrame({'PassengerId':test['PassengerId'],
                            'Survived':predict})
submission_df.head()
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
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>892</td>
      <td>0</td>
    </tr>
    <tr>
      <td>1</td>
      <td>893</td>
      <td>1</td>
    </tr>
    <tr>
      <td>2</td>
      <td>894</td>
      <td>0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>895</td>
      <td>0</td>
    </tr>
    <tr>
      <td>4</td>
      <td>896</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>


```python
submission_df.to_csv('submission.csv', index=False)
```

## 4. Submission  

이제 `submission.csv`파일을 제출해보자.  

1. titanic competition 입장  
2. Submit Predictions 클릭  
3. 파일 드래그  
4. Jump to your position on the leaderboard 클릭  
5. 리더보드의 내 랭킹 확인  

![png](/assets/images/kaggle/titanic_8.png)  


단순히 하나의 프로젝트를 완성하여 캐글에 결과를 제출해보는 하나의 튜토리얼 형식으로 진행해보았다.  
모델의 고도화를 위해서 다시 EDA, feature engineering 단계를 거치고 필요하다면 모델의 파라미터 튜닝을 실시하며 더욱 정확한 모델을 만들기위하여 다양한 사람들이 경쟁하고 있다.  


앞으로 더 많은 경쟁에 참여해 보면서 공부해보면 좋을 것 같다.  