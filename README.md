# Bootstrap, Jade and LESS Template-App

### Setup
#### Requirements

* nodejs
* npm
* bower
* gulp

#### Install 
* Download NodeJs from [http://nodejs.org/download/] and install it.
* Install gulp global, run > `npm install gulp -g`
* Install bower global, run > `npm install bower -g`


#### Build instructions.
Getting startet in Commandline/Terminal

##### 1. Clone git repository.
```
git clone git@github.com:pure180/DefaultTemplate.git
```
##### 2. Install applikation dependencies
Navigate to the applikation folder on your computer (cd DefaultTemplate), then run:

1. `npm install` > This will install all needed packages  
2. `gulp bower-update` > This will install all needed bower dependencies and copy them to the source folder
3. `gulp start` > to start developing